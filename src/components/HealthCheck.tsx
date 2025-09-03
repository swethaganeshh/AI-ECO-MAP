import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiService } from '../services/api';

export const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      setStatus('checking');
      const response = await apiService.checkHealth();
      setStatus('healthy');
      setMessage(response.message);
    } catch (error) {
      setStatus('unhealthy');
      setMessage('Unable to connect to Eco-MCP API');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />;
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{message || 'Checking API status...'}</span>
    </div>
  );
};