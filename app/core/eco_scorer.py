"""
Eco-scoring algorithm that combines route, weather, and pollution data
to calculate an environmental and health-friendly score for travel routes.
"""

from typing import Dict, Any
import math

class EcoScorer:
    """
    Calculates eco-friendliness scores based on multiple factors:
    - Transportation mode efficiency
    - Air quality impact
    - Weather conditions
    - Route distance and duration
    """
    
    # Base scores for different transportation modes (0-100)
    MODE_SCORES = {
        "foot-walking": 100,      # Most eco-friendly
        "cycling-regular": 95,    # Very eco-friendly
        "driving-car": 30,        # Least eco-friendly
        "driving-hgv": 15,        # Heavy goods vehicle
        "wheelchair": 100         # Eco-friendly
    }
    
    # Air Quality Index impact on score (lower AQI = better score)
    AQI_IMPACT = {
        1: 20,  # Good air quality - bonus points
        2: 10,  # Fair air quality - small bonus
        3: 0,   # Moderate air quality - neutral
        4: -15, # Poor air quality - penalty
        5: -30  # Very poor air quality - heavy penalty
    }
    
    @staticmethod
    def calculate_eco_score(
        route_data: Dict[str, Any],
        weather_data: Dict[str, Any],
        pollution_data: Dict[str, Any],
        mode: str
    ) -> Dict[str, Any]:
        """
        Calculate comprehensive eco-score based on all available data.
        
        Returns:
            Dict containing eco_score (0-100), breakdown of factors, and recommendations
        """
        
        # Start with base mode score
        base_score = EcoScorer.MODE_SCORES.get(mode, 50)
        
        # Factor 1: Transportation mode efficiency
        mode_score = base_score
        
        # Factor 2: Air quality impact
        aqi = pollution_data.get("air_quality_index", 3)
        air_quality_impact = EcoScorer.AQI_IMPACT.get(aqi, 0)
        
        # Factor 3: Distance efficiency (shorter routes get bonus)
        distance_km = route_data.get("distance_km", 0)
        distance_penalty = min(distance_km * 0.5, 20)  # Max 20 point penalty
        
        # Factor 4: Weather conditions impact
        weather_impact = EcoScorer._calculate_weather_impact(weather_data, mode)
        
        # Calculate final score (ensure it stays within 0-100 range)
        final_score = max(0, min(100, 
            mode_score + air_quality_impact - distance_penalty + weather_impact
        ))
        
        # Generate recommendations
        recommendations = EcoScorer._generate_recommendations(
            mode, aqi, weather_data, distance_km, final_score
        )
        
        return {
            "eco_score": round(final_score, 1),
            "score_breakdown": {
                "transportation_mode": mode_score,
                "air_quality_impact": air_quality_impact,
                "distance_efficiency": -distance_penalty,
                "weather_conditions": weather_impact
            },
            "rating": EcoScorer._get_rating(final_score),
            "recommendations": recommendations,
            "factors": {
                "mode": mode,
                "distance_km": distance_km,
                "air_quality_index": aqi,
                "weather_condition": weather_data.get("condition", "Unknown")
            }
        }
    
    @staticmethod
    def _calculate_weather_impact(weather_data: Dict[str, Any], mode: str) -> float:
        """Calculate weather impact on eco-score based on mode and conditions."""
        condition = weather_data.get("condition", "").lower()
        
        # Weather impacts vary by transportation mode
        if mode in ["foot-walking", "cycling-regular"]:
            # Outdoor activities are more affected by weather
            if any(word in condition for word in ["clear", "sunny"]):
                return 10  # Perfect weather bonus
            elif any(word in condition for word in ["rain", "storm", "snow"]):
                return -15  # Bad weather penalty
            elif "cloud" in condition:
                return 5   # Mild weather bonus
        else:
            # Driving is less affected by weather
            if any(word in condition for word in ["rain", "storm", "snow"]):
                return -5  # Slight penalty for dangerous driving conditions
        
        return 0  # Neutral weather impact
    
    @staticmethod
    def _get_rating(score: float) -> str:
        """Convert numeric score to descriptive rating."""
        if score >= 80:
            return "Excellent"
        elif score >= 60:
            return "Good"
        elif score >= 40:
            return "Fair"
        elif score >= 20:
            return "Poor"
        else:
            return "Very Poor"
    
    @staticmethod
    def _generate_recommendations(
        mode: str, 
        aqi: int, 
        weather_data: Dict[str, Any], 
        distance_km: float,
        score: float
    ) -> list:
        """Generate personalized recommendations based on route analysis."""
        recommendations = []
        
        # Mode-specific recommendations
        if mode == "driving-car" and distance_km < 5:
            recommendations.append("Consider cycling or walking for this short distance to reduce emissions")
        elif mode == "driving-car" and score < 40:
            recommendations.append("This route has poor eco-friendliness. Consider public transport if available")
        
        # Air quality recommendations
        if aqi >= 4:
            if mode in ["foot-walking", "cycling-regular"]:
                recommendations.append("Poor air quality detected. Consider indoor exercise or postponing outdoor activities")
            recommendations.append("Avoid unnecessary travel due to poor air quality")
        elif aqi == 1:
            recommendations.append("Excellent air quality! Perfect time for outdoor activities")
        
        # Weather recommendations
        condition = weather_data.get("condition", "").lower()
        if mode in ["foot-walking", "cycling-regular"]:
            if any(word in condition for word in ["rain", "storm"]):
                recommendations.append("Weather conditions may not be ideal for outdoor travel. Consider alternative transport")
            elif "clear" in condition or "sunny" in condition:
                recommendations.append("Perfect weather for outdoor activities!")
        
        # Distance recommendations
        if distance_km > 20 and mode in ["foot-walking", "cycling-regular"]:
            recommendations.append("This is a long distance for walking/cycling. Consider breaking the journey or using mixed transport")
        
        # General eco-tips
        if score >= 80:
            recommendations.append("Great choice! This route is highly eco-friendly")
        elif score < 30:
            recommendations.append("Consider alternative routes or transportation modes for better environmental impact")
        
        return recommendations if recommendations else ["Route analysis complete. Safe travels!"]