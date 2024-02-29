
from github.download_markdown import download_markdown
from text.enrich_text_buckets import enrich_text_buckets
from text.enrich_text_summaries import enrich_text_summaries
from text.enrich_text_embeddings import enrich_text_embeddings
from text.enrich_lite import enrich_lite

MARKDOWN_DESTINATION_DIR = "data/markdown"

REPO_SOURCE_DIR = "../msintro"
REPO_NAME="microsoft/generative-ai-for-beginners/blob/main"
download_markdown (REPO_SOURCE_DIR, REPO_NAME, MARKDOWN_DESTINATION_DIR)

enrich_text_buckets(MARKDOWN_DESTINATION_DIR, 20, 100) # 20 minutes long (at average speaking rate), dont add if < 100 words
enrich_text_summaries(MARKDOWN_DESTINATION_DIR, 50)
enrich_text_embeddings(MARKDOWN_DESTINATION_DIR)
enrich_lite(MARKDOWN_DESTINATION_DIR)