
import os
import secrets
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
from dotenv import load_dotenv
from crewai import Crew, Process
from agents import ProjectAgents
from tasks import ProjectTasks
from vault_service import FHEVault

# Load environment logic
load_dotenv()


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data Models
class ChatRequest(BaseModel):
    anonymized_text: str
    encrypted_blobs: Dict[str, str] # Token -> Blob

class ChatResponse(BaseModel):
    template: str
    category: str

# Mock Blind Pattern Matcher
# In a real FHE system, this would inspect encrypted properties or Zero-Knowledge Proofs.
# Here, we inspect the "Structure" (Anonymized Text) and the "Existence" of blobs.
def blind_classify(text: str, blobs: Dict[str, str]) -> str:
    text_lower = text.lower()
    if "[amount_" in text_lower or "money" in text_lower or "interest" in text_lower or "loan" in text_lower:
        return "FINANCIAL"
    elif "health" in text_lower or "doctor" in text_lower:
        return "MEDICAL"
    else:
        return "GENERAL"

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(req: ChatRequest):
    print(f"\n--- [Proxy Gateway] Received Request ---")
    print(f"Structure: {req.anonymized_text}")
    print(f"Blobs Held (Blindly): {list(req.encrypted_blobs.keys())}")
    
    category = blind_classify(req.anonymized_text, req.encrypted_blobs)
    print(f"Blind Category: {category}")

    # Initialize Agents (Lazy load or global)
    agents = ProjectAgents()
    tasks = ProjectTasks()
    
    response_template = ""
    
    if category == "FINANCIAL":
        # Financial Flow: Check Limits, Calculate, etc.
        # Ideally, we inject the BLIND BLOBS into the agent's context.
        # The agent sees "[AMOUNT_1]" and can use tool "AskVault([AMOUNT_1])".
        
        # We need to map the incoming blobs to the Vault so the Agent can reference them.
        # In a real system, the blobs are persistent or session-based.
        # Here we just inject them into our static Vault for this request scope.
        for token, blob in req.encrypted_blobs.items():
            # For the simulation, we need actual values to compare, but the frontend sent mock blobs?
            # Wait, the frontend `CryptoService` generates REAL encrypted AES blobs. 
            # The `FHEVault` in `vault_service.py` expects to `encrypt(value)` itself to store `_store[blob] = value`.
            # Since we can't decrypt the AES blob from frontend (we don't have the key), 
            # we cannot put the real value in `_store`.
            
            # CRITICAL ARCHITECTURE MOCKING:
            # We are simulating FHE. The Frontend sends "0x..." (AES).
            # The Proxy receives "0x...".
            # If we want the Agent to "Compare" blindly, the Vault needs to work on these blobs.
            # But `FHEVault` in `vault_service.py` is a Python generic mock that holds the REAL value to do the comparison.
            
            # SOLUTION FOR DEMO:
            # We will trust the existence of the blob. 
            # If the user asks for "Interest on [AMOUNT_1]", the Agent will ask Gemini:
            # "Calculate interest for a user with [AMOUNT_1] loan. Use generic rates."
            # Gemini returns: "Interest for [AMOUNT_1] is 5%."
            # The Agent doesn't strictly need to compare limits unless it's a decision task.
            pass

        # Use the "Decision Maker" agent?
        # Let's keep it simple for the Chat Assistant.
        # We ask Gemini to generate the response template based on the anonymized text.
        
        # We construct a prompt for Gemini specifically to handle the tokens.
        
        agent = agents.decision_maker_agent()
        
        # For a simple chat response, we might not need the full Crew logic if it's just Q&A.
        # But let's use the Agent to show "Agentic" processing.
        
        # Task: Generate a response template.
        prompt = f"""
        You are a Privacy-First Assistant.
        User says: "{req.anonymized_text}"
        
        The user has provided encrypted blobs for the tokens (e.g., [AMOUNT_1]).
        You DO NOT know the values.
        
        Provide a helpful response using the SAME tokens. 
        Do not make up values. Use the tokens as variables.
        Example: "The interest on [AMOUNT_1] would be..."
        """
        
        # Direct LLM call might be faster than Crew for this interactive chat.
        # But let's use the agent's LLM.
        response = agent.llm.call([
            {"role": "system", "content": agent.backstory},
            {"role": "user", "content": prompt}
        ])
        
        response_template = response
        
    else:
        # General Chat
        agent = agents.decision_maker_agent()
        response = agent.llm.call([
             {"role": "system", "content": "You are a helpful assistant. Maintain privacy tokens."},
             {"role": "user", "content": req.anonymized_text}
        ])
        response_template = response

    return ChatResponse(template=response_template, category=category)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
