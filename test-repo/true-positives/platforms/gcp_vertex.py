"""
Google Vertex AI Platform - True Positive Test
This file demonstrates Google Vertex AI usage that SHOULD be detected.
"""

import os
from google.cloud import aiplatform
from vertexai.language_models import TextGenerationModel, ChatModel

# Initialize Vertex AI
aiplatform.init(
    project=os.environ.get("GCP_PROJECT_ID"),
    location="us-central1"
)

def use_palm2_text():
    """Use PaLM 2 for text generation"""
    model = TextGenerationModel.from_pretrained("text-bison@002")
    response = model.predict(
        "Explain machine learning",
        temperature=0.7,
        max_output_tokens=256
    )
    return response.text

def use_palm2_chat():
    """Use PaLM 2 for chat"""
    chat_model = ChatModel.from_pretrained("chat-bison@002")
    chat = chat_model.start_chat()
    response = chat.send_message("Hello, how are you?")
    return response.text

def use_gemini_vertex():
    """Use Gemini via Vertex AI"""
    from vertexai.generative_models import GenerativeModel
    
    model = GenerativeModel("gemini-pro")
    response = model.generate_content("What is AI?")
    return response.text

def use_gemini_multimodal():
    """Use Gemini for multimodal tasks"""
    from vertexai.generative_models import GenerativeModel, Part
    
    model = GenerativeModel("gemini-pro-vision")
    response = model.generate_content([
        "What's in this image?",
        Part.from_uri("gs://bucket/image.jpg", mime_type="image/jpeg")
    ])
    return response.text

# Vertex AI model configurations
VERTEX_MODELS = {
    "palm2_text": "text-bison@002",
    "palm2_chat": "chat-bison@002",
    "gemini_pro": "gemini-pro",
    "gemini_vision": "gemini-pro-vision",
    "gemini_15": "gemini-1.5-pro"
}

if __name__ == "__main__":
    print(use_palm2_text())
