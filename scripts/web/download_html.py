""" This script downloads the text content for all sub pages of a URL. """

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

MAX_LINKS_PERPAGE=256 #Max number of links we keep from a single page
MAX_PAGE_DEPTH=1     #Max depth we search in a website
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

def makePathOnly (url):
    split_url = urlsplit(url)
    # split_url.scheme   "http"
    # split_url.netloc   "127.0.0.1" 
    # split_url.path     "/asdf/login.php"
    # Use all the path except everything after the last '/'
    path = split_url.path.rpartition("/")[:-1]
    clean_path = str(split_url.netloc) + path[0]
    return clean_path

    
def get_html(url, counter_id, siteName, htmlDesitinationDir, logger, minimumPageTokenCount):
    """Read in HTML content and write out as plain text """

    sourceId = makePathOnly (url)
    fakeName = sourceId.replace("//", "_").replace("/", "_")
    contentOutputFileName = os.path.join(htmlDesitinationDir, fakeName + ".json.mdd")
    metaOutputFilename = os.path.join(htmlDesitinationDir, fakeName + ".json")

    # if markdown file already exists, skip it
    if os.path.exists(contentOutputFileName):
        logger.debug("Skipping : %s", url)
        return False    
    
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser") 
    fullText = soup.get_text()
    nolineFeeds = fullText.replace("\n", " ")
    # dont add very short pages
    if len(nolineFeeds) < minimumPageTokenCount * AVERAGE_CHARACTERS_PER_TOKEN:
       logger.debug("Skipping : %s", url)
       return    

    jsonSeg = dict()
    jsonSeg["text"] = nolineFeeds
    jsonSeg["start"] = "0"
    jsonArr = [""]
    jsonArr[0] = jsonSeg
         
    # save the plain text content as a .json.mdd file
    with open(contentOutputFileName, "w", encoding="utf-8") as file:
        json.dump(jsonArr, file, indent=4, ensure_ascii=False)

    metadata = {}
    metadata["speaker"] = ""
    metadata["title"] = Path(url).name
    metadata["sourceId"] = sourceId
    metadata["filename"] = os.path.basename(contentOutputFileName)   
    metadata["description"] = Path(url).name

    # save the metadata as a .json file
    json.dump(metadata, open(metaOutputFilename, "w", encoding="utf-8"))
    
    logger.debug("Html download completed: %d, %s", counter_id, url)

    return True


def process_queue(q, sourceUrl, siteName, htmlDestinationDir, logger, minimumPageTokenCount):
    """process the queue"""
    while not q.empty():
        file = q.get()

        counter.increment()

        get_html(file, counter.value, siteName, htmlDestinationDir, logger, minimumPageTokenCount)
        q.task_done()


def deduplicate(currentLinks, newLinks): # remove duplicates 

    deduped = []

    for item in newLinks:
        if not item in currentLinks:
           deduped.append(item)
    
    return deduped

def remove_exits(sourceUrl, links): # remove links that point outside the main site being searched
    trimmed = []

    for item in links:
        match = (item.startswith(sourceUrl) 
                 or (not item.startswith('https') 
                     and not item.startswith('http') 
                     and not item.startswith('#')
                     and not item.startswith('..')))
        if match :
            trimmed .append(item)        

    return trimmed

def add_prefix(sourceUrl, links): # add prefixes if we have relative URLs
    full = []

    for item in links:
        match = (not item.startswith('https') and not item.startswith('http'))
        if match :
            newUrl = sourceUrl + item
        else:
            newUrl = item
        full.append(newUrl)

    return full

def recurse_page_list (startUrl, processedLinks, depth, logger):
   
   # Bail we we hit maximum depth
   # TODO ADD LOGGING
   if (depth > MAX_PAGE_DEPTH):
      logger.debug("Depth exceeded : %s", startUrl)      
      return
   
   page = requests.get(startUrl)
   soup = BeautifulSoup(page.content, "html.parser")  
  
   logger.debug("Processing : %s", startUrl)     
   processedLinks.append (startUrl)

   subLinks = soup.find_all('a', href=True)
   subUrls = []

   for link in subLinks:
      url = str(link.get('href'))
      subUrls.append(url)

   deduped = deduplicate(processedLinks, subUrls)
   trimmed = remove_exits (startUrl, deduped)
   full = add_prefix (startUrl, trimmed)
   deduped = deduplicate(processedLinks, full)

   for link in deduped:
      if not link in processedLinks:       
         recurse_page_list (link, processedLinks, depth + 1, logger)

   return

         
def build_page_list (sourceUrl, q, minimumPageTokenCount, logger):
   links = []

   recurse_page_list (sourceUrl, links, 0, logger)

   for url in links:
      print(url)
      q.put(url)
    
def download_html (sourceUrl, siteName, htmlDesitinationDir, minimumPageTokenCount): 
   
   logging.basicConfig(level=logging.DEBUG)
   logger = logging.getLogger(__name__)

   PROCESSING_THREADS = 1

   q = queue.Queue()

   if not htmlDesitinationDir:
      logger.error("Html folder not provided")
      exit(1)

   if not sourceUrl:
      logger.error("Source url not provided")
      exit(1)

   logger.debug("Source URL: %s", sourceUrl)
   logger.debug("Html folder: %s", htmlDesitinationDir)

   # Recursively search for all html files  
   build_page_list (sourceUrl, q, minimumPageTokenCount, logger)
   
   logger.info("Total HTML files to be downloaded: %s", q.qsize())

   start_time = time.time()

   # create multiple threads to process the queue
   threads = []
   for i in range(PROCESSING_THREADS):
      t = threading.Thread(
         target=process_queue,
                args=(q, sourceUrl, siteName, htmlDesitinationDir, logger, minimumPageTokenCount),
         )
      t.start()
   threads.append(t)

   # wait for all threads to finish
   for t in threads:
      t.join()

   finish_time = time.time()
   logger.debug("Total time taken: %s", finish_time - start_time)
