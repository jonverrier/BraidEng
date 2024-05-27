
from common.ApiConfiguration import ApiConfiguration
from test.test_utility import run_tests


TEST_DESTINATION_DIR = "data/test"
CHUNK_SOURCE_DIR = "data"

config = ApiConfiguration()

negative_questions = [
"What is the capital of France?",
"Who wrote 'To Kill a Mockingbird'?",
"What is the largest planet in our solar system?",
"How many continents are there on Earth?",
"What is the chemical symbol for gold?",
"Who painted the Mona Lisa?",
"What year did the Titanic sink?",
"What is the main ingredient in guacamole?",
"How many bones are in the adult human body?",
"What is the hardest natural substance on Earth?",
"Who was the first person to walk on the moon?",
"What is the currency of Japan?",
"Which element has the atomic number 1?",
"What is the longest river in the world?",
"Who directed the movie Jurassic Park?",
"What is the name of the largest ocean on Earth?",
"In what year did World War II end?",
"What is the square root of 64?",
"Who is known as the 'Father of Computers'?",
"What is the fastest land animal?",
"What is the main language spoken in Brazil?",
"Who discovered penicillin?",
"What is the smallest country in the world by area?",
"What sport is known as 'the beautiful game'?",
"How many states are there in the United States?"];

questions = [
"What is a Large Language Model (LLM)?",
"How do LLMs work?",
"What are some common use cases for LLMs in applications?",
"How are LLMs different from traditional AI models?",
"What are the key components of an LLM?",
"How do LLMs process and generate text?",
"What is natural language processing (NLP)?",
"How does NLP relate to LLMs?",
"What is the difference between supervised, unsupervised, and reinforcement learning?",
"How are LLMs trained?",

"What factors should I consider when choosing an LLM for my application?",
"How do I determine the size of the model I need?"
"What are the trade-offs between smaller and larger models?",
"How do I evaluate the performance of different LLMs?",
"What are the most popular LLMs available today (eg GPT-4, BERT, T5)?",
"How does OpenAI's GPT-4 compare to other models like Google's BERT?",
"What is transfer learning and how does it apply to LLMs?",
"Can I use pre-trained models or do I need to train my own from scratch?",

"How do I integrate an LLM into my Python application?",
"What libraries or frameworks are available for working with LLMs in Python?",
"How do I use Hugging Face's Transformers library?",
"What is the process for deploying an LLM-based application?",
"How do I handle API rate limits when using a hosted LLM service?",
"How can I optimize the response time of an LLM in my application?",
"What are the best practices for managing API keys and authentication?",

"How can LLMs be used for chatbots?",
"What are the steps to create a question-answering system with an LLM?",
"How can I use an LLM to summarize text?",
"What are the methods for implementing sentiment analysis using LLMs?",
"How can LLMs be used for content generation, such as blog posts or articles?",
"What are the considerations for using LLMs in voice assistants?",
"How can LLMs assist in language translation applications?",
"What is the role of LLMs in automated code generation?",
"How can LLMs be used for data extraction from unstructured text?",

"How do I fine-tune a pre-trained LLM on my own dataset?",
"What datasets are commonly used for training LLMs?",
"How much data do I need to train or fine-tune an LLM effectively?",
"What are the computational requirements for training an LLM?",
"How do I handle bias in training data?",
"What techniques can I use to improve the accuracy of my LLM?",

"What are the ethical considerations when using LLMs in applications?",
"How can I ensure that my LLM is not producing biased or harmful content?",
"What are the privacy concerns when using LLMs?",
"How do I manage user data responsibly in an LLM-based application?",
"What are the legal implications of using LLMs in different industries?",

"How can I optimize the performance of an LLM in production?",
"What are some common performance bottlenecks when using LLMs?",
"How can I reduce the latency of LLM responses?",
"What caching strategies can I use to improve LLM response times?",
"How do I monitor and maintain an LLM-based application in production?",

"How do I estimate the cost of using an LLM in my application?",
"What are the cost considerations when choosing between different LLM providers?",
"How can I minimize the cost of API usage for LLMs?",
"What are the pricing models for popular LLM services like OpenAI's GPT?",

"How do I scale an LLM-based application to handle increased traffic?",
"What are the best practices for scaling LLM infrastructure?",
"How can I use load balancing with LLMs?",
"What cloud services are recommended for hosting LLM-based applications?",

"What security measures should I implement when using LLMs?",
"How do I protect my LLM from adversarial attacks?",
"How can I ensure secure communication between my application and the LLM API?",
"What are the risks of using LLMs and how can I mitigate them?",

"How can I customize the behavior of an LLM to better fit my application?",
"What are prompt engineering techniques and how do they work?",
"How can I use LLMs for specific domain applications, like medical or legal?",
"How do I implement contextual understanding in my LLM-based application?",
"What are the techniques for chaining LLM responses for complex tasks?",

"How do I debug issues with LLM-generated content?",
"What are the common issues faced when integrating LLMs?",
"How can I track and fix inaccuracies in LLM responses?",

"What are the latest advancements in LLM technology?",
"How do emerging models like GPT-4.5 or GPT-5 compare to GPT-4?",
"What future applications and improvements are expected for LLMs?",
"How is the field of LLMs expected to evolve over the next 5 years?",

"What online communities and forums are best for learning about LLMs?",
"What are the best courses or tutorials for learning to use LLMs?",
"How can I contribute to the development of open-source LLM projects?",

"How are LLMs used in the healthcare industry?",
"What are the applications of LLMs in finance?",
"How can LLMs benefit the education sector?",
"What are the uses of LLMs in customer service?",
"How do LLMs apply to the entertainment and media industry?",

"What are some successful case studies of LLM integration?",
"How have other developers solved common problems with LLMs?",

"What metrics should I use to evaluate the performance of my LLM?",
"How do I measure the quality of the generated text?",
"What are the methods to evaluate the relevance of LLM responses?",

"How often should I update or retrain my LLM?",
"What are the signs that my LLM needs retraining?",
"How do I manage version control for my LLM models?",

"What are the best tools for annotating and preparing training data?",
"How do I use TensorFlow or PyTorch with LLMs?",
"What is the role of the Hugging Face Model Hub in working with LLMs?",
"How can I use Docker to deploy LLM-based applications?",

"What are the GDPR implications of using LLMs?",
"How can I ensure my use of LLMs complies with industry regulations?",
"What are the copyright considerations for content generated by LLMs?",

"How can I personalize LLM interactions for individual users?",
"What strategies can I use to make LLM responses more engaging?",
"How do I gather and use user feedback to improve my LLM-based application?"]

run_tests (config, TEST_DESTINATION_DIR, CHUNK_SOURCE_DIR, negative_questions) 
