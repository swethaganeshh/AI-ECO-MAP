import React from 'react';
import { Car, Bike, PersonStanding } from 'lucide-react';

interface TransportMode {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface TransportModeSelectorProps {
  selectedModes: string[];
  onChange: (modes: string[]) => void;
}

const transportModes: TransportMode[] = [
  {
    id: 'driving-car',
    label: 'Driving',
    icon: <Car className="w-5 h-5" />,
    description: 'Car route'
  },
  {
    id: 'cycling-regular',
    label: 'Cycling',
    icon: <Bike className="w-5 h-5" />,
    description: 'Bike route'
  },
  {
    id: 'foot-walking',
    label: 'Walking',
    icon: <PersonStanding className="w-5 h-5" />,
    description: 'Walking route'
  }
];

export const TransportModeSelector: React.FC<TransportModeSelectorProps> = ({
  selectedModes,
  onChange
}) => {
  const handleModeToggle = (modeId: string) => {
    if (selectedModes.includes(modeId)) {
      // Remove mode if already selected
      onChange(selectedModes.filter(id => id !== modeId));
    } else {
      // Add mode if not selected
      onChange([...selectedModes, modeId]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Transportation Modes
      </label>
      
      <div className="grid grid-cols-3 gap-3">
        {transportModes.map((mode) => {
          const isSelected = selectedModes.includes(mode.id);
          
          return (
            <button
              key={mode.id}
              onClick={() => handleModeToggle(mode.id)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-center
                ${isSelected 
                  ? 'border-eco-500 bg-eco-50 text-eco-700' 
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={isSelected ? 'text-eco-600' : 'text-gray-500'}>
                  {mode.icon}
                </div>
                <div>
                  <div className="font-medium text-sm">{mode.label}</div>
                  <div className="text-xs opacity-75">{mode.description}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedModes.length === 0 && (
        <p className="text-sm text-amber-600 mt-2 flex items-center">
          <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
          Please select at least one transportation mode
        </p>
      )}
    </div>
  );
};