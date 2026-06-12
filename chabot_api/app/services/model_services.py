import os
import json
import argparse
from openai import OpenAI
from app.core.config import Config

class ModelService:

    def __init__(self, config: Config):
        self.config = config
        self.client = OpenAI(
            base_url=self.config.model_url,
            api_key=self.config.api_key
        )

    def health_check(self) -> bool:
        try:
            response = self.client.models.list()
            return True
        except Exception as e:
            print(f"Health check failed for model at {self.config.model_url}: {e}")
            return False

    def generate_response(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.config.model_name,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=150,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    