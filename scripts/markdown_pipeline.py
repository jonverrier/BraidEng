

from lib.markdown_download import download_markdown
from lib.markdown_enrich_bucket import enrich_buckets_markdown
from lib.markdown_enrich_summaries import enrich_summaries_markdown
from lib.markdown_enrich_embeddings import enrich_embeddings_markdown
from lib.markdown_enrich_lite import enrich_lite_markdown

MARKDOWN_DESTINATION_DIR = "data/markdown"
REPO_SOURCE_DIR = "../msintro"
REPO_NAME="microsoft/generative-ai-for-beginners/blob/main"

download_markdown (REPO_SOURCE_DIR, REPO_NAME, MARKDOWN_DESTINATION_DIR)

MARKDOWN_DESTINATION_DIR = "data/markdown"
REPO_SOURCE_DIR = "../sotaosai"
REPO_NAME="premAI-io/state-of-open-source-ai"

download_markdown (REPO_SOURCE_DIR, REPO_NAME, MARKDOWN_DESTINATION_DIR)
enrich_buckets_markdown(MARKDOWN_DESTINATION_DIR, 5, 50)
enrich_summaries_markdown(MARKDOWN_DESTINATION_DIR, 50)
enrich_embeddings_markdown(MARKDOWN_DESTINATION_DIR)
enrich_lite_markdown(MARKDOWN_DESTINATION_DIR)