import os

API_TYPE = "open_ai" #AZURE VERSION WAS "Azure"
API_KEY = os.environ["OPENAI_API_KEY"] #AZURE VERSION WAS os.environ["AZURE_OPENAI_API_KEY"] 
API_VERSION = "2020-11-07" #AZURE VERSION WAS "2023-07-01-preview"
RESOURCE_ENDPOINT = "https://api.openai.com/v1" #AZURE VERSION WAS os.environ["AZURE_OPENAI_ENDPOINT"] 
OPENAI_REQUEST_TIMEOUT = 60

class ApiConfiguration:
    def __init__(self) -> None:
        self.apiType = API_TYPE
        self.apiKey = API_KEY
        self.apiVersion = API_VERSION
        self.resourceEndpoint = RESOURCE_ENDPOINT
        self.processingThreads = 1
        self.openAiRequestTimeout = OPENAI_REQUEST_TIMEOUT
        self.summaryWordCount = 50      # 50 word summary
        self.chunkDurationMins = 10 # 10 minute long video clips
        self.maxTokens = 4096           # Upper limit on total tokens in an API call. 10 minutes of video = 600 words = 2400 tokens, plus approx 2x headroom
        self.discardIfBelow = 100       # Dont index if less than 100 tokens

    apiType: str
    apiKey: str
    apiVersion: str
    resourceEndpoint: str
    processingThreads: int
    openAiRequestTimeout: int
    summaryWordCount: int
    chunkDurationMins: int
    maxTokens: int
    discardIfBelow: 100 



