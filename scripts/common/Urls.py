
import os
import json
import logging

youTubeUrls = [
["Stanford CS229: Machine Learning Full Course taught by Andrew Ng | Autumn 2018 - YouTube", "PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU"],
["Stanford CS224N: Natural Language Processing with Deep Learning | Winter 2021 - YouTube", "PLoROMvodv4rOSH4v6133s9LFPRHjEmbmJ"],
["Braid AI Canon", "PL9LkXkIUrSoxIlFSKcyB21XFFLCCYfPGv"],
["Braid - Additional Content", "PL9LkXkIUrSozgkPNepSMzidqtAGR0b1F_"],
["Augmented Language Models (LLM Bootcamp) (youtube.com)", "PL1T8fO7ArWleyIqOy37OVXsP4hFXymdOZ"]
]

gitHubUrls = [
["Generative AI for Beginners", "microsoft/generative-ai-for-beginners/blob/main", "../msintro"],
["AI Engineering", "swyxio/ai-notes", "../aieng"]
]

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
["Huyen Chip's Blog", "https://huyenchip.com/blog/", False],
["Stamford CS234 - Large Language Models", "https://stanford-cs324.github.io/winter2022/lectures/", True],
["The Scaling Hypothesis · Gwern.net", "https://gwern.net/scaling-hypothesis", False],
["chinchilla's wild implications — LessWrong", "https://www.lesswrong.com/posts/6Fpvch8RR29qLEWNH/chinchilla-s-wild-implications", False],
["The AI Revolution: How Auto-GPT Unleashes a New Era of Automation and Creativity | by Sriram Parthasarathy | Towards AI", "https://pub.towardsai.net/the-ai-revolution-how-auto-gpt-unleashes-a-new-era-of-automation-and-creativity-2008aa2ca6ae", False],
["The Waluigi Effect (mega-post) — LessWrong", "https://www.lesswrong.com/posts/D7PumeYTDPfBTp3i7/the-waluigi-effect-mega-post", False],
["Build a GitHub Support Bot with GPT3, LangChain, and Python | Dagster Blog", "https://dagster.io/blog/chatgpt-langchain", False],
["Prompt Engineering Guide | Prompt Engineering Guide (promptingguide.ai)", "https://www.promptingguide.ai/", False],
["Learn | Pinecone", "https://www.pinecone.io/learn/", True],
["Use Cases | Langchain", "https://python.langchain.com/v0.1/docs/use_cases/", True],
["Hugging Face Cookbook", "https://huggingface.co/learn/cookbook", True],
["Open AI Cookbook", "https://cookbook.openai.com/", True],
["State of Open Source AI - 2023 Edition", "https://book.premai.io/state-of-open-source-ai/", True],
["Scaled Agile Framework 6.0", "https://scaledagileframework.com/", True],
["McKinsey on AI", "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier", True],
["A16Z Market Analysis", "https://a16z.com/for-b2b-generative-ai-apps-is-less-more/", True],
["A16Z Market Analysis", "https://a16z.com/navigating-the-high-cost-of-ai-compute/", True],
["A16Z Market Analysis", "https://a16z.com/financial-services-will-embrace-generative-ai-faster-than-you-think/", True],
["A16Z Market Analysis", "https://a16z.com/who-owns-the-generative-ai-platform/", True],
["Interaction Design Foundation", "https://www.interaction-design.org/literature/topics/design-thinking", True],
["UX for AI", "https://www.uxforai.com/", True],
["Testing Machine Learning Systems: Code, Data and Models ", "https://madewithml.com/courses/mlops/testing/", True],
["Monitoring Machine Learning Systems: Code, Data and Models ", "https://madewithml.com/courses/mlops/monitoring/", True]
]

class UrlHit:
    def __init__(self) -> None:
        self.path = ""
        self.desc = ""
        self.hits = 0

    path: str
    desc: str
    hits: int

def countUrlHits (destinationDir, urls, fileName): 
   logging.basicConfig(level=logging.WARNING)
   logger = logging.getLogger(__name__)

   if not destinationDir:
      logger.error("Output folder not provided")
      exit(1)

   chunks = []
   total_chunks = 0

   logger.debug("Starting hit counting")

   # load the chunks from a json file
   input_file = os.path.join(destinationDir, "output", fileName)
   with open(input_file, "r", encoding="utf-8") as f:
      chunks = json.load(f)

   total_chunks = len(chunks)
   logger.debug("Total chunks to be processed: %s", len(chunks))

   # Build an empty array to accumlulate hits
   hits = [None] * len(urls)
   for i, url in enumerate(urls):      
      hit = UrlHit()
      hit.desc = url[0]
      hit.path = url[1]
      hit.hits = 0;   
      hits[i] = hit


   # iterate through chunks accumulating hit count 
   for chunk in chunks:
      haveHit = False
      haveAda = False

      ada = chunk.get('hitTrackingId')  
      if (len(ada) > 0):  
         haveAda = True

      for hit in hits:
         source = chunk.get('hitTrackingId')
         if source in hit.path:
            hit.hits = hit.hits + 1
            haveHit = True
    
      if not haveHit:
         raise AssertionError ('All chunks should have a hit:' + chunk.get('sourceId'))
      
      if not haveAda:
         raise AssertionError ('All chunks should have a ada')      

   for hit in hits:  
      print (hit.desc + ', ' + hit.path + ', ' + str(hit.hits))    
