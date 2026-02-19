"""
AutoGen Multi-Agent System - True Positive Test
This file demonstrates AutoGen usage that SHOULD be detected.
"""

import os
from autogen import AssistantAgent, UserProxyAgent, config_list_from_json

# Configure LLM
config_list = config_list_from_json(env_or_file="OAI_CONFIG_LIST")

# Create assistant agent
assistant = AssistantAgent(
    name="assistant",
    llm_config={
        "config_list": config_list,
        "temperature": 0,
        "model": "gpt-4"
    }
)

# Create user proxy agent
user_proxy = UserProxyAgent(
    name="user_proxy",
    human_input_mode="NEVER",
    max_consecutive_auto_reply=10,
    code_execution_config={
        "work_dir": "coding",
        "use_docker": False,
    }
)

def run_multi_agent_task():
    """Run a multi-agent task with AutoGen"""
    user_proxy.initiate_chat(
        assistant,
        message="Write a Python function to calculate fibonacci numbers"
    )

def create_group_chat():
    """Create a group chat with multiple agents"""
    from autogen import GroupChat, GroupChatManager
    
    engineer = AssistantAgent(
        name="engineer",
        llm_config={"config_list": config_list, "model": "gpt-4"}
    )
    
    scientist = AssistantAgent(
        name="scientist",
        llm_config={"config_list": config_list, "model": "gpt-4"}
    )
    
    groupchat = GroupChat(
        agents=[engineer, scientist, user_proxy],
        messages=[],
        max_round=12
    )
    
    manager = GroupChatManager(groupchat=groupchat, llm_config={"config_list": config_list})
    return manager

if __name__ == "__main__":
    run_multi_agent_task()
