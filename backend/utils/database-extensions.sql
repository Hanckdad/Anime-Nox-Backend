-- Cached data for better performance
CREATE TABLE cached_recent_episodes (
    id SERIAL PRIMARY KEY,
    anime_id TEXT NOT NULL,
    anime_title TEXT NOT NULL,
    episode_id TEXT NOT NULL UNIQUE,
    episode_number INTEGER NOT NULL,
    episode_title TEXT,
    image TEXT,
    url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cached_trending_anime (
    id SERIAL PRIMARY KEY,
    anime_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    image TEXT,
    url TEXT,
    genres TEXT[],
    position INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cached_popular_anime (
    id SERIAL PRIMARY KEY,
    anime_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    image TEXT,
    url TEXT,
    genres TEXT[],
    position INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cached tables
CREATE INDEX idx_cached_recent_updated ON cached_recent_episodes(updated_at);
CREATE INDEX idx_cached_trending_updated ON cached_trending_anime(updated_at);
CREATE INDEX idx_cached_popular_updated ON cached_popular_anime(updated_at);

-- Function to clean old cached data
CREATE OR REPLACE FUNCTION clean_old_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM cached_recent_episodes WHERE updated_at < NOW() - INTERVAL '1 hour';
    DELETE FROM cached_trending_anime WHERE updated_at < NOW() - INTERVAL '6 hours';
    DELETE FROM cached_popular_anime WHERE updated_at < NOW() - INTERVAL '6 hours';
END;
$$ LANGUAGE plpgsql;
