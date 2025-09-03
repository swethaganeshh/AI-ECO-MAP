import React from 'react';
import { Leaf, Thermometer, Wind, Car, Clock, Route } from 'lucide-react';
import { EcoAnalysis, EmissionsData, WeatherData, PollutionData } from '../types/api';

interface EcoScoreCardProps {
  ecoAnalysis: EcoAnalysis;
  emissions: EmissionsData;
  weather: WeatherData;
  pollution: PollutionData;
  routeDetails: {
    distance_km: number;
    duration_min: number;
  };
}

export const EcoScoreCard: React.FC<EcoScoreCardProps> = ({
  ecoAnalysis,
  emissions,
  weather,
  pollution,
  routeDetails
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getAQILabel = (aqi: number) => {
    const labels = ['', 'Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return labels[aqi] || 'Unknown';
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 2) return 'text-green-600';
    if (aqi === 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Main Eco Score */}
      <div className="eco-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Leaf className="w-5 h-5 text-eco-600 mr-2" />
            Eco Score
          </h3>
          <div className={`text-3xl font-bold ${getScoreColor(ecoAnalysis.eco_score)}`}>
            {ecoAnalysis.eco_score}/100
          </div>
        </div>
        
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(ecoAnalysis.eco_score)} ${getScoreColor(ecoAnalysis.eco_score)}`}>
          {ecoAnalysis.rating}
        </div>
        
        {/* Score Breakdown */}
        <div className="mt-4 space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Score Breakdown:</div>
          
          {Object.entries(ecoAnalysis.score_breakdown).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <span className="text-gray-600 capitalize">
                {key.replace('_', ' ')}
              </span>
              <span className={`font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {value > 0 ? '+' : ''}{value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Route Details */}
      <div className="eco-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Route className="w-5 h-5 text-blue-600 mr-2" />
          Route Details
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {routeDetails.distance_km.toFixed(1)}
            </div>
            <div className="text-sm text-blue-700">km</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(routeDetails.duration_min)}
            </div>
            <div className="text-sm text-purple-700">min</div>
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
      <div className="eco-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Thermometer className="w-5 h-5 text-orange-600 mr-2" />
          Environmental Conditions
        </h3>
        
        <div className="space-y-4">
          {/* Weather */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center">
              <Thermometer className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Weather</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{weather.temperature}</div>
              <div className="text-xs text-gray-600">{weather.condition}</div>
            </div>
          </div>
          
          {/* Air Quality */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Wind className="w-4 h-4 text-gray-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Air Quality</span>
            </div>
            <div className="text-right">
              <div className={`text-sm font-semibold ${getAQIColor(pollution.air_quality_index)}`}>
                AQI {pollution.air_quality_index}
              </div>
              <div className={`text-xs ${getAQIColor(pollution.air_quality_index)}`}>
                {getAQILabel(pollution.air_quality_index)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emissions Data */}
      <div className="eco-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Car className="w-5 h-5 text-gray-600 mr-2" />
          Environmental Impact
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">CO₂ Emissions</span>
            <span className="font-semibold text-gray-900">
              {emissions.total_co2_grams.toFixed(0)}g
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Per Kilometer</span>
            <span className="font-semibold text-gray-900">
              {emissions.co2_per_km}g/km
            </span>
          </div>
          
          {emissions.equivalent_trees_needed > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Trees Needed</span>
              <span className="font-semibold text-green-600">
                {emissions.equivalent_trees_needed.toFixed(3)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="eco-card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommendations
        </h3>
        
        <div className="space-y-2">
          {ecoAnalysis.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2 p-3 bg-eco-50 rounded-lg">
              <div className="w-2 h-2 bg-eco-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-sm text-eco-800">{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};