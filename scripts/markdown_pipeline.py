from config.ApiConfiguration import ApiConfiguration
from github.download_markdown import download_markdown
from text.enrich_text_chunks import enrich_text_chunks
from text.enrich_text_summaries import enrich_text_summaries
from text.enrich_text_embeddings import enrich_text_embeddings
from text.enrich_lite import enrich_lite

MARKDOWN_DESTINATION_DIR = "data/markdown"
REPO_SOURCE_DIR = "../msintro"
REPO_NAME="microsoft/generative-ai-for-beginners/blob/main"
download_markdown (REPO_SOURCE_DIR, REPO_NAME, MARKDOWN_DESTINATION_DIR)

config = ApiConfiguration()

enrich_text_chunks(config,MARKDOWN_DESTINATION_DIR) 
enrich_text_summaries(config, MARKDOWN_DESTINATION_DIR)
enrich_text_embeddings(config, MARKDOWN_DESTINATION_DIR)
enrich_lite(MARKDOWN_DESTINATION_DIR)