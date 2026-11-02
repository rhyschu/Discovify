-- Additive migration. Apply once with the local application database selected.
CREATE TABLE IF NOT EXISTS tb_listening_event (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  song_id BIGINT NOT NULL,
  event_id VARCHAR(64) NOT NULL,
  listened_seconds INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_listen_event (user_id, event_id),
  KEY ix_listen_profile (user_id, created_at),
  KEY ix_listen_song (song_id)
);
