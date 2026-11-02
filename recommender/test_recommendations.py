import asyncio
import pytest
from fastapi.testclient import TestClient
from agent import recommend
from schemas import Song, Event, RecommendRequest
from retrieval import profile, retrieve


def request():
    return RecommendRequest(catalog=[Song(id=i,title=f"Track {i}",artist=f"Artist {i%5}",genres="Pop" if i%2 else "Rock",album=f"Album {i%3}") for i in range(1,41)], events=[Event(song_id=1,kind="favorite"),Event(song_id=2,kind="listen")],limit=10)


class Gateway:
    rerank_profile = True
    model = "test-double-not-a-real-model"
    timeout = 1
    def __init__(self, behavior="valid"):
        self.behavior=behavior
        self.calls=0
    async def rank(self,s):
        self.calls+=1
        if self.behavior == "timeout":
            await asyncio.sleep(3)
        if self.behavior == "exception":
            raise ValueError("malformed JSON")
        ids=[c["id"] for c in s["candidates"][:s["request"].limit]]
        if self.behavior == "invalid" or (self.behavior == "repair" and self.calls==1):
            ids=[999999]*10
        if self.behavior == "excluded":
            ids[0]=1
        return {"recommendations":[{"song_id":i,"reason":"Shares a catalog genre."} for i in ids]},[],{"model_calls":1}


@pytest.mark.asyncio
@pytest.mark.parametrize("behavior,mode,calls",[("valid","agent",1),("repair","agent",2),("invalid","fallback",2),("excluded","fallback",2),("exception","fallback",2),("timeout","fallback",1)])
async def test_faults(behavior,mode,calls):
    gateway=Gateway(behavior)
    result=await recommend(request(),gateway)
    ids=[c["song_id"] for c in result["recommendations"]]
    assert result["mode"]==mode
    assert len(ids)==len(set(ids))==10
    assert set(ids).isdisjoint({1,2,999999})
    assert gateway.calls==calls


@pytest.mark.asyncio
async def test_empty_and_cold_start():
    gateway=Gateway()
    result=await recommend(RecommendRequest(catalog=[]),gateway)
    assert result["recommendations"]==[] and gateway.calls==0
    req=request().model_copy(update={"events":[]})
    first=await recommend(req,gateway)
    second=await recommend(req,gateway)
    assert first["recommendations"]==second["recommendations"]
    assert gateway.calls==0


def test_decay_and_repeat_cap():
    req=request().model_copy(update={"events":[Event(song_id=1,kind="listen",age_days=14),Event(song_id=2,kind="listen",age_days=0)]})
    assert profile(req)["weights"][1]==pytest.approx(0.5)
    assert profile(req)["weights"][2]==1
    repeated=req.model_copy(update={"events":[Event(song_id=1,kind="listen")]*100})
    assert profile(repeated)["weights"][1]==6


def test_profile_isolation_and_exclusion():
    a=request()
    b=a.model_copy(update={"events":[Event(song_id=3,kind="favorite")]})
    ra=retrieve(a,profile(a)); rb=retrieve(b,profile(b))
    assert 1 not in [c["id"] for c in ra]
    assert 3 not in [c["id"] for c in rb]
    assert ra!=rb


def test_api_auth_and_schema(monkeypatch):
    from app import app
    monkeypatch.setenv("SERVICE_TOKEN","local-test")
    with TestClient(app) as client:
        assert client.post("/recommend",json=request().model_dump()).status_code==401
        body=request().model_dump(); body["limit"]=999
        assert client.post("/recommend",json=body,headers={"X-Service-Token":"local-test"}).status_code==422


@pytest.mark.asyncio
async def test_small_catalog():
    req=request().model_copy(update={"catalog":request().catalog[:4]})
    result=await recommend(req,Gateway())
    assert {c["song_id"] for c in result["recommendations"]}=={3,4}


@pytest.mark.asyncio
async def test_default_profile_does_not_spend_model_tokens():
    gateway=Gateway(); gateway.rerank_profile=False
    result=await recommend(request(),gateway)
    assert result["mode"]=="content" and gateway.calls==0


@pytest.mark.asyncio
async def test_actual_gateway_tool_budget(monkeypatch):
    import httpx
    from agent import ModelGateway
    import json
    req=request(); candidates=retrieve(req,profile(req))
    count=0
    def response(call):
        nonlocal count
        count+=1
        if count==1:
            calls=[{"id":str(i),"type":"function","function":{"name":"lookup_candidate","arguments":json.dumps({"song_id":candidates[i]["id"]})}} for i in range(6)]
            message={"role":"assistant","content":None,"tool_calls":calls}
        else:
            sent=json.loads(call.content)
            observations=[json.loads(m["content"]) for m in sent["messages"] if m["role"]=="tool"]
            assert len(observations)==6
            assert sum("error" in o for o in observations)==2
            message={"role":"assistant","content":json.dumps({"recommendations":[{"song_id":c["id"],"reason":"Catalog match."} for c in candidates[:10]]})}
        return httpx.Response(200,json={"choices":[{"message":message}],"usage":{"total_tokens":100}})
    original=httpx.AsyncClient
    monkeypatch.setattr(httpx,"AsyncClient",lambda **kwargs: original(transport=httpx.MockTransport(response),**kwargs))
    gateway=ModelGateway(rerank_profile=True); gateway.model="test"; gateway.base="https://model.test"; gateway.key=""
    result=await recommend(req,gateway)
    assert result["mode"]=="agent" and count==2
    assert result["usage"]["total_tokens"]==200
