""" This script generates a master csv file from the transcript files."""

# from the transcript files, generate a master csv file
# from the transcript folder read all the .json files then load the associated .vtt file

from datetime import datetime, timedelta
import glob
import os
import json
import argparse
import tiktoken
import logging
from rich.progress import Progress

logging.basicConfig(level=logging.WARNING)
logger = logging.getLogger(__name__)

PERCENTAGE_OVERLAP = 0.05

# https://stackoverflow.com/questions/75804599/openai-api-how-do-i-count-tokens-before-i-send-an-api-request
ENCODING_MODEL = "gpt-3.5-turbo"
tokenizer = tiktoken.encoding_for_model(ENCODING_MODEL)


class VttChunk:
    def __init__(self, chunk: dict[str, str | float]) -> None:
        self.text = chunk.get("text")
        self.start = chunk.get("start")
        self.duration = chunk.get("duration")

    text: str
    start: float
    duration: float


def gen_metadata_master(metadata):
    """generate the metadata master csv file"""
    text = metadata["title"] + " " + metadata["description"]
    metadata["start"] = "00:00:00"

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


def append_text_to_previous_chunk(text, chunks):
    """
    append PERCENTAGE_OVERLAP text to the previous chunk to smooth context transition
    """
    if len(chunks) > 0:
        words = text.split(" ")
        word_count = len(words)
        if word_count > 0:
            append_text = " ".join(words[0 : int(word_count * PERCENTAGE_OVERLAP)])
            chunks[-1]["text"] += append_text


def add_new_chunk(metadata, text, chunk_begin_seconds, chunks):
    """add a new chunk to the chunks list"""
    # convert the chunk_begin_time float to 00:00:00 formatted string
    delta = timedelta(seconds=chunk_begin_seconds)
    begin_time = datetime.min + delta
    metadata["start"] = begin_time.strftime("%H:%M:%S")
    metadata["seconds"] = chunk_begin_seconds

    metadata["text"] = text
    chunks.append(metadata.copy())


def parse_json_vtt_transcript(vtt, metadata, chunks, chunkMinutes, maxTokens):
    """parse the json vtt file and return the transcript"""
    text = ""
    current_seconds = None
    seg_begin_seconds = None
    seg_finish_seconds = None
    current_token_length = 0
    first_chunk = True

    # add the speaker name to the transcript
    if "speaker" in metadata and metadata["speaker"] != "":
        metadata["speaker"] = clean_text(metadata.get("speaker"))
        text = "The speaker's name is " + metadata["speaker"] + ". "

    # add the title to the transcript
    if "title" in metadata and metadata["title"] != "":
        metadata["title"] = clean_text(metadata.get("title"))
        text += metadata.get("title") + ". "

    # add the description to the transcript
    if "description" in metadata and metadata["description"] != "":
        metadata["description"] = clean_text(metadata.get("description"))
        text += metadata.get("description") + ". "

    current_token_length = len(tokenizer.encode(text))

    # open the vtt file
    with open(vtt, "r", encoding="utf-8") as json_file:
        json_vtt = json.load(json_file)

        for chunk in json_vtt:
            seg = VttChunk(chunk)
            current_seconds = int(seg.start)
            current_text = seg.text

            if seg_begin_seconds is None:
                seg_begin_seconds = current_seconds
                # calculate the finish time from the chunk_begin_time
                seg_finish_seconds = seg_begin_seconds + chunkMinutes * 60

            # Get the number of tokens in the text.
            total_tokens = len(tokenizer.encode(current_text)) + current_token_length

            if current_seconds < seg_finish_seconds and total_tokens < maxTokens:
                # add the text to the transcript
                text += current_text + " "
                current_token_length = total_tokens
            else:
                if not first_chunk:
                    # append PERCENTAGE_OVERLAP text to the previous chunk
                    # to smooth context transition
                    append_text_to_previous_chunk(text, chunks)
                first_chunk = False
                add_new_chunk(metadata, text, seg_begin_seconds, chunks)

                text = current_text + " "

                # reset the chunk_begin_time
                seg_begin_seconds = None
                seg_finish_seconds = None

                current_token_length = len(tokenizer.encode(text))

        # Append the last text chunk to the last chunk in chunks dictionary
        if seg_begin_seconds and text != "":
            previous_chunk_tokens = len(tokenizer.encode(chunks[-1]["text"]))
            current_chunk_tokens = len(tokenizer.encode(text))

            if previous_chunk_tokens + current_chunk_tokens < maxTokens:
                chunks[-1]["text"] += text
            else:
                if not first_chunk:
                    # append PERCENTAGE_OVERLAP text to the previous chunk
                    # to smooth context transition
                    append_text_to_previous_chunk(text, chunks)
                first_chunk = False
                add_new_chunk(metadata, text, seg_begin_seconds, chunks)


def get_transcript(metadata, transcriptDestinationDir, chunks, chunkMinutes, maxTokens):
    """get the transcript from the .vtt file"""
    global total_files
    vtt = os.path.join(transcriptDestinationDir, metadata["sourceId"] + ".json.vtt")

    # check that the .vtt file exists
    if not os.path.exists(vtt):
        logger.info("vtt file does not exist: %s", vtt)
        return None
    else:
        logger.debug("Processing file: %s", vtt)
        total_files += 1

    parse_json_vtt_transcript(vtt, metadata, chunks, chunkMinutes, maxTokens)

total_files = 0

def enrich_transcript_chunks (config, transcriptDestinationDir): 
   
   global total_files
   chunks = []
   total_files = 0

   if not transcriptDestinationDir:
      logger.error("Transcript folder not provided")
      exit(1)

   logger.debug("Transcription folder: %s", transcriptDestinationDir)
   logger.debug("Chunk length %d minutes", config.chunkDurationMins)

   folder = os.path.join(transcriptDestinationDir, "*.json")

   with Progress() as progress:
      task1 = progress.add_task("[green]Enriching chunks...", total=total_files)

      for file in glob.glob(folder):
         # load the json file
         meta = json.load(open(file, encoding="utf-8"))

         # Need to calc to allow for tokens for 
         # summary request in next pipeline step
         get_transcript(meta, transcriptDestinationDir, chunks, config.chunkDurationMins, (config.maxTokens - config.summaryWordCount * 4))
         progress.update(task1, advance=1)


   logger.debug("Total files: %s", total_files)
   logger.debug("Total chunks: %s", len(chunks))

   # save chunks to a json file
   output_file = os.path.join(transcriptDestinationDir, "output", "master_transcriptions.json")
   with open(output_file, "w", encoding="utf-8") as f:
      json.dump(chunks, f, ensure_ascii=False, indent=4)
