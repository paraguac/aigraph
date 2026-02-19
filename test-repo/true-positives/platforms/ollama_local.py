"""
Ollama Local Platform - True Positive Test
This file demonstrates Ollama usage that SHOULD be detected.
"""

import ollama

def chat_with_llama():
    """Chat with LLaMA via Ollama"""
    response = ollama.chat(
        model='llama2',
        messages=[
            {'role': 'user', 'content': 'Why is the sky blue?'}
        ]
    )
    return response['message']['content']

def chat_with_mistral():
    """Chat with Mistral via Ollama"""
    response = ollama.chat(
        model='mistral',
        messages=[
            {'role': 'user', 'content': 'Explain photosynthesis'}
        ]
    )
    return response['message']['content']

def generate_with_ollama():
    """Generate text with Ollama"""
    response = ollama.generate(
        model='llama3',
        prompt='Tell me about neural networks'
    )
    return response['response']

def stream_ollama_response():
    """Stream responses from Ollama"""
    stream = ollama.chat(
        model='mistral',
        messages=[{'role': 'user', 'content': 'Write a poem'}],
        stream=True
    )
    
    for chunk in stream:
        print(chunk['message']['content'], end='', flush=True)

# Ollama configuration
OLLAMA_MODELS = [
    "llama2",
    "llama3",
    "mistral",
    "mixtral",
    "codellama",
    "phi"
]

if __name__ == "__main__":
    print(chat_with_llama())
