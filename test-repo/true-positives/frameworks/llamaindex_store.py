"""
LlamaIndex Vector Store - True Positive Test
This file demonstrates LlamaIndex usage that SHOULD be detected.
"""

from llama_index import VectorStoreIndex, SimpleDirectoryReader, ServiceContext
from llama_index.llms import OpenAI
from llama_index.embeddings import OpenAIEmbedding
import os

# Configure LLM
llm = OpenAI(model="gpt-4", api_key=os.environ.get("OPENAI_API_KEY"))
embed_model = OpenAIEmbedding(model="text-embedding-ada-002")

def create_index():
    """Create a LlamaIndex vector store"""
    documents = SimpleDirectoryReader("data").load_data()
    
    service_context = ServiceContext.from_defaults(
        llm=llm,
        embed_model=embed_model
    )
    
    index = VectorStoreIndex.from_documents(
        documents,
        service_context=service_context
    )
    return index

def query_index():
    """Query the vector store"""
    index = create_index()
    query_engine = index.as_query_engine()
    response = query_engine.query("What is the main topic?")
    return response

def chat_with_index():
    """Chat with the indexed documents"""
    index = create_index()
    chat_engine = index.as_chat_engine()
    response = chat_engine.chat("Tell me about the document")
    return response

if __name__ == "__main__":
    response = query_index()
    print(response)
