""" This script downloads the transcripts for all the markdown files in a GitHub repo. """

import os
import json
import logging
import time
import threading
import queue
import pathlib
from pathlib import Path
from markdown import markdown
from bs4 import BeautifulSoup


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


counter = Counter()

def makeSourceId(repoSourceDir, repoName, filePath):
   relPath = os.path.relpath(filePath, repoSourceDir)
   composite = repoName + '/' + relPath
   unix = composite.replace("\\", "/")
   return unix

def md_to_plain_text(md):
    #    """Convert MD contents into plain text"""
    html = markdown(md)
    soup = BeautifulSoup(html, features='html.parser')
    fullText = soup.get_text()
    nolineFeeds = fullText.replace("\n", " ")
    return nolineFeeds
    
def get_markdown(fileName, counter_id, repoSourceDir, repoName, markdownDestinationDir, logger):
    """Read in Markdown content from a file and write out as plain text """

    sourceId = makeSourceId (repoSourceDir, repoName, fileName)
    fakeName = fileName.replace("\\", "_")
    contentOutputFileName = os.path.join(markdownDestinationDir, fakeName + ".json.mdd")
    metaOutputFilename = os.path.join(markdownDestinationDir, fakeName + ".json")

    # if markdown file already exists, skip it
    if os.path.exists(contentOutputFileName):
        logger.debug("Skipping file %d, %s", counter_id, fileName)
        return False    
    
    markdown = Path(fileName).read_text(encoding="utf-8")

    plainText = md_to_plain_text (markdown) 

    jsonSeg = dict()
    jsonSeg["text"] = plainText
    jsonSeg["start"] = "0"
    jsonArr = [""]
    jsonArr[0] = jsonSeg
         
    # save the plain text content as a .json.mdd file
    with open(contentOutputFileName, "w", encoding="utf-8") as file:
        json.dump(jsonArr, file, indent=4, ensure_ascii=False)

    metadata = {}
    metadata["speaker"] = ""
    metadata["title"] = Path(fileName).name
    metadata["sourceId"] = sourceId
    metadata["filename"] = os.path.basename(contentOutputFileName)   
    metadata["description"] = Path(fileName).name
    metadata["hitTrackingId"] = repoName

    # save the metadata as a .json file
    json.dump(metadata, open(metaOutputFilename, "w", encoding="utf-8"))
    
    logger.debug("Markdown download completed: %d, %s", counter_id, fileName)

    return True


def process_queue(q, repoSourceDir, repoName, markdownDestinationDir, logger):
    """process the queue"""
    while not q.empty():
        file = q.get()

        counter.increment()

        get_markdown(file, counter.value, repoSourceDir, repoName, markdownDestinationDir, logger)
        q.task_done()

def download_markdown (repoSourceDir, repoName, markdownDestinationDir): 
   
   logging.basicConfig(level=logging.WARNING)
   logger = logging.getLogger(__name__)

   MAX_RESULTS = 100
   PROCESSING_THREADS = 1

   q = queue.Queue()

   if not markdownDestinationDir:
      logger.error("Markdown folder not provided")
      exit(1)

   if not repoSourceDir:
      logger.error("Repo name not provided")
      exit(1)

   cwd = os.getcwd()
   logger.debug("Current directory : %s", cwd)
   logger.debug("Repo folder: %s", repoSourceDir)
   logger.debug("Markdown folder: %s", markdownDestinationDir)

   directory_path = pathlib.Path(repoSourceDir)

   # Use rglob() to recursively search for all files
   searchPath = directory_path.rglob("*.md")
   markdown_files = list(searchPath)

   # Build a queue of Markdown filenames
   for file in markdown_files:
       q.put (str(file))

   logger.info("Total markdown files to be download: %s", q.qsize())

   start_time = time.time()

   # create multiple threads to process the queue
   threads = []
   for i in range(PROCESSING_THREADS):
      t = threading.Thread(
         target=process_queue,
                args=(q, repoSourceDir, repoName, markdownDestinationDir, logger),
         )
      t.start()
   threads.append(t)

   # wait for all threads to finish
   for t in threads:
      t.join()


   finish_time = time.time()
   logger.debug("Total time taken: %s", finish_time - start_time)
