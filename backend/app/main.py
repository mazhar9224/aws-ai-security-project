from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime
import os
import boto3

# Secrets Manager cache (loaded once per Lambda container)
_secrets_cache = {}

def get_secret(secret_name: str) -> str:
    if secret_name not in _secrets_cache:
        client = boto3.client("secretsmanager", region_name="us-east-1")
        response = client.get_secret_value(SecretId=secret_name)
        _secrets_cache[secret_name] = response["SecretString"]
    return _secrets_cache[secret_name]

import httpx
from dotenv import load_dotenv
from mangum import Mangum

load_dotenv()

app = FastAPI(title="AI Security API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://main.dganwerfaop4v.amplifyapp.com",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

class AnalyzeRequest(BaseModel):
    message: str

SYSTEM_PROMPT = """You are an expert AI security analyst. Analyze the user's input for potential security threats.

For each analysis, provide:
1. THREAT TYPE: (e.g., SQL Injection, XSS, DDoS, Brute Force, Prompt Injection, Social Engineering, or NONE)
2. RISK SCORE: A number from 1-10 (10 = most dangerous)
3. ACTION: BLOCK, MONITOR, or ALLOW
4. EXPLANATION: Brief explanation of why this is or isn't a threat
5. RECOMMENDATION: What security measures to take

Format your response clearly with emojis for visual impact. Start with 🛡️ Security Analysis Complete!"""

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/analyze")
async def analyze_threat(
    request: AnalyzeRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    groq_api_key = get_secret("ai-security/groq-api-key")
    anthropic_api_key = get_secret("ai-security/anthropic-api-key")

    # Try Groq first (fast & free)
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {groq_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Analyze this input for security threats: {request.message}"}
                    ],
                    "max_tokens": 500,
                    "temperature": 0.3
                }
            )
            response.raise_for_status()
            data = response.json()
            ai_response = data["choices"][0]["message"]["content"]
            model_used = "groq-llama3"

    except Exception as groq_error:
        # Fallback to Anthropic Claude
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": anthropic_api_key,
                        "anthropic-version": "2023-06-01",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "claude-sonnet-4-5",
                        "max_tokens": 500,
                        "system": SYSTEM_PROMPT,
                        "messages": [
                            {"role": "user", "content": f"Analyze this input for security threats: {request.message}"}
                        ]
                    }
                )
                response.raise_for_status()
                data = response.json()
                ai_response = data["content"][0]["text"]
                model_used = "claude-sonnet"

        except Exception as claude_error:
            raise HTTPException(status_code=503, detail=f"AI models unavailable: {str(claude_error)}")

    return {
        "response": ai_response,
        "model_used": model_used,
        "timestamp": datetime.utcnow().isoformat()
    }

handler = Mangum(app, lifespan="off")
