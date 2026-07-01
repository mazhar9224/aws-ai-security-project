from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import os

app = FastAPI(title="AI Security API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

class SecurityEvent(BaseModel):
    event_type: str
    severity: str
    description: str

@app.get("/")
def root():
    return {"message": "AI Security API is running", "status": "healthy"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.post("/auth/login")
def login(request: LoginRequest):
    if request.email and request.password:
        return {"token": "demo-token-123", "user": request.email, "role": "admin"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/security/status")
def security_status():
    return {
        "waf_status": "active",
        "threats_blocked": 247,
        "api_calls": 1893,
        "last_updated": datetime.utcnow().isoformat()
    }

@app.get("/security/events")
def get_events():
    return {"events": [
        {"id": 1, "type": "SQL_INJECTION", "severity": "HIGH", "blocked": True, "timestamp": datetime.utcnow().isoformat()},
        {"id": 2, "type": "XSS_ATTEMPT", "severity": "MEDIUM", "blocked": True, "timestamp": datetime.utcnow().isoformat()},
    ]}