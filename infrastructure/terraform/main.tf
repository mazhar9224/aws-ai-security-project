terraform {
  required_version = ">= 1.12.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "AI-Security-Project"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "ai-security-team"
    }
  }
}