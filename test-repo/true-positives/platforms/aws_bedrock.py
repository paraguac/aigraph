"""
AWS Bedrock Platform - True Positive Test
This file demonstrates AWS Bedrock usage that SHOULD be detected.
"""

import boto3
import json

# Initialize Bedrock client
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

def invoke_titan_model():
    """Invoke Amazon Titan model"""
    response = bedrock.invoke_model(
        modelId='amazon.titan-text-express-v1',
        body=json.dumps({
            "inputText": "Explain machine learning",
            "textGenerationConfig": {
                "maxTokenCount": 512,
                "temperature": 0.7
            }
        })
    )
    return json.loads(response['body'].read())

def invoke_claude_on_bedrock():
    """Invoke Claude model via Bedrock"""
    response = bedrock.invoke_model(
        modelId='anthropic.claude-3-sonnet-20240229-v1:0',
        body=json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1024,
            "messages": [
                {
                    "role": "user",
                    "content": "What is quantum computing?"
                }
            ]
        })
    )
    return json.loads(response['body'].read())

def invoke_llama_on_bedrock():
    """Invoke LLaMA model via Bedrock"""
    response = bedrock.invoke_model(
        modelId='meta.llama3-70b-instruct-v1:0',
        body=json.dumps({
            "prompt": "Explain neural networks",
            "max_gen_len": 512,
            "temperature": 0.5
        })
    )
    return json.loads(response['body'].read())

def stream_bedrock_response():
    """Stream responses from Bedrock"""
    response = bedrock.invoke_model_with_response_stream(
        modelId='amazon.titan-text-express-v1',
        body=json.dumps({
            "inputText": "Write a story",
            "textGenerationConfig": {"maxTokenCount": 1024}
        })
    )
    
    for event in response['body']:
        chunk = json.loads(event['chunk']['bytes'])
        print(chunk.get('outputText', ''), end='')

# Bedrock model configurations
BEDROCK_MODELS = {
    "titan": "amazon.titan-text-express-v1",
    "claude": "anthropic.claude-3-sonnet-20240229-v1:0",
    "llama": "meta.llama3-70b-instruct-v1:0",
    "mistral": "mistral.mistral-7b-instruct-v0:2"
}

if __name__ == "__main__":
    print(invoke_titan_model())
