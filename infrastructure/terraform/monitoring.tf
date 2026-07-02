# CloudWatch Log Group for Security Events
resource "aws_cloudwatch_log_group" "security_logs" {
  name              = "/ai-security/${var.environment}/events"
  retention_in_days = 30
}

# CloudWatch Metric Alarm - High Threat Count
resource "aws_cloudwatch_metric_alarm" "high_threat_count" {
  alarm_name          = "high-threat-count-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "BlockedRequests"
  namespace           = "AWS/WAFV2"
  period              = "300"
  statistic           = "Sum"
  threshold           = "100"
  alarm_description   = "WAF blocked more than 100 requests in 5 minutes"

  dimensions = {
    WebACL = "ai-security-waf-${var.environment}"
    Region = var.aws_region
    Rule   = "ALL"
  }

  alarm_actions = [aws_sns_topic.security_alerts.arn]
}

# CloudWatch Metric Alarm - Lambda Errors
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = "60"
  statistic           = "Sum"
  threshold           = "5"
  alarm_description   = "Lambda function errors exceeded threshold"

  dimensions = {
    FunctionName = "security-analyzer"
  }

  alarm_actions = [aws_sns_topic.security_alerts.arn]
}

# SNS Topic for Security Alerts
resource "aws_sns_topic" "security_alerts" {
  name = "security-alerts-${var.environment}"
}

# SNS Email Subscription
resource "aws_sns_topic_subscription" "security_email" {
  topic_arn = aws_sns_topic.security_alerts.arn
  protocol  = "email"
  endpoint  = "mak9224@gmail.com"
}

output "sns_topic_arn" {
  value = aws_sns_topic.security_alerts.arn
}