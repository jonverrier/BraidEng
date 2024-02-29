
from web.download_html import download_html
from text.enrich_text_buckets import enrich_text_buckets
from text.enrich_text_summaries import enrich_text_summaries
from text.enrich_text_embeddings import enrich_text_embeddings
from text.enrich_lite import enrich_lite

HTML_DESTINATION_DIR = "data/html"

SITE_URL = "https://stanford-cs324.github.io/winter2022/lectures/"
SITE_NAME="Stamford CS234 - Large Language Models"
download_html (SITE_URL, SITE_NAME, HTML_DESTINATION_DIR, 100)

SITE_URL = "https://book.premai.io/state-of-open-source-ai/"
SITE_NAME="State of Open Source AI - 2023 Edition"
#download_html (SITE_URL, SITE_NAME, HTML_DESTINATION_DIR, 100)

enrich_text_buckets(HTML_DESTINATION_DIR, 20, 100) # 20 minutes long (at average speaking rate), dont add if < 100 words
enrich_text_summaries(HTML_DESTINATION_DIR, 50)
enrich_text_embeddings(HTML_DESTINATION_DIR)
enrich_lite(HTML_DESTINATION_DIR)