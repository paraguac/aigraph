"""
LLaMA and Mistral Model Usage - True Positive Test
This file demonstrates open-source model usage that SHOULD be detected.
"""

import os
from huggingface_hub import InferenceClient

# Initialize client
client = InferenceClient(token=os.environ.get("HF_TOKEN"))

def use_llama2():
    """Use LLaMA 2 model"""
    response = client.text_generation(
        prompt="Explain the theory of relativity",
        model="meta-llama/Llama-2-70b-chat-hf"
    )
    return response

def use_llama3():
    """Use LLaMA 3 model"""
    response = client.text_generation(
        prompt="Write a Python function",
        model="meta-llama/Meta-Llama-3-8B-Instruct"
    )
    return response

def use_codellama():
    """Use CodeLLaMA for coding tasks"""
    response = client.text_generation(
        prompt="def fibonacci(n):",
        model="codellama/CodeLlama-34b-Instruct-hf"
    )
    return response

def use_mistral():
    """Use Mistral 7B model"""
    response = client.text_generation(
        prompt="Explain neural networks",
        model="mistralai/Mistral-7B-Instruct-v0.2"
    )
    return response

def use_mixtral():
    """Use Mixtral 8x7B mixture of experts"""
    response = client.text_generation(
        prompt="What is quantum computing?",
        model="mistralai/Mixtral-8x7B-Instruct-v0.1"
    )
    return response

# Configuration
MODELS = {
    "llama2": "meta-llama/Llama-2-7b-chat",
    "llama3": "meta-llama/Meta-Llama-3-70B",
    "mistral": "mistral-7b-instruct",
    "mixtral": "mixtral-8x7b-instruct"
}

if __name__ == "__main__":
    print(use_llama2())
