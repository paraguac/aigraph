"""
Azure OpenAI Platform - True Positive Test
This file demonstrates Azure OpenAI usage that SHOULD be detected.
"""

import os
from azure.ai.openai import AzureOpenAI
from azure.identity import DefaultAzureCredential

# Initialize Azure OpenAI client
client = AzureOpenAI(
    api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
    api_version="2024-02-01",
    azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT")
)

def chat_with_azure_gpt4():
    """Use GPT-4 via Azure OpenAI"""
    response = client.chat.completions.create(
        model="gpt-4",  # Deployment name
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Hello!"}
        ]
    )
    return response.choices[0].message.content

def chat_with_azure_gpt35():
    """Use GPT-3.5 via Azure OpenAI"""
    response = client.chat.completions.create(
        model="gpt-35-turbo",
        messages=[
            {"role": "user", "content": "Explain AI"}
        ]
    )
    return response.choices[0].message.content

def generate_embeddings_azure():
    """Generate embeddings via Azure OpenAI"""
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input="Sample text to embed"
    )
    return response.data[0].embedding

# Azure OpenAI configuration
AZURE_CONFIG = {
    "endpoint": "https://my-resource.openai.azure.com/",
    "api_key": "azure-api-key",
    "api_version": "2024-02-01",
    "deployment_name": "gpt-4"
}

if __name__ == "__main__":
    print(chat_with_azure_gpt4())
