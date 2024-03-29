""" This script will take a text column and create embeddings for each text using the OpenAI API."""

import argparse
import logging
import re
import os
import json
import threading
import queue
import time
import openai
from openai.embeddings_utils import get_embedding
import tiktoken
from tenacity import (
    retry,
    wait_random_exponential,
    stop_after_attempt,
    retry_if_not_exception_type,
)
from rich.progress import Progress

API_KEY = os.environ["OPENAI_API_KEY"] #AZURE VERSION WAS os.environ["AZURE_OPENAI_API_KEY"] 
RESOURCE_ENDPOINT = "https://api.openai.com/v1" #AZURE VERSION WAS os.environ["AZURE_OPENAI_ENDPOINT"] 
PROCESSING_THREADS = 4
OPENAI_REQUEST_TIMEOUT = 60

openai.api_type = "open_ai" #AZURE VERSION WAS "Azure"
openai.api_key = API_KEY
openai.api_base = RESOURCE_ENDPOINT
openai.api_version = "2020-11-07" #AZURE VERSION WAS "2023-07-01-preview"

tokenizer = tiktoken.get_encoding("cl100k_base")

def normalize_text(s, sep_token=" \n "):
    """normalize text by removing extra spaces and newlines"""
    s = re.sub(r"\s+", " ", s).strip()
    s = re.sub(r". ,", "", s)
    # remove all instances of multiple spaces
    s = s.replace("..", ".")
    s = s.replace(". .", ".")
    s = s.replace("\n", "")
    s = s.strip()

    return s


@retry(
    wait=wait_random_exponential(min=6, max=30),
    stop=stop_after_attempt(20),
    retry=retry_if_not_exception_type(openai.InvalidRequestError),
)
def get_text_embedding(text: str):
    """get the embedding for a text"""

    embedding = get_embedding(text, engine="text-embedding-ada-002", timeout=60)
    return embedding


def process_queue(progress, task, q, output_segments, logger):
    """process the queue"""
    while not q.empty():
        segment = q.get()

        if "ada_v2" in segment:
            output_segments.append(segment.copy())
            continue

        logger.debug(segment["title"])
        text = segment["text"]

        if len(tokenizer.encode(text)) > 8191:
            continue

        text = normalize_text(text)
        segment["text"] = text

        embedding = get_text_embedding(text)
        if embedding is None:
            output_segments.append(segment.copy())
            continue

        segment["ada_v2"] = embedding.copy()

        output_segments.append(segment.copy())
        progress.update(task, advance=1)
        q.task_done()
        time.sleep(0.2)

# convert time '00:01:20' to seconds
def convert_time_to_seconds(value):
    """convert time to seconds"""
    time_value = value.split(":")
    if len(time_value) == 3:
        h, m, s = time_value
        return int(h) * 3600 + int(m) * 60 + int(s)
    else:
        return 0


def enrich_transcript_embeddings (transcriptDestinationDir): 

   logger = logging.getLogger(__name__)
   logging.basicConfig(level=logging.WARNING)

   if not transcriptDestinationDir:
      logger.error("Transcript folder not provided")
      exit(1)

   total_segments = 0
   output_segments = []

   # load sessions_list from json file
   input_file = os.path.join(transcriptDestinationDir, "output", "master_enriched.json")
   with open(input_file, "r", encoding="utf-8") as f:
      segments = json.load(f)

   total_segments = len(segments)

   logger.debug("Starting OpenAI Embeddings")
   logger.debug("Total segments to be processed: %s", len(segments))

   # add segment list to a queue
   q = queue.Queue()
   for segment in segments:
      q.put(segment)

   with Progress() as progress:
      task1 = progress.add_task("[green]Enriching Embeddings...", total=total_segments)
      # create multiple threads to process the queue
      threads = []
      for i in range(PROCESSING_THREADS):
         t = threading.Thread(target=process_queue, args=(progress, task1, q, output_segments, logger))
         t.start()
         threads.append(t)

      # wait for all threads to finish
      for t in threads:
         t.join()

   # sort the output segments by sourceId and start
   output_segments.sort(key=lambda x: (x["sourceId"], convert_time_to_seconds(x["start"])))

   logger.debug("Total segments processed: %s", len(output_segments))

   # save the embeddings to a json file
   output_file = os.path.join(transcriptDestinationDir, "output", "master_enriched.json")
   with open(output_file, "w", encoding="utf-8") as f:
      json.dump(output_segments, f)
