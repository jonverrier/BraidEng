""" This script will take a text and create embeddings for each text using the OpenAI API."""

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
def get_text_embedding(config, text: str):
    """get the embedding for a text"""

    embedding = get_embedding(text, 
                              engine=config.azureEmbedDeploymentName, 
                              deployment_id=config.azureEmbedDeploymentName,
                              model=config.azureEmbedDeploymentName,
                              timeout=config.openAiRequestTimeout)
    return embedding


def process_queue(config, progress, task, q, output_chunks):
    """process the queue"""

    while not q.empty():
        chunk = q.get()

        if "ada_v2" in chunk:
           output_chunks.append(chunk.copy())
        else:
           embedding = get_text_embedding(config, chunk["summary"])
           chunk["ada_v2"] = embedding.copy()
           output_chunks.append(chunk.copy())
           
        progress.update(task, advance=1)
        q.task_done()


def enrich_text_embeddings(config, markdownDestinationDir): 

   logging.basicConfig(level=logging.WARNING)
   logger = logging.getLogger(__name__)

   openai.api_type = config.apiType 
   openai.api_key = config.apiKey
   openai.api_base = config.resourceEndpoint
   openai.api_version = config.apiVersion 
   
   if not markdownDestinationDir:
      logger.error("Markdown folder not provided")
      exit(1)

   tokenizer = tiktoken.get_encoding("cl100k_base")

   total_chunks = 0
   output_chunks = []

   logger.debug("Starting OpenAI Embeddings")

   # load sessions_list from json file
   input_file = os.path.join(markdownDestinationDir, "output", "master_enriched.json")
   with open(input_file, "r", encoding="utf-8") as f:
      chunks = json.load(f)

   total_chunks = len(chunks)
   logger.info("Total chunks to be processed: %s", len(chunks))

   # add chunk list to a queue
   q = queue.Queue()
   for chunk in chunks:
      q.put(chunk)

   with Progress() as progress:
      task1 = progress.add_task("[green]Enriching Embeddings...", total=total_chunks)
      # create multiple threads to process the queue
      threads = []
      for i in range(config.processingThreads):
         t = threading.Thread(target=process_queue, args=(config, progress, task1, q, output_chunks))
         t.start()
         threads.append(t)

      # wait for all threads to finish
      for t in threads:
         t.join()

   # sort the output chunks by sourceId 
   output_chunks.sort(key=lambda x: (x["sourceId"]))

   logger.debug("Total chunks processed: %s", len(output_chunks))

   # save the embeddings to a json file
   output_file = os.path.join(markdownDestinationDir, "output", "master_enriched.json")
   with open(output_file, "w", encoding="utf-8") as f:
      json.dump(output_chunks, f)
