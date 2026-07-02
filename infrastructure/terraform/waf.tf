# WAF Web ACL for API Protection
resource "aws_wafv2_web_acl" "security_waf" {
  name        = "ai-security-waf-${var.environment}"
  description = "WAF for AI Security Platform"
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  # Rule 1: Block SQL Injection
  rule {
    name     = "BlockSQLInjection"
    priority = 1

    action {
      block {}
    }

    statement {
      sqli_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "URL_DECODE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockSQLInjection"
      sampled_requests_enabled   = true
    }
  }

  # Rule 2: Block XSS
  rule {
    name     = "BlockXSS"
    priority = 2

    action {
      block {}
    }

    statement {
      xss_match_statement {
        field_to_match {
          body {}
        }
        text_transformation {
          priority = 1
          type     = "HTML_ENTITY_DECODE"
        }
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "BlockXSS"
      sampled_requests_enabled   = true
    }
  }

  # Rule 3: Rate Limiting
  rule {
    name     = "RateLimit"
    priority = 3

    action {
      block {}
    }

    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }

    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "RateLimit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "SecurityWAF"
    sampled_requests_enabled   = true
  }
}

output "waf_arn" {
  value = aws_wafv2_web_acl.security_waf.arn
}