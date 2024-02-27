

from youtube.download_transcripts import download_transcripts
from youtube.enrich_transcript_buckets import enrich_transcript_buckets
from youtube.enrich_transcript_summaries import enrich_transcript_summaries
from youtube.enrich_transcript_embeddings import enrich_transcript_embeddings
from youtube.enrich_transcript_lite import enrich_transcript_lite

TRANSCRIPT_DESTINATION_DIR = "data/transcripts"


PLAYLIST = "PLERAEIq9URVcHDXVlQZgr9KiBoV21-WOf"
download_transcripts (PLAYLIST, TRANSCRIPT_DESTINATION_DIR)

PLAYLIST = "PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU"
download_transcripts (PLAYLIST, TRANSCRIPT_DESTINATION_DIR)

PLAYLIST = "PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ"
download_transcripts (PLAYLIST, TRANSCRIPT_DESTINATION_DIR)

PLAYLIST = "PL9LkXkIUrSoxIlFSKcyB21XFFLCCYfPGv"
download_transcripts (PLAYLIST, TRANSCRIPT_DESTINATION_DIR)

enrich_transcript_buckets(TRANSCRIPT_DESTINATION_DIR, 10) # 10 minute long clips
enrich_transcript_summaries (TRANSCRIPT_DESTINATION_DIR, 50) #50 word summary
enrich_transcript_embeddings(TRANSCRIPT_DESTINATION_DIR)
enrich_transcript_lite(TRANSCRIPT_DESTINATION_DIR)