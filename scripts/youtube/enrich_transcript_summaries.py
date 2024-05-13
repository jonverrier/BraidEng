""" Summarize a youtube transcript using chatgpt"""

import json
import os
import queue
import threading
import logging
import openai
from tenacity import (
    retry,
    wait_random_exponential,
    stop_after_attempt,
    retry_if_not_exception_type,
)
from rich.progress import Progress

class Counter:
    """thread safe counter"""

    def __init__(self):
        """initialize the counter"""
        self.value = 0
        self.lock = threading.Lock()

    def increment(self):
        """increment the counter"""
        with self.lock:
            self.value += 1
            return self.value

@retry(
    wait=wait_random_exponential(min=10, max=45),
    stop=stop_after_attempt(20),
    retry=retry_if_not_exception_type(openai.InvalidRequestError),
)
def chatgpt_summary(config, text, logger):
    """generate a summary using chatgpt"""

    messages = [
        {
            "role": "system",
            "content": "You are an AI Assistant for video summarization, write an authoritative " 
                       + str(config.summaryWordCount) + 
                       " word summary. Avoid starting sentences with 'This document' or 'The document'.",
        },
        {"role": "user", "content": text},
    ]

    response = openai.ChatCompletion.create(
        deployment_id=config.azureDeploymentName,
        model=config.modelName,
        messages=messages,
        temperature=0.7,
        max_tokens=config.maxTokens,
        top_p=0.0,
        frequency_penalty=0,
        presence_penalty=0,
        stop=None,
        request_timeout=config.openAiRequestTimeout,
    )

    text = response.get("choices", [])[0].get("message", {}).get("content", text)
    finish_reason = response.get("choices", [])[0].get("finish_reason", "")

    if finish_reason != "stop" and finish_reason != 'length' and finish_reason != "":
        logger.warning("Stop reason: %s", finish_reason)
        logger.warning("Text: %s", text)
        logger.warning("Increase Max Tokens and try again")
        exit(1)

    return text


def process_queue(config, progress, task, q, counter, logger, output_chunks):
    """process the queue"""
    while not q.empty():

        chunk = q.get()

        text = chunk.get("text")

        existing = chunk.get("summary")

        if (not existing or existing.len == 0):

           # get a summary of the text using chatgpt
           try:
              summary = chatgpt_summary(config, text, logger)
           except openai.InvalidRequestError as invalid_request_error:
              logger.warning("Error: %s", invalid_request_error)
              summary = text
           except Exception as e:
              logger.warning("Error: %s", e)
              summary = text

           # add the summary to the segment dictionary
           chunk["summary"] = summary

        count = counter.increment()
        progress.update(task, advance=1)

        output_chunks.append(chunk.copy())
        q.task_done()

# convert time '00:01:20' to seconds
def convert_time_to_seconds(value):
    """convert time to seconds"""
    time_value = value.split(":")
    if len(time_value) == 3:
        h, m, s = time_value
        return int(h) * 3600 + int(m) * 60 + int(s)
    else:
        return 0


def enrich_transcript_summaries (config, transcriptDestinationDir): 
   
   openai.api_type = config.apiType 
   openai.api_key = config.apiKey
   openai.api_base = config.resourceEndpoint
   openai.api_version = config.apiVersion   

   logging.basicConfig(level=logging.WARNING)
   logger = logging.getLogger(__name__)

   if not transcriptDestinationDir:
      logger.error("Transcript folder not provided")
      exit(1)

   chunks = []
   output_chunks = []
   total_chunks = 0

   counter = Counter()

   logger.debug("Starting OpenAI summarization")

   # load the chunks from a json file
   input_file = os.path.join(transcriptDestinationDir, "output", "master_transcriptions.json")
   with open(input_file, "r", encoding="utf-8") as f:
      chunks = json.load(f)

   total_chunks = len(chunks)

   logger.debug("Total chunks to be processed: %s", len(chunks))

   # add segment list to a queue
   q = queue.Queue()
   for chunk in chunks:
      q.put(chunk)

   with Progress() as progress:
      task1 = progress.add_task("[purple]Enriching Summaries...", total=total_chunks)

      # create multiple threads to process the queue
      threads = []
      for i in range(config.processingThreads):
         t = threading.Thread(target=process_queue, args=(config, progress, task1, q, counter, logger, output_chunks))
         t.start()
         threads.append(t)

      # wait for all threads to finish
      for t in threads:
         t.join()

   # sort the output chunks by sourceId and start
   output_chunks.sort(key=lambda x: (x["sourceId"], convert_time_to_seconds(x["start"])))

   logger.debug("Total chunks processed: %s", len(output_chunks))

   # save the output chunks to a json file
   output_file = os.path.join(transcriptDestinationDir, "output", "master_enriched.json")
   with open(output_file, "w", encoding="utf-8") as f:
      json.dump(output_chunks, f, ensure_ascii=False, indent=4)
