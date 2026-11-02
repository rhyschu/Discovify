from typing import Literal
from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class Song(StrictModel):
    id: int = Field(gt=0)
    title: str = Field(max_length=300)
    artist: str = Field(max_length=300)
    album: str = Field(default="", max_length=300)
    genres: str = Field(default="", max_length=300)
    release_date: str = Field(default="", max_length=10)


class Event(StrictModel):
    song_id: int = Field(gt=0)
    kind: Literal["listen", "favorite"]
    age_days: float = Field(default=0, ge=0)


class RecommendRequest(StrictModel):
    catalog: list[Song] = Field(max_length=10000)
    events: list[Event] = Field(default_factory=list, max_length=1000)
    intent: str = Field(default="", max_length=200)
    limit: int = Field(default=10, ge=1, le=20)


class Choice(StrictModel):
    song_id: int = Field(gt=0, strict=True)
    reason: str = Field(min_length=1, max_length=180)


class Ranking(StrictModel):
    recommendations: list[Choice] = Field(min_length=1, max_length=20)


class SearchArgs(StrictModel):
    query: str = Field(min_length=1, max_length=160)


class LookupArgs(StrictModel):
    song_id: int = Field(gt=0, strict=True)
