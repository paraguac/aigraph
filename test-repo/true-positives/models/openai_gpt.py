"""
OpenAI GPT Model Usage - True Positive Test
This file demonstrates real OpenAI model usage that SHOULD be detected.
"""

import os
from openai import OpenAI

# Initialize OpenAI client
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def chat_with_gpt4():
    """Use GPT-4 for chat completion"""
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello!"}
        ]
    )
    return response.choices[0].message.content

def chat_with_gpt4_turbo():
    """Use GPT-4 Turbo"""
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[{"role": "user", "content": "Explain quantum computing"}]
    )
    return response

def chat_with_gpt35():
    """Use GPT-3.5 Turbo"""
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Tell me a joke"}]
    )
    return response

def use_o1_model():
    """Use O1 reasoning model"""
    response = client.chat.completions.create(
        model="o1-preview",
        messages=[{"role": "user", "content": "Solve this math problem"}]
    )
    return response

def generate_embeddings():
    """Use text-embedding model"""
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input="Sample text to embed"
    )
    return response.data[0].embedding

if __name__ == "__main__":
    print(chat_with_gpt4())
