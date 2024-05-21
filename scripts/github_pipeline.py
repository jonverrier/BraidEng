from common.ApiConfiguration import ApiConfiguration
from common.Urls import gitHubUrls, countUrlHits
from github.download_markdown import download_markdown
from text.enrich_text_chunks import enrich_text_chunks
from text.enrich_text_summaries import enrich_text_summaries
from text.enrich_text_embeddings import enrich_text_embeddings
from text.enrich_lite import enrich_lite

MARKDOWN_DESTINATION_DIR = "data/github"

config = ApiConfiguration()

for item in gitHubUrls:
   download_markdown (item[2], item[1], MARKDOWN_DESTINATION_DIR)

enrich_text_chunks(config,MARKDOWN_DESTINATION_DIR) 
enrich_text_summaries(config, MARKDOWN_DESTINATION_DIR)
enrich_text_embeddings(config, MARKDOWN_DESTINATION_DIR)
enrich_lite(MARKDOWN_DESTINATION_DIR)

countUrlHits (MARKDOWN_DESTINATION_DIR, gitHubUrls, "master_text.json")