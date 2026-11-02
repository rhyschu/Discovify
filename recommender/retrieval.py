"""Local, reproducible retrieval. No audio embeddings or invented acoustic attributes."""
from collections import Counter, defaultdict
from functools import lru_cache
import math
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from schemas import RecommendRequest, Song


def tags(song: Song) -> set[str]:
    return {s.strip().lower() for s in song.genres.split(",") if s.strip()}


@lru_cache(maxsize=4)
def index(rows: tuple):
    vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4), max_features=20000)
    # Character ngrams support the mixed English/Chinese catalog without a tokenizer service.
    matrix = vectorizer.fit_transform([" ".join(row[1:]) or "unknown" for row in rows])
    return vectorizer, matrix


def profile(req: RecommendRequest) -> dict:
    songs = {s.id: s for s in req.catalog}
    weights = defaultdict(float)
    for e in req.events:
        if e.song_id in songs:
            weights[e.song_id] += (3 if e.kind == "favorite" else 1) * math.exp(-math.log(2) * e.age_days / 14)
    # Repeating a single song cannot dominate the entire profile.
    weights = {sid: min(6, w) for sid, w in weights.items()}
    artists, genres = Counter(), Counter()
    for sid, w in weights.items():
        artists[songs[sid].artist] += w
        for genre in tags(songs[sid]):
            genres[genre] += w
    return {"weights": weights, "artists": artists, "genres": genres}


def retrieve(req: RecommendRequest, pref: dict) -> list[dict]:
    if not req.catalog:
        return []
    rows = tuple((s.id, s.title, s.artist, s.album, s.genres) for s in req.catalog)
    vectorizer, matrix = index(rows)
    weights = np.array([pref["weights"].get(s.id, 0) for s in req.catalog])
    sim = np.zeros(len(rows))
    if weights.sum():
        centroid = matrix.T.dot(weights / weights.sum())
        sim = np.asarray(matrix.dot(centroid)).ravel()
    intent = np.asarray((matrix @ vectorizer.transform([req.intent]).T).toarray()).ravel() if req.intent.strip() else np.zeros(len(rows))
    # Exclude current favorites and recent listens; older listening history remains eligible.
    excluded = {e.song_id for e in req.events if e.kind == "favorite" or e.age_days < 7}
    eligible = [i for i, s in enumerate(req.catalog) if s.id not in excluded]
    scores = defaultdict(float)
    channels = [
        (sim, 1.0),
        (np.array([pref["artists"].get(s.artist, 0) for s in req.catalog]), 1.0),
        (np.array([sum(pref["genres"].get(g, 0) for g in tags(s)) for s in req.catalog]), 0.7),
        (intent, 1.5),
    ]
    for values, weight in channels:
        ranked = sorted((i for i in eligible if values[i] > 0), key=lambda i: (-values[i], req.catalog[i].id))[:60]
        for rank, i in enumerate(ranked, 1):
            scores[i] += weight / (60 + rank)
    # Stable cold-start order, not invented popularity. Variety is enforced below.
    ranked = sorted(eligible, key=lambda i: (-scores[i], req.catalog[i].id))[:60]
    output = []
    used = Counter()
    while ranked:
        # Soft diversity penalty retains a relevant same-artist track if it is clearly best.
        i = max(ranked, key=lambda j: (scores[j] / (1 + 0.6 * used[req.catalog[j].artist]), -req.catalog[j].id))
        ranked.remove(i)
        song = req.catalog[i]
        used[song.artist] += 1
        reason = "Explore another artist in the catalog."
        if song.artist in pref["artists"]:
            reason = "More from an artist in your listening and liked-song profile."
        elif tags(song) & pref["genres"].keys():
            reason = "Shares genres with your listening and liked-song profile."
        elif intent[i] > 0:
            reason = "Matches your request in the catalog metadata."
        output.append({**song.model_dump(), "score": round(scores[i], 6), "reason": reason})
    return output[:40]
