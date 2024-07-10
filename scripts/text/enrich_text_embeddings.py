""" This script will take a text and create embeddings for each text using the OpenAI API."""
# Copyright (c) 2024 Braid Technologies Ltd

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
from common.common_functions import ensure_directory_exists

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
    wait=wait_random_exponential(min=10, max=45),
    stop=stop_after_attempt(15),
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


def process_queue(config, progress, task, q, logger, output_chunks, current_chunks):
    """process the queue"""

    while not q.empty():
        chunk = q.get()
        found = False

        for i in current_chunks: 
           if i.get('sourceId') == chunk.get('sourceId'):           
              current_ada = i.get("ada_v2")
              if current_ada and len(current_ada) >= 10: 
                 found = True  
                 chunk["ada_v2"] = current_ada                 
                 break

        if not found:
           
           if "ada_v2" in chunk:
              output_chunks.append(chunk.copy())
           else:
              # get am embedding using chatgpt
              try:              
                 embedding = get_text_embedding(config, chunk["text"])
                 chunk["ada_v2"] = embedding.copy()
                 output_chunks.append(chunk.copy())                 
              except openai.InvalidRequestError as invalid_request_error:
                 logger.warning("Error: %s %s", chunk.get('sourceId'), invalid_request_error)
              except Exception as e:
                 logger.warning("Error: %s %s", chunk.get('sourceId'), 'Unknown error')                 
           
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

   total_chunks = 0
   output_chunks = []
   current = []

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

   # load the existing chunks from a json file
   cache_file = os.path.join(markdownDestinationDir, "output", "master_enriched.json")
   if os.path.isfile(cache_file):
      with open(cache_file, "r", encoding="utf-8") as f:
         current = json.load(f)       

   with Progress() as progress:
      task1 = progress.add_task("[green]Enriching Embeddings...", total=total_chunks)
      # create multiple threads to process the queue
      threads = []
      for i in range(config.processingThreads):
         t = threading.Thread(target=process_queue, args=(config, progress, task1, q, logger, output_chunks, current))
         t.start()
         threads.append(t)

      # wait for all threads to finish
      for t in threads:
         t.join()

   # sort the output chunks by sourceId 
   output_chunks.sort(key=lambda x: (x["sourceId"]))

   logger.debug("Total chunks processed: %s", len(output_chunks))
   
   # print(f"markdownDestinationDir = {markdownDestinationDir}")     #added for debugging 
   output_subdir = "output"
   output_file = os.path.join(markdownDestinationDir, output_subdir, "master_text.json")
   
   # Ensure the output subdirectory exists
   ensure_directory_exists(os.path.dirname(output_file))

   # save chunks to a json file
   with open(output_file, "w", encoding="utf-8") as f:
      json.dump(chunks, f, ensure_ascii=False, indent=4)




