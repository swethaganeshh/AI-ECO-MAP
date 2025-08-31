import os
import requests
from fastapi import APIRouter, HTTPException, Query
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/weather"


@router.get("/")
def get_weather(city: str = Query(..., description="City name to fetch weather for")):
    """
    Fetches real-time weather data for a given city using OpenWeather API.
    Handles case-insensitive input and returns clear errors if city is invalid.
    """
    if not city or city.strip() == "":
        raise HTTPException(status_code=400, detail="City parameter is required")

    if not API_KEY:
        raise HTTPException(status_code=500, detail="API key is not configured")

    # Normalize input (case-insensitive, strip spaces)
    city = city.strip().title()

    try:
        params = {
            "q": city,
            "appid": API_KEY,
            "units": "metric",
        }
        response = requests.get(BASE_URL, params=params, timeout=10)

        if response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")
        elif response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.json().get("message", "Error fetching weather data"),
            )

        data = response.json()

        return {
            "city": data.get("name"),
            "temperature": f"{data['main']['temp']} °C" if "main" in data else None,
            "condition": data["weather"][0]["description"].capitalize()
            if "weather" in data and data["weather"]
            else None,
        }

    except requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="Weather service timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
