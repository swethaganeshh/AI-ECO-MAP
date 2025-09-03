import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Location, RouteOption } from '../types/api';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface RouteLayerProps {
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
}

const RouteLayer: React.FC<RouteLayerProps> = ({ routes, selectedRoute }) => {
  const map = useMap();
  const routeLayersRef = useRef<L.LayerGroup[]>([]);

  useEffect(() => {
    // Clear existing route layers
    routeLayersRef.current.forEach(layer => {
      map.removeLayer(layer);
    });
    routeLayersRef.current = [];

    // Add new route layers
    routes.forEach((route, index) => {
      const isSelected = selectedRoute?.mode === route.mode;
      const isRecommended = index === 0; // First route is recommended
      
      const coordinates = route.route_details.geometry.coordinates.map(coord => [coord[1], coord[0]] as [number, number]);
      
      // Determine route color and style
      let color = '#6b7280'; // Default gray
      let weight = 4;
      let opacity = 0.6;
      
      if (isSelected) {
        color = '#22c55e'; // Eco green for selected
        weight = 6;
        opacity = 0.9;
      } else if (isRecommended) {
        color = '#10b981'; // Emerald for recommended
        weight = 5;
        opacity = 0.8;
      }
      
      const polyline = L.polyline(coordinates, {
        color,
        weight,
        opacity,
        smoothFactor: 1
      });
      
      // Add popup with route info
      polyline.bindPopup(`
        <div class="text-sm">
          <div class="font-semibold text-gray-900 mb-1">${route.mode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
          <div class="space-y-1 text-gray-600">
            <div>Distance: ${route.route_details.distance_km.toFixed(1)} km</div>
            <div>Duration: ${Math.round(route.route_details.duration_min)} min</div>
            <div class="flex items-center">
              <span class="w-2 h-2 bg-eco-500 rounded-full mr-1"></span>
              Eco Score: ${route.eco_analysis.eco_score}/100
            </div>
          </div>
        </div>
      `);
      
      const layerGroup = L.layerGroup([polyline]);
      layerGroup.addTo(map);
      routeLayersRef.current.push(layerGroup);
    });

    return () => {
      routeLayersRef.current.forEach(layer => {
        map.removeLayer(layer);
      });
    };
  }, [map, routes, selectedRoute]);

  return null;
};

interface EcoMapProps {
  startLocation: Location | null;
  endLocation: Location | null;
  routes: RouteOption[];
  selectedRoute: RouteOption | null;
  onRouteSelect: (route: RouteOption) => void;
}

export const EcoMap: React.FC<EcoMapProps> = ({
  startLocation,
  endLocation,
  routes,
  selectedRoute,
  onRouteSelect
}) => {
  // Calculate map center and zoom
  const getMapBounds = () => {
    if (startLocation && endLocation) {
      const bounds = L.latLngBounds([
        [startLocation.lat, startLocation.lng],
        [endLocation.lat, endLocation.lng]
      ]);
      return bounds;
    }
    
    // Default to a general view
    return L.latLngBounds([
      [13.0827, 80.2707], // Chennai area as default
      [13.0674, 80.2430]
    ]);
  };

  const bounds = getMapBounds();
  const center = bounds.getCenter();

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        className="h-full w-full"
        bounds={bounds}
        boundsOptions={{ padding: [20, 20] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Start Location Marker */}
        {startLocation && (
          <Marker 
            position={[startLocation.lat, startLocation.lng]} 
            icon={startIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-green-700 mb-1">Start Location</div>
                <div className="text-gray-600">
                  {startLocation.address || `${startLocation.lat}, ${startLocation.lng}`}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* End Location Marker */}
        {endLocation && (
          <Marker 
            position={[endLocation.lat, endLocation.lng]} 
            icon={endIcon}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold text-red-700 mb-1">Destination</div>
                <div className="text-gray-600">
                  {endLocation.address || `${endLocation.lat}, ${endLocation.lng}`}
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Route Lines */}
        <RouteLayer routes={routes} selectedRoute={selectedRoute} />
      </MapContainer>
      
      {/* Route Selection Overlay */}
      {routes.length > 0 && (
        <div className="absolute top-4 left-4 z-[1000] space-y-2">
          {routes.map((route, index) => (
            <button
              key={route.mode}
              onClick={() => onRouteSelect(route)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${selectedRoute?.mode === route.mode
                  ? 'bg-eco-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50'
                }
              `}
            >
              <div className={`w-3 h-3 rounded-full ${
                index === 0 ? 'bg-emerald-400' : 
                selectedRoute?.mode === route.mode ? 'bg-white' : 'bg-gray-400'
              }`} />
              <span>{route.mode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
              <span className="text-xs opacity-75">
                {route.eco_analysis.eco_score}/100
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};