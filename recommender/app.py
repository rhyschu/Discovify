import asyncio
import hmac
import json
import logging
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv
load_dotenv(Path(__file__).resolve().parents[1] / ".env.local")
from fastapi import FastAPI, Header, HTTPException
from schemas import RecommendRequest
from agent import recommend, VERSION
from model_config import model_config

app = FastAPI(title="Discovify recommendation service", docs_url=None, redoc_url=None)
slots = asyncio.Semaphore(4)
log = logging.getLogger("uvicorn.error")


@app.get("/health")
def health():
    config=model_config()
    return {"status": "ok", "version": VERSION, "model_configured": bool(config['key'] and config['model']), 'provider':config['provider'], 'model':config['model']}


@app.post("/recommend")
async def endpoint(req: RecommendRequest, x_service_token: str = Header(default="")):
    expected = os.getenv("SERVICE_TOKEN", "")
    if not expected or not hmac.compare_digest(expected, x_service_token):
        raise HTTPException(401, "Invalid service token")
    try:
        await asyncio.wait_for(slots.acquire(), timeout=0.05)
    except TimeoutError:
        raise HTTPException(503, "Recommendation workers busy")
    try:
        result = await recommend(req)
        result["request_id"] = str(uuid.uuid4())
        log.info(json.dumps({k: v for k, v in result.items() if k != "recommendations"}))
        return result
    finally:
        slots.release()
