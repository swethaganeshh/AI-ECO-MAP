# Eco-Route Planner API

A comprehensive FastAPI application that helps users find the most eco-friendly travel routes by combining real-time data from multiple sources.

## Features

🌱 **Eco-Scoring Algorithm**: Intelligent scoring system that evaluates routes based on:
- Transportation mode efficiency
- Real-time air quality conditions
- Weather impact on travel
- Distance optimization
- CO2 emissions calculation

🗺️ **Multi-Modal Route Planning**: Compare different transportation options:
- Walking
- Cycling
- Driving
- Custom route preferences

🌤️ **Real-Time Environmental Data**:
- Weather conditions via OpenWeather API
- Air quality index and pollution levels
- Dynamic recommendations based on current conditions

## API Endpoints

### Core Eco-Planning

- `GET /eco/plan` - Comprehensive route planning with eco-scoring
- `GET /eco/compare` - Quick comparison of all transportation modes

### Individual Data Sources

- `GET /weather` - Real-time weather data
- `GET /pollution` - Air quality and pollution information  
- `GET /route` - Basic route calculation

### Health Check

- `GET /healthz` - API health status

## Example Usage

### Plan an Eco-Friendly Route

```bash
GET /eco/plan?start=80.2707,13.0827&end=80.2430,13.0674&modes=driving-car,cycling-regular,foot-walking
```

**Response includes:**
- Ranked route options by eco-score
- Detailed environmental analysis
- CO2 emissions calculations
- Personalized recommendations
- Weather and air quality conditions

### Quick Route Comparison

```bash
GET /eco/compare?start=80.2707,13.0827&end=80.2430,13.0674
```

**Returns simplified comparison** of all transportation modes with key metrics.

## Eco-Scoring Methodology

The eco-score (0-100) considers:

1. **Transportation Mode** (40% weight)
   - Walking/Cycling: 95-100 points
   - Driving: 30 points
   - Heavy vehicles: 15 points

2. **Air Quality Impact** (25% weight)
   - Good AQI (1-2): Bonus points
   - Poor AQI (4-5): Penalty points

3. **Distance Efficiency** (20% weight)
   - Shorter routes receive bonus points
   - Long routes get distance penalty

4. **Weather Conditions** (15% weight)
   - Favorable weather: Bonus for outdoor modes
   - Poor weather: Penalty for walking/cycling

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment variables in `.env`:
```
ORS_API_KEY=your_openrouteservice_key
OPENWEATHER_API_KEY=your_openweather_key
```

3. Run the application:
```bash
uvicorn app.main:app --reload
```

## API Documentation

Visit `/docs` when the server is running to access the interactive Swagger documentation.

## Environmental Impact

This application promotes sustainable transportation by:
- Encouraging walking and cycling over driving
- Providing real-time air quality awareness
- Calculating and displaying CO2 emissions
- Offering weather-appropriate travel recommendations
- Helping users make informed, eco-conscious travel decisions