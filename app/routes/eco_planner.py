"""
Main eco-route planning endpoint that combines all data sources
to provide comprehensive route recommendations with eco-scoring.
"""

import os
import requests
from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from app.core.eco_scorer import EcoScorer

router = APIRouter()

# API Keys
ORS_API_KEY = os.getenv("ORS_API_KEY")
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")

@router.get("/plan")
def plan_eco_route(
    start: str = Query(..., description="Starting point in 'lon,lat' format"),
    end: str = Query(..., description="Destination point in 'lon,lat' format"),
    modes: str = Query("driving-car,cycling-regular,foot-walking", description="Comma-separated transport modes to compare")
):
    """
    Plan eco-friendly routes by comparing multiple transportation modes.
    Returns routes ranked by eco-score with detailed analysis.
    
    Example: /plan?start=80.2707,13.0827&end=80.2430,13.0674&modes=driving-car,cycling-regular
    """
    
    if not all([ORS_API_KEY, OPENWEATHER_API_KEY]):
        raise HTTPException(status_code=500, detail="API keys not configured")
    
    # Parse coordinates
    try:
        start_coords = [float(x) for x in start.split(',')]
        end_coords = [float(x) for x in end.split(',')]
        mode_list = [mode.strip() for mode in modes.split(',')]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid coordinate format. Use 'lon,lat'")
    
    # Get weather data for destination
    weather_data = _fetch_weather_data(end_coords[1], end_coords[0])  # lat, lon
    
    # Get pollution data for destination
    pollution_data = _fetch_pollution_data(end_coords[1], end_coords[0])  # lat, lon
    
    # Calculate routes for each mode
    route_options = []
    
    for mode in mode_list:
        try:
            route_data = _fetch_route_data(start, end, mode)
            
            # Calculate eco-score
            eco_analysis = EcoScorer.calculate_eco_score(
                route_data, weather_data, pollution_data, mode
            )
            
            route_option = {
                "mode": mode,
                "route_details": route_data,
                "eco_analysis": eco_analysis,
                "estimated_emissions": _calculate_emissions(route_data, mode)
            }
            
            route_options.append(route_option)
            
        except Exception as e:
            # Continue with other modes if one fails
            print(f"Failed to get route for mode {mode}: {str(e)}")
            continue
    
    if not route_options:
        raise HTTPException(status_code=500, detail="No valid routes found")
    
    # Sort by eco-score (highest first)
    route_options.sort(key=lambda x: x["eco_analysis"]["eco_score"], reverse=True)
    
    return {
        "start_location": {"lon": start_coords[0], "lat": start_coords[1]},
        "end_location": {"lon": end_coords[0], "lat": end_coords[1]},
        "environmental_conditions": {
            "weather": weather_data,
            "air_quality": pollution_data
        },
        "route_options": route_options,
        "recommended_route": route_options[0] if route_options else None,
        "summary": {
            "best_eco_score": route_options[0]["eco_analysis"]["eco_score"] if route_options else 0,
            "total_options_analyzed": len(route_options),
            "environmental_status": _get_environmental_status(weather_data, pollution_data)
        }
    }

def _fetch_weather_data(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch weather data from OpenWeather API."""
    try:
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}&units=metric"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        return {
            "temperature": f"{data['main']['temp']} °C",
            "condition": data["weather"][0]["description"].capitalize(),
            "humidity": data["main"]["humidity"],
            "wind_speed": data.get("wind", {}).get("speed", 0)
        }
    except Exception as e:
        return {"condition": "Unknown", "temperature": "N/A"}

def _fetch_pollution_data(lat: float, lon: float) -> Dict[str, Any]:
    """Fetch air pollution data from OpenWeather API."""
    try:
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        return {
            "air_quality_index": data["list"][0]["main"]["aqi"],
            "components": data["list"][0]["components"]
        }
    except Exception as e:
        return {"air_quality_index": 3, "components": {}}

def _fetch_route_data(start: str, end: str, mode: str) -> Dict[str, Any]:
    """Fetch route data from OpenRouteService API."""
    url = f"https://api.openrouteservice.org/v2/directions/{mode}"
    headers = {"Authorization": ORS_API_KEY}
    params = {"start": start, "end": end}
    
    response = requests.get(url, headers=headers, params=params, timeout=15)
    response.raise_for_status()
    data = response.json()
    
    return {
        "distance_km": data["features"][0]["properties"]["segments"][0]["distance"] / 1000,
        "duration_min": data["features"][0]["properties"]["segments"][0]["duration"] / 60,
        "geometry": data["features"][0]["geometry"]
    }

def _calculate_emissions(route_data: Dict[str, Any], mode: str) -> Dict[str, Any]:
    """Calculate estimated CO2 emissions based on transportation mode and distance."""
    distance_km = route_data.get("distance_km", 0)
    
    # CO2 emissions per km (in grams)
    emission_factors = {
        "driving-car": 120,        # Average car emissions
        "driving-hgv": 300,        # Heavy goods vehicle
        "cycling-regular": 0,      # Zero direct emissions
        "foot-walking": 0,         # Zero direct emissions
        "wheelchair": 0            # Zero direct emissions
    }
    
    emissions_per_km = emission_factors.get(mode, 0)
    total_emissions = distance_km * emissions_per_km
    
    return {
        "total_co2_grams": round(total_emissions, 2),
        "co2_per_km": emissions_per_km,
        "equivalent_trees_needed": round(total_emissions / 22000, 3) if total_emissions > 0 else 0  # 1 tree absorbs ~22kg CO2/year
    }

def _get_environmental_status(weather_data: Dict[str, Any], pollution_data: Dict[str, Any]) -> str:
    """Get overall environmental status for travel conditions."""
    aqi = pollution_data.get("air_quality_index", 3)
    condition = weather_data.get("condition", "").lower()
    
    if aqi <= 2 and not any(word in condition for word in ["rain", "storm", "snow"]):
        return "Excellent conditions for eco-friendly travel"
    elif aqi <= 3 and "clear" in condition:
        return "Good conditions for outdoor activities"
    elif aqi >= 4:
        return "Poor air quality - consider minimizing outdoor exposure"
    elif any(word in condition for word in ["rain", "storm"]):
        return "Weather may impact outdoor travel comfort"
    else:
        return "Moderate conditions for travel"

@router.get("/compare")
def compare_routes(
    start: str = Query(..., description="Starting point in 'lon,lat' format"),
    end: str = Query(..., description="Destination point in 'lon,lat' format")
):
    """
    Quick comparison of all available transportation modes with eco-scores.
    Simplified version of /plan endpoint for quick decision making.
    """
    
    # Use all available modes for comparison
    all_modes = "driving-car,cycling-regular,foot-walking"
    
    try:
        result = plan_eco_route(start, end, all_modes)
        
        # Simplified response focusing on comparison
        comparison = []
        for option in result["route_options"]:
            comparison.append({
                "mode": option["mode"],
                "eco_score": option["eco_analysis"]["eco_score"],
                "rating": option["eco_analysis"]["rating"],
                "distance_km": option["route_details"]["distance_km"],
                "duration_min": option["route_details"]["duration_min"],
                "co2_emissions": option["estimated_emissions"]["total_co2_grams"],
                "top_recommendation": option["eco_analysis"]["recommendations"][0] if option["eco_analysis"]["recommendations"] else None
            })
        
        return {
            "route_comparison": comparison,
            "best_option": comparison[0] if comparison else None,
            "environmental_summary": result["summary"]["environmental_status"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route comparison failed: {str(e)}")