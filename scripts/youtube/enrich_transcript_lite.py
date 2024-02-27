""" This script removes the text from the enriched transcript and saves it as a new json file."""

import json
import os
import logging

def enrich_transcript_lite (transcriptDestinationDir): 

   logging.basicConfig(level=logging.WARNING)
   logger = logging.getLogger(__name__)

   if not transcriptDestinationDir:
      logger.error("Transcript folder not provided")
      exit(1)

   # load video list from json file
   input_file = os.path.join(transcriptDestinationDir, "output", "master_enriched.json")
   with open(input_file, "r", encoding="utf-8") as f:
      segments = json.load(f)

   total_segments = len(segments)

   # create a lambda function to remove the text from each dictionary in the list
   def remove_text(video_segments):
      """This function removes the text from each dictionary in the list."""
      return [
          {k: v for k, v in seg.items() if k != "text" and k != "description"}
          for seg in video_segments
      ]

   lite = remove_text(segments)

   # save the embeddings to a json file
   output_file = os.path.join(transcriptDestinationDir, "output", "master_enriched_lite.json")
   with open(output_file, "w", encoding="utf-8") as f:
      json.dump(lite, f)
