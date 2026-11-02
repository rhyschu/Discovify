"""Local maintenance: read credentials without printing them; export no account data."""
import argparse
import json
from pathlib import Path
from urllib.parse import urlparse
import pymysql
import yaml

ROOT = Path(__file__).resolve().parents[1]


def connect():
    config = yaml.safe_load((ROOT / "server/application-local.yml").read_text(encoding="utf-8-sig"))
    ds = config["spring"]["datasource"]
    uri = urlparse(ds["url"].removeprefix("jdbc:"))
    return pymysql.connect(host=uri.hostname, port=uri.port or 3306, user=ds["username"],
                           password=str(ds["password"]), database=uri.path.lstrip("/"),
                           charset="utf8mb4", cursorclass=pymysql.cursors.DictCursor)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("action", choices=["migrate", "export"])
    args = p.parse_args()
    with connect() as conn, conn.cursor() as cur:
        if args.action == "migrate":
            cur.execute((ROOT / "server/sql/migrations/002_listening_events.sql").read_text())
            conn.commit()
            print("Listening event table ready (additive migration).")
        else:
            cur.execute("""SELECT s.id,s.name AS title,COALESCE(a.name,'Unknown artist') AS artist,
                COALESCE(s.album,'') AS album,COALESCE(s.style,'') AS genres,
                COALESCE(DATE_FORMAT(s.release_time,'%Y-%m-%d'),'') AS release_date
                FROM tb_song s LEFT JOIN tb_artist a ON a.id=s.artist_id
                WHERE s.audio_url IS NOT NULL AND s.audio_url<>'' ORDER BY s.id""")
            catalog = cur.fetchall()
            cur.execute("SELECT playlist_id,song_id FROM tb_playlist_binding ORDER BY playlist_id,song_id")
            bindings = cur.fetchall()
            target = Path(__file__).with_name("data")
            target.mkdir(exist_ok=True)
            (target/"catalog.json").write_text(json.dumps(catalog,ensure_ascii=False,indent=2),encoding="utf-8")
            (target/"playlists.json").write_text(json.dumps(bindings,indent=2),encoding="utf-8")
            print(f"Exported {len(catalog)} catalog records and {len(bindings)} playlist bindings; no users or credentials.")


if __name__ == "__main__":
    main()
