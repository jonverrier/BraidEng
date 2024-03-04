

from youtube.download_transcripts import download_transcripts
from youtube.enrich_transcript_buckets import enrich_transcript_buckets
from youtube.enrich_transcript_summaries import enrich_transcript_summaries
from youtube.enrich_transcript_embeddings import enrich_transcript_embeddings
from text.enrich_lite import enrich_lite

TRANSCRIPT_DESTINATION_DIR = "data/transcripts"
webUrls = [
["Stanford CS229: Machine Learning Full Course taught by Andrew Ng | Autumn 2018 - YouTube", "PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU"],
["Stanford CS224N: Natural Language Processing with Deep Learning | Winter 2021 - YouTube", "PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ"],
["Braid AI Canon", "PL9LkXkIUrSoxIlFSKcyB21XFFLCCYfPGv"],
["Braid - Additional Content", "PL9LkXkIUrSozgkPNepSMzidqtAGR0b1F_"],
["Augmented Language Models (LLM Bootcamp) (youtube.com)", "PL1T8fO7ArWleyIqOy37OVXsP4hFXymdOZ"]
]

for item in webUrls:
   download_transcripts (item[1], TRANSCRIPT_DESTINATION_DIR)

enrich_transcript_buckets(TRANSCRIPT_DESTINATION_DIR, 10) # 10 minute long clips
enrich_transcript_summaries (TRANSCRIPT_DESTINATION_DIR, 50) #50 word summary
enrich_transcript_embeddings(TRANSCRIPT_DESTINATION_DIR)
enrich_lite(TRANSCRIPT_DESTINATION_DIR)