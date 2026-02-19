# Terraform configuration with AI services - True Positive Test

# AWS Bedrock configuration
resource "aws_bedrock_model" "claude" {
  model_id = "anthropic.claude-3-sonnet-20240229-v1:0"
  
  tags = {
    Name = "claude-3-sonnet"
    Environment = "production"
  }
}

resource "aws_bedrock_model" "titan" {
  model_id = "amazon.titan-text-express-v1"
  
  tags = {
    Name = "titan-text"
  }
}

# Lambda function using Bedrock
resource "aws_lambda_function" "ai_processor" {
  function_name = "ai-text-processor"
  runtime       = "python3.11"
  
  environment {
    variables = {
      BEDROCK_MODEL_ID = "anthropic.claude-3-sonnet-20240229-v1:0"
      BACKUP_MODEL_ID  = "amazon.titan-text-express-v1"
    }
  }
}

# Azure OpenAI configuration
resource "azurerm_cognitive_account" "openai" {
  name                = "ai-openai-account"
  location            = "eastus"
  resource_group_name = "ai-resources"
  kind                = "OpenAI"
  sku_name           = "S0"
  
  tags = {
    model = "gpt-4"
  }
}

resource "azurerm_cognitive_deployment" "gpt4" {
  name                 = "gpt-4-deployment"
  cognitive_account_id = azurerm_cognitive_account.openai.id
  
  model {
    format  = "OpenAI"
    name    = "gpt-4"
    version = "0613"
  }
  
  sku {
    name     = "Standard"
    capacity = 10
  }
}

# Google Vertex AI configuration
resource "google_vertex_ai_endpoint" "gemini" {
  name         = "gemini-pro-endpoint"
  display_name = "Gemini Pro Model Endpoint"
  location     = "us-central1"
  
  labels = {
    model = "gemini-pro"
  }
}

# ECS task definition with AI models
resource "aws_ecs_task_definition" "ai_service" {
  family = "ai-service"
  
  container_definitions = jsonencode([
    {
      name  = "openai-service"
      image = "ai-app:latest"
      environment = [
        {
          name  = "MODEL_NAME"
          value = "gpt-4"
        },
        {
          name  = "FRAMEWORK"
          value = "langchain"
        }
      ]
    }
  ])
}
