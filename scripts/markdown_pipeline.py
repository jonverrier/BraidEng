
from github.download_markdown import download_markdown
from github.enrich_markdown_buckets import enrich_markdown_buckets
from github.enrich_markdown_summaries import enrich_markdown_summaries
from github.enrich_markdown_embeddings import enrich_markdown_embeddings
from github.enrich_markdown_lite import enrich_markdown_lite

MARKDOWN_DESTINATION_DIR = "data/markdown"

REPO_SOURCE_DIR = "../msintro"
REPO_NAME="microsoft/generative-ai-for-beginners/blob/main"
download_markdown (REPO_SOURCE_DIR, REPO_NAME, MARKDOWN_DESTINATION_DIR)

REPO_SOURCE_DIR = "../sotaosai"
REPO_NAME="premAI-io/state-of-open-source-ai/blob/main"
download_markdown (REPO_SOURCE_DIR, REPO_NAME, MARKDOWN_DESTINATION_DIR)

enrich_markdown_buckets(MARKDOWN_DESTINATION_DIR, 20, 100) # 20 minites long (at average speaking rate), dont add if < 100 words
enrich_markdown_summaries(MARKDOWN_DESTINATION_DIR, 50)
enrich_markdown_embeddings(MARKDOWN_DESTINATION_DIR)
enrich_markdown_lite(MARKDOWN_DESTINATION_DIR)