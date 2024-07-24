# Copyright (c) 2024 Braid Technologies Ltd

# Standard Library Imports
import os
import logging

# Local Modules
from common.ApiConfiguration import ApiConfiguration
from common.Urls import youTubeUrls, countUrlHits
from common.common_functions import ensure_directory_exists
from youtube.download_transcripts import download_transcripts
from youtube.enrich_transcript_chunks import enrich_transcript_chunks
from youtube.enrich_transcript_summaries import enrich_transcript_summaries
from youtube.enrich_transcript_embeddings import enrich_transcript_embeddings
from text.enrich_lite import enrich_lite

# Configure logging
logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

logger = logging.getLogger(__name__)

logger.info("Script started.")

# Set transcript destination directory
TRANSCRIPT_DESTINATION_DIR = os.path.join("data", "youtube")
ensure_directory_exists(TRANSCRIPT_DESTINATION_DIR)

config = ApiConfiguration()

loopCounterForDebugging = 0
maxLoopCountForDebugging = 1  
for item in youTubeUrls:
   if loopCounterForDebugging < maxLoopCountForDebugging:
      logger.debug(f"Downloading transcripts for URL: {item[1]}")
      download_transcripts(item[1], TRANSCRIPT_DESTINATION_DIR)
      loopCounterForDebugging += 1
   else:
      break 

# Keep this comment as example of how to just process one file for debugging   
#download_transcripts ("PL1T8fO7ArWleyIqOy37OVXsP4hFXymdOZ", TRANSCRIPT_DESTINATION_DIR)
#download_transcripts ("PLFnkruiXQop4Robpmim_3FMZbv_1lAwBu", TRANSCRIPT_DESTINATION_DIR)

logger.info("Enriching transcript chunks...")
enrich_transcript_chunks(config, TRANSCRIPT_DESTINATION_DIR)

logger.info("Enriching transcript summaries...")
enrich_transcript_summaries(config, TRANSCRIPT_DESTINATION_DIR)

logger.info("Enriching transcript embeddings...")
enrich_transcript_embeddings(config, TRANSCRIPT_DESTINATION_DIR)

logger.info("Enriching transcripts with lite enrichment...")
enrich_lite(TRANSCRIPT_DESTINATION_DIR)

logger.info("Counting URL hits...")
countUrlHits(TRANSCRIPT_DESTINATION_DIR, youTubeUrls, "master_transcriptions.json","hit_test_results.json")

logger.info("Script finished.")