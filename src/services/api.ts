import axios from 'axios';
import { EcoRouteResponse, HealthResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const apiService = {
  // Health check
  async checkHealth(): Promise<HealthResponse> {
    const response = await api.get('/healthz');
    return response.data;
  },

  // Eco route planning
  async planEcoRoute(
    start: string,
    end: string,
    modes: string[] = ['driving-car', 'cycling-regular', 'foot-walking']
  ): Promise<EcoRouteResponse> {
    const modesParam = modes.join(',');
    const response = await api.get('/eco/plan', {
      params: {
        start,
        end,
        modes: modesParam,
      },
    });
    return response.data;
  },

  // Quick route comparison
  async compareRoutes(start: string, end: string) {
    const response = await api.get('/eco/compare', {
      params: { start, end },
    });
    return response.data;
  },

  // Individual endpoints
  async getWeather(city: string) {
    const response = await api.get('/weather', {
      params: { city },
    });
    return response.data;
  },

  async getPollution(lat: number, lon: number) {
    const response = await api.get('/pollution', {
      params: { lat, lon },
    });
    return response.data;
  },

  async getRoute(start: string, end: string, mode: string) {
    const response = await api.get('/route', {
      params: { start, end, mode },
    });
    return response.data;
  },
};

// Geocoding service (using OpenStreetMap Nominatim - free alternative)
export const geocodingService = {
  async searchLocation(query: string): Promise<Array<{
    display_name: string;
    lat: string;
    lon: string;
  }>> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          limit: 5,
          addressdetails: 1,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  },
};