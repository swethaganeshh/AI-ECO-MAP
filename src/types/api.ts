export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface RouteGeometry {
  type: string;
  coordinates: number[][];
}

export interface RouteDetails {
  distance_km: number;
  duration_min: number;
  geometry: RouteGeometry;
}

export interface EcoAnalysis {
  eco_score: number;
  score_breakdown: {
    transportation_mode: number;
    air_quality_impact: number;
    distance_efficiency: number;
    weather_conditions: number;
  };
  rating: string;
  recommendations: string[];
  factors: {
    mode: string;
    distance_km: number;
    air_quality_index: number;
    weather_condition: string;
  };
}

export interface EmissionsData {
  total_co2_grams: number;
  co2_per_km: number;
  equivalent_trees_needed: number;
}

export interface RouteOption {
  mode: string;
  route_details: RouteDetails;
  eco_analysis: EcoAnalysis;
  estimated_emissions: EmissionsData;
}

export interface WeatherData {
  temperature: string;
  condition: string;
  humidity: number;
  wind_speed: number;
}

export interface PollutionData {
  air_quality_index: number;
  components: Record<string, number>;
}

export interface EcoRouteResponse {
  start_location: { lon: number; lat: number };
  end_location: { lon: number; lat: number };
  environmental_conditions: {
    weather: WeatherData;
    air_quality: PollutionData;
  };
  route_options: RouteOption[];
  recommended_route: RouteOption | null;
  summary: {
    best_eco_score: number;
    total_options_analyzed: number;
    environmental_status: string;
  };
}

export interface HealthResponse {
  status: string;
  message: string;
}