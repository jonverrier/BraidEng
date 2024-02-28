""" This script downloads the transcripts for all the markdown files in a GitHub repo. """

import os
import json
import logging
import time
import threading
import queue
from pathlib import Path
from markdown import markdown
from bs4 import BeautifulSoup
import requests
import time
from urllib.parse import urlsplit, urlunsplit

MAX_LINKS_PERPAGE=512 #Max number of links we keep froma  single page
MAX_PAGE_DEPTH=256    #Max depth we serach in a website
AVERAGE_CHARACTERS_PER_TOKEN=6

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

def makeSourceId(sourceUrl, siteName, filePath):
   relPath = os.path.relpath(filePath, sourceUrl)
   composite = siteName + '/' + relPath
   unix = composite.replace("\\", "/")
   return unix

def md_to_plain_text(md):
    #    """Convert MD contents into plain text"""
    html = markdown(md)
    soup = BeautifulSoup(html, features='html.parser')
    fullText = soup.get_text()
    nolineFeeds = fullText.replace("\n", " ")
    return nolineFeeds
    
def get_html(fileName, counter_id, sourceUrl, siteName, htmlDesitinationDir, logger):
    """Read in HTML content and write out as plain text """

    sourceId = makeSourceId (sourceUrl, siteName, fileName)
    fakeName = fileName.replace("\\", "_")
    contentOutputFileName = os.path.join(htmlDesitinationDir, fakeName + ".json.mdd")
    metaOutputFilename = os.path.join(htmlDesitinationDir, fakeName + ".json")

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

    # save the metadata as a .json file
    json.dump(metadata, open(metaOutputFilename, "w", encoding="utf-8"))
    
    logger.debug("Html download completed: %d, %s", counter_id, fileName)

    return True


def process_queue(q, sourceUrl, siteName, htmlDestinationDir, logger):
    """process the queue"""
    while not q.empty():
        file = q.get()

        counter.increment()

        get_html(file, counter.value, sourceUrl, siteName, htmlDestinationDir, logger)
        q.task_done()

def makeCleanUrl (link):
    split_url = urlsplit(link)
    # split_url.scheme   "http"
    # split_url.netloc   "127.0.0.1" 
    # split_url.path     "/asdf/login.php"
    # Use all the path except everything after the last '/' 
    clean_path = "".join(split_url.path.rpartition("/")[:-1])
    baseUrl = split_url.scheme + '//' + split_url.netloc + clean_path
    return baseUrl

def remove_duplicates(currentLinks, newLinks): # remove duplicates 

    for item in newLinks:
        if not item in currentLinks:
           currentLinks.append(item)
    
    return currentLinks

def remove_exits(sourceUrl, links): # remove links that point outside the main site being searched
    trimmed = []

    for item in links:
        match = item.startswith(makeCleanUrl (sourceUrl))
        if match :
            trimmed .append(sourceUrl)

    return trimmed

def recurse_page_list (startUrl, links, depth, minimumPageTokenCount):
   
   # Bail we we hit maximum depth
   # TODO ADD LOGGING
   if (depth > MAX_PAGE_DEPTH):
      return
   
   page = requests.get(startUrl)
   soup = BeautifulSoup(page.content, "html.parser")  

   fullText = soup.get_text()
   nolineFeeds = fullText.replace("\n", " ")
   # dont add very short pages
   # TODO ADD LOGGING
   if len(nolineFeeds) < minimumPageTokenCount * AVERAGE_CHARACTERS_PER_TOKEN:
       return
   
   links.append (startUrl)

   subLinks = soup.find_all('a', href=True)
   subUrls = []

   for link in subLinks('a', href=True):
      url = str(link.get('href'))
      subUrls.append(url)

   deduped = remove_duplicates(links, subLinks)
   trimmed = remove_exits (startUrl, deduped)

   for link in trimmed('a', href=True):
       recurse_page_list (link, links, depth + 1)


         
def build_page_list (sourceUrl, q, minimumPageTokenCount):
   links = []

   recurse_page_list (sourceUrl, links, 0, minimumPageTokenCount)

   for url in links:
      print(url)
      q.put(url)
    
def download_html (sourceUrl, siteName, htmlDesitinationDir, minimumPageTokenCount): 
   
   logging.basicConfig(level=logging.WARNING)
   logger = logging.getLogger(__name__)

   PROCESSING_THREADS = 1

   q = queue.Queue()

   if not htmlDesitinationDir:
      logger.error("Html folder not provided")
      exit(1)

   if not sourceUrl:
      logger.error("Repo name not provided")
      exit(1)

   cwd = os.getcwd()
   logger.debug("Current directory : %s", cwd)
   logger.debug("Source URL: %s", sourceUrl)
   logger.debug("Html folder: %s", htmlDesitinationDir)

   # Recursively search for all html files  
   build_page_list (sourceUrl, q, minimumPageTokenCount)
   
   logger.info("Total HTML files to be downloaded: %s", q.qsize())

   start_time = time.time()

   return

   # create multiple threads to process the queue
   threads = []
   for i in range(PROCESSING_THREADS):
      t = threading.Thread(
         target=process_queue,
                args=(q, sourceUrl, siteName, htmlDesitinationDir, logger),
         )
      t.start()
   threads.append(t)

   # wait for all threads to finish
   for t in threads:
      t.join()


   finish_time = time.time()
   logger.debug("Total time taken: %s", finish_time - start_time)
