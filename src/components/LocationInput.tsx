import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import { geocodingService } from '../services/api';
import { Location } from '../types/api';

interface LocationInputProps {
  label: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  placeholder?: string;
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "Enter address or coordinates"
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Update query when value changes externally
  useEffect(() => {
    if (value?.address) {
      setQuery(value.address);
    } else if (value) {
      setQuery(`${value.lat}, ${value.lng}`);
    } else {
      setQuery('');
    }
  }, [value]);

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          // Check if input is coordinates (lat,lng format)
          const coordMatch = query.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
          if (coordMatch) {
            const lat = parseFloat(coordMatch[1]);
            const lng = parseFloat(coordMatch[2]);
            if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              onChange({ lat, lng, address: `${lat}, ${lng}` });
              setResults([]);
              setShowResults(false);
              return;
            }
          }

          // Search for address
          const searchResults = await geocodingService.searchLocation(query);
          setResults(searchResults);
          setShowResults(searchResults.length > 0);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, onChange]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    const location: Location = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: result.display_name
    };
    onChange(location);
    setQuery(result.display_name);
    setShowResults(false);
  };

  const handleClear = () => {
    setQuery('');
    onChange(null);
    setResults([]);
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="inline w-4 h-4 mr-1" />
        {label}
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-eco-600"></div>
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="eco-input pl-10 pr-10"
        />
        
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelectResult(result)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors duration-150"
            >
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <span className="text-sm text-gray-900 line-clamp-2">
                  {result.display_name}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};