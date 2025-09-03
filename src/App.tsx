import React, { useState } from 'react';
import { Leaf, Navigation, Zap } from 'lucide-react';
import { LocationInput } from './components/LocationInput';
import { TransportModeSelector } from './components/TransportModeSelector';
import { EcoMap } from './components/EcoMap';
import { EcoScoreCard } from './components/EcoScoreCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { HealthCheck } from './components/HealthCheck';
import { apiService } from './services/api';
import { Location, EcoRouteResponse, RouteOption } from './types/api';

function App() {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [selectedModes, setSelectedModes] = useState<string[]>(['cycling-regular']);
  const [routeData, setRouteData] = useState<EcoRouteResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanRoute = async () => {
    if (!startLocation || !endLocation || selectedModes.length === 0) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const startCoords = `${startLocation.lng},${startLocation.lat}`;
      const endCoords = `${endLocation.lng},${endLocation.lat}`;
      
      const response = await apiService.planEcoRoute(startCoords, endCoords, selectedModes);
      setRouteData(response);
      setSelectedRoute(response.recommended_route);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to plan route. Please try again.');
      setRouteData(null);
      setSelectedRoute(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRouteSelect = (route: RouteOption) => {
    setSelectedRoute(route);
  };

  const handleRetry = () => {
    setError(null);
    handlePlanRoute();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-eco-600 rounded-lg">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Eco-Route Planner</h1>
                <p className="text-sm text-gray-600">Find sustainable travel routes</p>
              </div>
            </div>
            <HealthCheck />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-12rem)]">
          
          {/* Left Panel - Route Planning Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="eco-card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Navigation className="w-5 h-5 text-eco-600 mr-2" />
                Plan Your Route
              </h2>
              
              <div className="space-y-6">
                <LocationInput
                  label="Start Location"
                  value={startLocation}
                  onChange={setStartLocation}
                  placeholder="Enter starting point or coordinates"
                />
                
                <LocationInput
                  label="Destination"
                  value={endLocation}
                  onChange={setEndLocation}
                  placeholder="Enter destination or coordinates"
                />
                
                <TransportModeSelector
                  selectedModes={selectedModes}
                  onChange={setSelectedModes}
                />
                
                <button
                  onClick={handlePlanRoute}
                  disabled={!startLocation || !endLocation || selectedModes.length === 0 || isLoading}
                  className="eco-button w-full flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Planning Route...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Find Eco Routes</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Results Panel */}
            {isLoading && (
              <LoadingSpinner message="Analyzing eco-friendly routes..." />
            )}
            
            {error && (
              <ErrorMessage message={error} onRetry={handleRetry} />
            )}
            
            {selectedRoute && routeData && (
              <EcoScoreCard
                ecoAnalysis={selectedRoute.eco_analysis}
                emissions={selectedRoute.estimated_emissions}
                weather={routeData.environmental_conditions.weather}
                pollution={routeData.environmental_conditions.air_quality}
                routeDetails={selectedRoute.route_details}
              />
            )}
          </div>

          {/* Right Panel - Map */}
          <div className="lg:col-span-2">
            <div className="eco-card h-full p-0 overflow-hidden">
              {startLocation || endLocation || routeData ? (
                <EcoMap
                  startLocation={startLocation}
                  endLocation={endLocation}
                  routes={routeData?.route_options || []}
                  selectedRoute={selectedRoute}
                  onRouteSelect={handleRouteSelect}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Navigation className="w-8 h-8 text-eco-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Ready to Plan Your Eco Route
                    </h3>
                    <p className="text-gray-600 max-w-sm">
                      Enter your start and destination locations to see eco-friendly route options with real-time environmental data.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Route Options Summary */}
        {routeData && routeData.route_options.length > 0 && (
          <div className="mt-8">
            <div className="eco-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Route Comparison
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {routeData.route_options.map((route, index) => (
                  <button
                    key={route.mode}
                    onClick={() => setSelectedRoute(route)}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 text-left
                      ${selectedRoute?.mode === route.mode
                        ? 'border-eco-500 bg-eco-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 capitalize">
                        {route.mode.replace('-', ' ')}
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-eco-100 text-eco-700 px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Distance: {route.route_details.distance_km.toFixed(1)} km</div>
                      <div>Duration: {Math.round(route.route_details.duration_min)} min</div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-eco-500 rounded-full mr-1"></span>
                        Eco Score: {route.eco_analysis.eco_score}/100
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Environmental Status:</strong> {routeData.summary.environmental_status}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;