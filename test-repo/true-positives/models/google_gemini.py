"""
Google Gemini Model Usage - True Positive Test
This file demonstrates Google Gemini usage that SHOULD be detected.
"""

import os
import google.generativeai as genai

# Configure the API key
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))

def use_gemini_pro():
    """Use Gemini Pro model"""
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Explain quantum physics")
    return response.text

def use_gemini_15_pro():
    """Use Gemini 1.5 Pro with multimodal"""
    model = genai.GenerativeModel('gemini-1.5-pro')
    response = model.generate_content([
        "What's in this image?",
        # Image would go here
    ])
    return response

def use_gemini_flash():
    """Use Gemini Flash for fast responses"""
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Quick summary of machine learning")
    return response.text

def streaming_gemini():
    """Stream responses from Gemini"""
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Tell me about AI", stream=True)
    for chunk in response:
        print(chunk.text, end='')

# Model configurations
GEMINI_MODELS = {
    "pro": "gemini-pro",
    "pro_vision": "gemini-pro-vision",
    "pro_15": "gemini-1.5-pro",
    "flash": "gemini-1.5-flash"
}

if __name__ == "__main__":
    print(use_gemini_pro())
