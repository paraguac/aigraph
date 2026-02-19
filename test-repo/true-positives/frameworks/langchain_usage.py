"""
LangChain Framework Usage - True Positive Test
This file demonstrates LangChain usage that SHOULD be detected.
"""

from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType

# Initialize LLM
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Simple chain
prompt = ChatPromptTemplate.from_template("Tell me about {topic}")
chain = LLMChain(llm=llm, prompt=prompt)

def simple_chain_example():
    """Simple LangChain example"""
    result = chain.run(topic="artificial intelligence")
    return result

# Agent with tools
def create_agent():
    """Create a LangChain agent"""
    tools = [
        Tool(
            name="Calculator",
            func=lambda x: eval(x),
            description="Useful for math calculations"
        )
    ]
    
    agent = initialize_agent(
        tools=tools,
        llm=llm,
        agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        verbose=True
    )
    return agent

# Memory-enabled conversation
def conversation_with_memory():
    """LangChain with conversation memory"""
    memory = ConversationBufferMemory()
    conversation = LLMChain(
        llm=llm,
        prompt=ChatPromptTemplate.from_template("{input}"),
        memory=memory
    )
    return conversation

if __name__ == "__main__":
    result = simple_chain_example()
    print(result)
