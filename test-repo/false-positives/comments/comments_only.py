"""
Comments with AI Terms - False Positive Test
This file contains AI terms only in comments, which should NOT be detected
(or filtered out when --include-comments is not used).
"""

def process_data(data):
    """
    Process user data.
    
    # TODO: Consider using GPT-4 for data validation in the future
    # We might want to integrate Claude for sentiment analysis
    # LangChain could help with document processing
    """
    # GPT-4 would be great here but we use simple regex instead
    # Claude-3-Sonnet might improve accuracy by 20%
    # Mistral and LLaMA models are also possibilities
    
    result = []
    for item in data:
        # This is a simple filter, not using gpt-4 or claude
        # In production we considered using gemini-pro
        if item.strip():
            result.append(item.upper())
    
    return result

def calculate_score(text):
    """
    Calculate a score for text.
    
    NOTE: We evaluated multiple AI models for this:
    - GPT-4: Too expensive ($$$)
    - Claude-3-Opus: Good but slow
    - Mistral-7B: Fast but less accurate
    - LLaMA-2: Open source option
    
    Decision: Use traditional NLP instead
    """
    # Not using langchain or any AI framework here
    # Just simple word count
    return len(text.split())

# The following code does NOT use any AI:
# - No openai imports
# - No anthropic SDK
# - No langchain integration
# - No autogen agents
# - No crewai crews
# - No llamaindex vector stores

def main():
    # Regular Python code, no AI involved
    # Even though comments mention gpt-4, claude, etc.
    data = ["hello", "world", "test"]
    processed = process_data(data)
    print(processed)

if __name__ == "__main__":
    main()
