import json
import boto3
import logging
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info(f"Event received: {json.dumps(event)}")
    
    try:
        body = json.loads(event.get('body', '{}')) if isinstance(event.get('body'), str) else event.get('body', {})
        
        threat_type = body.get('threat_type', 'UNKNOWN')
        source_ip = body.get('source_ip', '0.0.0.0')
        
        threat_score = analyze_threat(threat_type, source_ip)
        
        result = {
            'threat_type': threat_type,
            'source_ip': source_ip,
            'threat_score': threat_score,
            'action': 'BLOCK' if threat_score > 7 else 'MONITOR',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Analysis result: {result}")
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(result)
        }
    
    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

def analyze_threat(threat_type, source_ip):
    scores = {
        'SQL_INJECTION': 9,
        'XSS': 7,
        'BRUTE_FORCE': 8,
        'DDoS': 10,
        'UNKNOWN': 5
    }
    return scores.get(threat_type, 5)