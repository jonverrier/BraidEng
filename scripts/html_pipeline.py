
from html.download_html import download_html
#from github.enrich_markdown_buckets import enrich_markdown_buckets
#from github.enrich_markdown_summaries import enrich_markdown_summaries
#from github.enrich_markdown_embeddings import enrich_markdown_embeddings
#from github.enrich_markdown_lite import enrich_markdown_lite

HTML_DESTINATION_DIR = "data/html"

SITE_URL = "https://stanford-cs324.github.io/winter2022/lectures/"
SITE_NAME="Stamford CS234 - Large Language Models"
download_html (SITE_URL, SITE_NAME, HTML_DESTINATION_DIR, 100)

#enrich_html_buckets(MARKDOWN_DESTINATION_DIR, 20, 100) # 20 minutes long (at average speaking rate), dont add if < 100 words
#enrich_markdown_summaries(MARKDOWN_DESTINATION_DIR, 50)
#enrich_markdown_embeddings(MARKDOWN_DESTINATION_DIR)
#enrich_markdown_lite(MARKDOWN_DESTINATION_DIR)