"""
CrewAI Agent Framework - True Positive Test
This file demonstrates CrewAI usage that SHOULD be detected.
"""

from crewai import Agent, Task, Crew, Process
import os

# Create agents
researcher = Agent(
    role='Research Analyst',
    goal='Conduct thorough research on AI topics',
    backstory='Expert researcher with years of experience',
    verbose=True,
    allow_delegation=False,
    llm='gpt-4'
)

writer = Agent(
    role='Content Writer',
    goal='Write engaging content based on research',
    backstory='Professional writer specializing in technology',
    verbose=True,
    allow_delegation=False,
    llm='claude-3-sonnet'
)

# Define tasks
research_task = Task(
    description='Research the latest developments in AI',
    agent=researcher,
    expected_output='A comprehensive research report'
)

writing_task = Task(
    description='Write an article based on the research',
    agent=writer,
    expected_output='A well-written article'
)

# Create crew
crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, writing_task],
    process=Process.sequential,
    verbose=True
)

def run_crew():
    """Execute the crew workflow"""
    result = crew.kickoff()
    return result

if __name__ == "__main__":
    output = run_crew()
    print(output)
