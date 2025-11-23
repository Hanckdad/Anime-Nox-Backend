import axios from 'axios'

const CONSUMET_BASE_URL = 'https://consumet-api-production-5f96.up.railway.app'

class ConsumetAPI {
  constructor() {
    this.client = axios.create({
      baseURL: CONSUMET_BASE_URL,
      timeout: 10000,
      headers: {
        'User-Agent': 'AnimeNox/1.0.0'
      }
    })
  }

  async getTrending(page = 1) {
    try {
      const response = await this.client.get('/anime/gogoanime/top-airing', {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch trending anime: ${error.message}`)
    }
  }

  async getPopular(page = 1) {
    try {
      const response = await this.client.get('/anime/gogoanime/popular', {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch popular anime: ${error.message}`)
    }
  }

  async getRecentEpisodes(page = 1, type = 1) {
    try {
      const response = await this.client.get('/anime/gogoanime/recent-episodes', {
        params: { page, type }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch recent episodes: ${error.message}`)
    }
  }

  async searchAnime(query, page = 1) {
    try {
      const response = await this.client.get(`/anime/gogoanime/${encodeURIComponent(query)}`, {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to search anime: ${error.message}`)
    }
  }

  async getAnimeInfo(animeId) {
    try {
      const response = await this.client.get(`/anime/gogoanime/info/${animeId}`)
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch anime info: ${error.message}`)
    }
  }

  async getStreamingLinks(episodeId, server = 'gogocdn') {
    try {
      const response = await this.client.get(`/anime/gogoanime/watch/${episodeId}`, {
        params: { server }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch streaming links: ${error.message}`)
    }
  }

  async getGenreAnime(genre, page = 1) {
    try {
      const response = await this.client.get(`/anime/gogoanime/genre/${genre}`, {
        params: { page }
      })
      return response.data
    } catch (error) {
      throw new Error(`Failed to fetch genre anime: ${error.message}`)
    }
  }
}

export const consumetAPI = new ConsumetAPI()
