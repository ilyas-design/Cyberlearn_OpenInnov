import os 
class Config:

    def __init__(self, model_name: str = os.getenv("MODEL_NAME"), model_url: str = os.getenv("MODEL_URL"), api_key: str = os.getenv("API_KEY")):
        self.model_name = model_name
        self.model_url = model_url
        self.api_key = api_key

    def to_dict(self):
        return {
            "model_name": self.model_name,
            "model_url": self.model_url
        }