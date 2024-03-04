
from web.download_html import download_html
from text.enrich_text_buckets import enrich_text_buckets
from text.enrich_text_summaries import enrich_text_summaries
from text.enrich_text_embeddings import enrich_text_embeddings
from text.enrich_lite import enrich_lite

HTML_DESTINATION_DIR = "data/html"

webUrls = [
["Software 2.0. by Andrej Karpathy", "https://karpathy.medium.com/software-2-0-a64152b37c35", False],
["What Is ChatGPT Doing … and Why Does It Work?—Stephen Wolfram", "https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/", False],
["Transformers, Explained: Understand the Model Behind GPT-3, BERT, and T5 (daleonai.com)", "https://daleonai.com/transformers-explained", False],
["How Stable Diffusion Works · Chris McCormick (mccormickml.com)", "https://mccormickml.com/2022/12/21/how-stable-diffusion-works/", False],
["Deep Learning in a Nutshell: Core Concepts | NVIDIA Technical Blog", "https://developer.nvidia.com/blog/deep-learning-nutshell-core-concepts/", False],
["Practical Deep Learning for Coders - Practical Deep Learning (fast.ai)", "https://course.fast.ai/", True],
["Word2Vec Explained. Explaining the Intuition of Word2Vec &… | by Vatsal | Towards Data Science", "https://towardsdatascience.com/word2vec-explained-49c52b4ccb71", False],
["Yes you should understand backprop | by Andrej Karpathy", "https://karpathy.medium.com/yes-you-should-understand-backprop-e2f06eab496b", False],
["The Illustrated Transformer by Jay Alammar (jalammar.github.io)", "https://jalammar.github.io/illustrated-transformer/", False],
["The Annotated Transformer (harvard.edu)", "https://nlp.seas.harvard.edu/annotated-transformer/", False],
["The Illustrated Stable Diffusion by Jay Alammar Visualizing machine learning one concept at a time. (jalammar.github.io)", "https://jalammar.github.io/illustrated-stable-diffusion/", False],
["RLHF: Reinforcement Learning from Human Feedback (huyenchip.com)", "https://huyenchip.com/2023/05/02/rlhf.html", False],
["Stamford CS234 - Large Language Models", "https://stanford-cs324.github.io/winter2022/lectures/", True],
["The Scaling Hypothesis · Gwern.net", "https://gwern.net/scaling-hypothesis", False],
["chinchilla's wild implications — LessWrong", "https://www.lesswrong.com/posts/6Fpvch8RR29qLEWNH/chinchilla-s-wild-implications", False],
["The AI Revolution: How Auto-GPT Unleashes a New Era of Automation and Creativity | by Sriram Parthasarathy | Towards AI", "https://pub.towardsai.net/the-ai-revolution-how-auto-gpt-unleashes-a-new-era-of-automation-and-creativity-2008aa2ca6ae", False],
["The Waluigi Effect (mega-post) — LessWrong", "https://www.lesswrong.com/posts/D7PumeYTDPfBTp3i7/the-waluigi-effect-mega-post", False],
["Build a GitHub Support Bot with GPT3, LangChain, and Python | Dagster Blog", "https://dagster.io/blog/chatgpt-langchain", False],
["Building LLM applications for production (huyenchip.com)", "https://huyenchip.com/2023/04/11/llm-engineering.html", False],
["Prompt Engineering Guide | Prompt Engineering Guide (promptingguide.ai)", "https://www.promptingguide.ai/", False],
["Learn | Pinecone", "https://www.pinecone.io/learn/", True],
["Get started | Langchain", "https://python.langchain.com/docs/get_started", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter1/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter2/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter3/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter4/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter5/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter6/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter7/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter8/1", True],
["Introduction - Hugging Face NLP Course", "https://huggingface.co/learn/nlp-course/chapter9/1", True],
["Open AI Coockbook", "https://cookbook.openai.com/", True]
]


#SITE_URL = "https://stanford-cs324.github.io/winter2022/lectures/"
#SITE_NAME="Stamford CS234 - Large Language Models"
#download_html (SITE_URL, SITE_NAME, HTML_DESTINATION_DIR, 100)

#SITE_URL = "https://book.premai.io/state-of-open-source-ai/"
#SITE_NAME="State of Open Source AI - 2023 Edition"
#download_html (SITE_URL, SITE_NAME, HTML_DESTINATION_DIR, 100)

#for item in webUrls:
   #download_html (item[1], item[0], item[2], HTML_DESTINATION_DIR, 100)

download_html ("https://cookbook.openai.com/", "Open AI Coockbook", True, HTML_DESTINATION_DIR, 100)

enrich_text_buckets(HTML_DESTINATION_DIR, 10, 100) # 10 minutes long (at average speaking rate), dont add if < 100 words
enrich_text_summaries(HTML_DESTINATION_DIR, 50)
enrich_text_embeddings(HTML_DESTINATION_DIR)
enrich_lite(HTML_DESTINATION_DIR)