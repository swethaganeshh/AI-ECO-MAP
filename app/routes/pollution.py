from fastapi import APIRouter, Query, HTTPException
import requests
import os

router = APIRouter()

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")  # make sure it's set in env

@router.get("/")
def get_pollution(lat: float = Query(..., description="Latitude"),
                  lon: float = Query(..., description="Longitude")):
    """
    Get air pollution data for a location.
    """
    try:
        url = f"http://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url)
        data = response.json()

        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=data)

        return {
            "location": {"lat": lat, "lon": lon},
            "air_quality_index": data["list"][0]["main"]["aqi"],
            "components": data["list"][0]["components"],  # CO, NO, O3, etc.
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
