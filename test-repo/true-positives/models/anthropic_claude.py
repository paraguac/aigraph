"""
Anthropic Claude Model Usage - True Positive Test
This file demonstrates real Anthropic Claude usage that SHOULD be detected.
"""

import os
from anthropic import Anthropic

# Initialize Anthropic client
client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def chat_with_claude_opus():
    """Use Claude 3 Opus"""
    message = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Explain machine learning"}
        ]
    )
    return message.content

def chat_with_claude_sonnet():
    """Use Claude 3.5 Sonnet"""
    message = client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": "Write a poem"}
        ]
    )
    return message.content

def chat_with_claude_haiku():
    """Use Claude 3 Haiku for quick tasks"""
    message = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=256,
        messages=[
            {"role": "user", "content": "Summarize this text"}
        ]
    )
    return message.content

def stream_claude_response():
    """Stream responses from Claude"""
    with client.messages.stream(
        model="claude-3-sonnet-20240229",
        max_tokens=1024,
        messages=[{"role": "user", "content": "Tell me about AI"}]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)

if __name__ == "__main__":
    print(chat_with_claude_opus())
