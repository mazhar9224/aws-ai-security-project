# KMS Key for encryption
resource "aws_kms_key" "security_key" {
  description             = "KMS key for AI Security Platform"
  deletion_window_in_days = 7
  enable_key_rotation     = true

  tags = {
    Name = "ai-security-kms-${var.environment}"
  }
}

resource "aws_kms_alias" "security_key_alias" {
  name          = "alias/ai-security-${var.environment}"
  target_key_id = aws_kms_key.security_key.key_id
}

# Secrets Manager for API keys
resource "aws_secretsmanager_secret" "api_keys" {
  name        = "ai-security/api-keys/${var.environment}"
  description = "API keys for AI Security Platform"
  kms_key_id  = aws_kms_key.security_key.arn

  tags = {
    Name = "ai-security-api-keys"
  }
}

resource "aws_secretsmanager_secret_version" "api_keys" {
  secret_id = aws_secretsmanager_secret.api_keys.id
  secret_string = jsonencode({
    openai_api_key    = "PLACEHOLDER_SET_VIA_CONSOLE"
    anthropic_api_key = "PLACEHOLDER_SET_VIA_CONSOLE"
    jwt_secret        = "PLACEHOLDER_SET_VIA_CONSOLE"
  })
}

# IAM Role for Lambda
resource "aws_iam_role" "lambda_role" {
  name = "ai-security-lambda-role-${var.environment}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# IAM Policy for Lambda
resource "aws_iam_role_policy" "lambda_policy" {
  name = "ai-security-lambda-policy"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = aws_secretsmanager_secret.api_keys.arn
      }
    ]
  })
}

output "kms_key_arn" {
  value = aws_kms_key.security_key.arn
}