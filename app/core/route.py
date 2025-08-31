import os
import requests
from fastapi import APIRouter, Query, HTTPException
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

# Get API key from .env file
ORS_API_KEY = os.getenv("ORS_API_KEY")

@router.get("/")
def get_route(
    start: str = Query(..., description="Starting point in 'lon,lat' format"),
    end: str = Query(..., description="Destination point in 'lon,lat' format"),
    mode: str = Query("driving-car", description="Mode: driving-car, foot-walking, cycling-regular")
):
    """
    Fetch route details between two points using OpenRouteService.
    Example: /route?start=80.2707,13.0827&end=80.2430,13.0674&mode=cycling-regular
    """
    if not ORS_API_KEY:
        raise HTTPException(status_code=500, detail="ORS API key not configured")

    url = f"https://api.openrouteservice.org/v2/directions/{mode}"
    headers = {"Authorization": ORS_API_KEY}
    params = {"start": start, "end": end}

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        data = response.json()
        return {
            "distance_km": data["features"][0]["properties"]["segments"][0]["distance"] / 1000,
            "duration_min": data["features"][0]["properties"]["segments"][0]["duration"] / 60,
            "geometry": data["features"][0]["geometry"]
        }
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"ORS API request failed: {str(e)}")
