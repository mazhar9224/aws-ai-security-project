from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from datetime import datetime
import os
import litellm
from dotenv import load_dotenv

load_dotenv()

litellm.drop_params = True

app = FastAPI(title="AI Security API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)

class AnalyzeRequest(BaseModel):
    message: str

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

    system_prompt = """You are an expert AI security analyst. Analyze the user's input for potential security threats.

For each analysis, provide:
1. THREAT TYPE: (e.g., SQL Injection, XSS, DDoS, Brute Force, Prompt Injection, Social Engineering, or NONE)
2. RISK SCORE: A number from 1-10 (10 = most dangerous)
3. ACTION: BLOCK, MONITOR, or ALLOW
4. EXPLANATION: Brief explanation of why this is or isn't a threat
5. RECOMMENDATION: What security measures to take

Format your response clearly with emojis for visual impact. Start with 🛡️ Security Analysis Complete!"""

    try:
        response = await litellm.acompletion(
            model="groq/llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Analyze this input for security threats: {request.message}"}
            ],
            api_key=os.getenv("GROQ_API_KEY"),
            max_tokens=500,
            temperature=0.3,
        )

        ai_response = response.choices[0].message.content
        model_used = "groq-llama3"

    except Exception as groq_error:
        print(f"Groq failed, trying Claude: {groq_error}")
        try:
            response = await litellm.acompletion(
                model="anthropic/claude-sonnet-4-5",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Analyze this input for security threats: {request.message}"}
                ],
                api_key=os.getenv("ANTHROPIC_API_KEY"),
                max_tokens=500,
                temperature=0.3,
            )
            ai_response = response.choices[0].message.content
            model_used = "claude-sonnet"

        except Exception as claude_error:
            raise HTTPException(status_code=503, detail=f"AI models unavailable: {str(claude_error)}")

    return {
        "response": ai_response,
        "model_used": model_used,
        "timestamp": datetime.utcnow().isoformat()
    }
