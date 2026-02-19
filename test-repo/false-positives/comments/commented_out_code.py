"""
Commented Out AI Code - False Positive Test
This file has AI code that is commented out and should NOT be active.
"""

# This entire block is commented out - no actual AI usage

# from openai import OpenAI
# client = OpenAI()
# 
# def chat_with_gpt4():
#     response = client.chat.completions.create(
#         model="gpt-4",
#         messages=[{"role": "user", "content": "Hello"}]
#     )
#     return response
# 
# from anthropic import Anthropic
# claude_client = Anthropic()
# 
# def chat_with_claude():
#     message = claude_client.messages.create(
#         model="claude-3-sonnet-20240229",
#         max_tokens=1024,
#         messages=[{"role": "user", "content": "Hi"}]
#     )
#     return message
#
# from langchain import ChatOpenAI
# llm = ChatOpenAI(model="gpt-4")
#
# import ollama
# response = ollama.chat(model='llama2', messages=[])

def actual_code():
    """This is the actual code - no AI usage"""
    return "Hello, World!"

"""
The code below was considered but not implemented:

from langgraph.graph import StateGraph
from autogen import AssistantAgent
from crewai import Agent
import google.generativeai as genai

model = genai.GenerativeModel('gemini-pro')
"""

if __name__ == "__main__":
    print(actual_code())
