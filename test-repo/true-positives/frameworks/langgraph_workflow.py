"""
LangGraph Workflow - True Positive Test
This file demonstrates LangGraph usage that SHOULD be detected.
"""

from langgraph.graph import StateGraph, END
from langchain.chat_models import ChatOpenAI
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    next: str

def create_research_workflow():
    """Create a LangGraph workflow"""
    workflow = StateGraph(AgentState)
    
    # Define nodes
    def researcher(state):
        llm = ChatOpenAI(model="gpt-4")
        response = llm.predict("Research topic")
        return {"messages": [response]}
    
    def writer(state):
        llm = ChatOpenAI(model="gpt-4")
        messages = state["messages"]
        response = llm.predict(f"Write about: {messages}")
        return {"messages": [response]}
    
    # Add nodes to graph
    workflow.add_node("research", researcher)
    workflow.add_node("write", writer)
    
    # Add edges
    workflow.add_edge("research", "write")
    workflow.add_edge("write", END)
    
    # Set entry point
    workflow.set_entry_point("research")
    
    return workflow.compile()

def simple_langgraph_example():
    """Simple LangGraph state machine"""
    from langgraph.graph import Graph
    
    graph = Graph()
    graph.add_node("start", lambda x: {"value": x})
    graph.add_node("process", lambda x: {"value": x["value"] * 2})
    graph.add_edge("start", "process")
    
    return graph

if __name__ == "__main__":
    app = create_research_workflow()
    result = app.invoke({"messages": []})
    print(result)
