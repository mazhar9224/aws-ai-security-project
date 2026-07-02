# API Gateway REST API
resource "aws_api_gateway_rest_api" "security_api" {
  name        = "ai-security-api-${var.environment}"
  description = "AI Security Platform API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "ai-security-api"
  }
}

# /security resource
resource "aws_api_gateway_resource" "security" {
  rest_api_id = aws_api_gateway_rest_api.security_api.id
  parent_id   = aws_api_gateway_rest_api.security_api.root_resource_id
  path_part   = "security"
}

# /security/analyze resource
resource "aws_api_gateway_resource" "analyze" {
  rest_api_id = aws_api_gateway_rest_api.security_api.id
  parent_id   = aws_api_gateway_resource.security.id
  path_part   = "analyze"
}

# POST method on /security/analyze
resource "aws_api_gateway_method" "analyze_post" {
  rest_api_id   = aws_api_gateway_rest_api.security_api.id
  resource_id   = aws_api_gateway_resource.analyze.id
  http_method   = "POST"
  authorization = "NONE"
}

# Lambda integration
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.security_api.id
  resource_id             = aws_api_gateway_resource.analyze.id
  http_method             = aws_api_gateway_method.analyze_post.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.aws_region}:lambda:path/2015-03-31/functions/arn:aws:lambda:${var.aws_region}:210041661161:function:security-analyzer/invocations"
}

# API deployment
resource "aws_api_gateway_deployment" "security_api" {
  depends_on  = [aws_api_gateway_integration.lambda_integration]
  rest_api_id = aws_api_gateway_rest_api.security_api.id
  stage_name  = var.environment
}

output "api_gateway_url" {
  value = aws_api_gateway_deployment.security_api.invoke_url
}