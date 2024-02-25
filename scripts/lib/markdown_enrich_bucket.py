""" This script generates a master csv file from the transcript files."""

# from the markdown files, generate a master csv file
# from the makdown folder read all the .json files then load the associated .mdd file

from datetime import datetime, timedelta
import glob
import os
import json
import tiktoken
import logging
from rich.progress import Progress
from pathlib import Path

PERCENTAGE_OVERLAP = 0.05
MAX_TOKENS = 2048
MIN_TEXT_LENGTH=50

total_files = 0

class MddSegment:
    def __init__(self, segment: dict[str, str | float]) -> None:
        self.text = segment.get("text")
        self.start = segment.get("start")
        self.duration = segment.get("duration")

    text: str
    start: float
    duration: float


def gen_metadata_master(metadata):
    """generate the metadata master csv file"""
    text = metadata["title"] + " " + metadata["description"]
    metadata["start"] = "0"

    text = text.strip()

    if text == "" or text is None:
        metadata["text"] = "No description available."
    else:
        # clean the text
        text = text.replace("\n", "")
        metadata["text"] = text.strip()


def clean_text(text):
    """clean the text"""
    text = text.replace("\n", " ")  # remove new lines
    text = text.replace("&#39;", "'")
    text = text.replace(">>", "")  # remove '>>'
    text = text.replace("  ", " ")  # remove double spaces
    text = text.replace("[inaudible]", "")  # [inaudible]

    return text


def append_text_to_previous_segment(text, segments):
    """
    append PERCENTAGE_OVERLAP text to the previous segment to smooth context transition
    """
    if len(segments) > 0:
        words = text.split(" ")
        word_count = len(words)
        if word_count > 0:
            append_text = " ".join(words[0 : int(word_count * PERCENTAGE_OVERLAP)])
            segments[-1]["text"] += append_text


def add_new_segment(metadata, text, segment_begin_tokens, segments):
    """add a new segment to the segments list"""
    metadata["start"] = str (segment_begin_tokens)
    metadata["seconds"] = 0
    metadata["text"] = text
    segments.append(metadata.copy())


def parse_json_mdd_transcript(mdd, metadata, tokenizer, segments, segmentLengthMinutes, minimumSegmentTokenCount):
    """parse the json mdd file and return the transcript"""
    text = ""
    current_tokens = None
    seg_begin_tokens = None
    seg_finish_tokens = None
    current_token_length = 0
    first_segment = True
    last_segment = False

    # add the title to the transcript
    if "title" in metadata and metadata["title"] != "":
        metadata["title"] = clean_text(metadata.get("title"))
        text += metadata.get("title") + ". "

    current_token_length = len(tokenizer.encode(text))

    # open the mdd file
    with open(mdd, "r", encoding="utf-8") as json_file:
        json_mdd = json.load(json_file)

        if len (json_mdd) == 1:
           last_segment = True

        for segment in json_mdd:
            seg = MddSegment(segment)
            current_tokens = int(seg.start)
            current_text = seg.text            

            if seg_begin_tokens is None:
                seg_begin_tokens = current_tokens
                # calculate the finish time from the segment_begin_time
                seg_finish_tokens = seg_begin_tokens + segmentLengthMinutes * 60

            # Get the number of tokens in the text.
            # Need to calc to allow for 1024 tokens for 
            # summary request in next pipeline step
            total_tokens = len(tokenizer.encode(current_text)) + current_token_length

            # Deal with case of a single segment that is already over the limit - in which case we just add it
            # then return.
            if first_segment and last_segment and total_tokens >= seg_finish_tokens:
               if total_tokens > minimumSegmentTokenCount:
                  add_new_segment(metadata, current_text, seg_begin_tokens, segments)
               return
        
            if current_tokens < seg_finish_tokens and total_tokens < MAX_TOKENS:
                # add the text to the transcript
                text += current_text + " "
                current_token_length = total_tokens
            else:
                if not first_segment:
                    # append PERCENTAGE_OVERLAP text to the previous segment
                    # to smooth context transition
                    append_text_to_previous_segment(text)
                first_segment = False
                add_new_segment(metadata, text, seg_begin_tokens, segments)

                text = current_text + " "

                # reset the segment_begin_time
                seg_begin_tokens = None
                seg_finish_tokens = None

                current_token_length = len(tokenizer.encode(text))

        # Deal with case where there is only one segment
        if first_segment and last_segment:
           add_new_segment(metadata, text, seg_begin_tokens, segments)
        else:
            # Append the last text segment to the last segment in segments dictionary
            if seg_begin_tokens and text != "":
               previous_segment_tokens = len(tokenizer.encode(segments[-1]["text"]))
               current_segment_tokens = len(tokenizer.encode(text))

               if previous_segment_tokens + current_segment_tokens < MAX_TOKENS:
                   segments[-1]["text"] += text
               else:
                  if not first_segment:
                     # append PERCENTAGE_OVERLAP text to the previous segment
                     # to smooth context transition
                     append_text_to_previous_segment(text)
                     first_segment = False
                     add_new_segment(metadata, text, seg_begin_tokens, segments)


def get_transcript(metadata, markdownDestinationDir, segmentLengthMinutes, logger, tokenizer, segments, minimumSegmentTokenCount):
    """get the transcript from the .mdd file"""

    global total_files
    mdd = os.path.join(markdownDestinationDir, metadata["filename"])

    # check that the .mdd file exists
    if not os.path.exists(mdd):
        logger.info("mdd file does not exist: %s", mdd)
        return None
    else:
        logger.debug("Processing file: %s", mdd)
        total_files += 1

    parse_json_mdd_transcript(mdd, metadata, tokenizer, segments, segmentLengthMinutes, minimumSegmentTokenCount)

def enrich_buckets_markdown(markdownDestinationDir, segmentLengthMinutes, minimumSegmentTokenCount): 

   logging.basicConfig(level=logging.DEBUG)
   logger = logging.getLogger(__name__)
   segments = []
   
   if not markdownDestinationDir:
      logger.error("Markdown folder not provided")
      exit(1)

   # https://stackoverflow.com/questions/75804599/openai-api-how-do-i-count-tokens-before-i-send-an-api-request
   ENCODING_MODEL = "gpt-3.5-turbo"
   tokenizer = tiktoken.encoding_for_model(ENCODING_MODEL)

   cwd = os.getcwd()
   logger.debug("Current directory : %s", cwd)
   logger.debug("Markdown folder: %s", markdownDestinationDir)
   logger.debug("Segment length %d minutes", segmentLengthMinutes)

   folder = os.path.join(markdownDestinationDir, "*.json")
   logger.debug("Search spec: %s", str(folder))

   directory_path = Path(markdownDestinationDir)

   # Use rglob() to recursively search for all files
   searchPath = directory_path.glob("*.json")
   jsonFiles = list(searchPath)

   global total_files
   total_files = 0

   with Progress() as progress:
      task1 = progress.add_task("[green]Enriching Buckets...", total=total_files)

      for file in jsonFiles:
         # load the json file
         meta = json.load(open(file, encoding="utf-8"))

         get_transcript(meta, markdownDestinationDir, segmentLengthMinutes, logger, tokenizer, segments, minimumSegmentTokenCount)
         progress.update(task1, advance=1)


   logger.debug("Total files: %s", total_files)
   logger.debug("Total segments: %s", len(segments))

   #Filter out short segments
   filteredSegments = [];
   for segment in segments:
      if len (segment["text"]) >= minimumSegmentTokenCount:
         filteredSegments.append (segment)

   # save segments to a json file
   output_file = os.path.join(markdownDestinationDir, "output", "master_markdown.json")
   with open(output_file, "w", encoding="utf-8") as f:
      json.dump(filteredSegments, f, ensure_ascii=False, indent=4)
