# Copyright (c) 2024 Braid Technologies Ltd

# Local Modules
from common.ApiConfiguration import ApiConfiguration
from common.Urls import youTubeUrls, countUrlHits
from common.common_functions import ensure_directory_exists
from youtube.download_transcripts import download_transcripts
from youtube.enrich_transcript_chunks import enrich_transcript_chunks
from youtube.enrich_transcript_summaries import enrich_transcript_summaries
from youtube.enrich_transcript_embeddings import enrich_transcript_embeddings
from text.enrich_lite import enrich_lite

# Set transcript destination directory
TRANSCRIPT_DESTINATION_DIR = os.path.join("data", "youtube")
ensure_directory_exists(TRANSCRIPT_DESTINATION_DIR)

config = ApiConfiguration()


for item in youTubeUrls:
   download_transcripts (item[1], TRANSCRIPT_DESTINATION_DIR)
enrich_transcript_chunks(config, TRANSCRIPT_DESTINATION_DIR) 
enrich_transcript_summaries (config, TRANSCRIPT_DESTINATION_DIR) 
enrich_transcript_embeddings(config, TRANSCRIPT_DESTINATION_DIR)
enrich_lite(TRANSCRIPT_DESTINATION_DIR)

countUrlHits (TRANSCRIPT_DESTINATION_DIR, youTubeUrls, "master_transcriptions.json")