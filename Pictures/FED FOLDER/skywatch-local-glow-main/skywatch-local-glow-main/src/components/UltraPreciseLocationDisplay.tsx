/**
 * 🎯 Ultra-Precise Location Display Component
 * Shows detailed village-level location information
 */

import React from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { MapPin, Navigation, Target, Zap } from 'lucide-react';

interface LocationDetailProps {
  location: string;
  isLoading?: boolean;
  accuracy?: number;
  source?: string;
  confidence?: number;
}

export const UltraPreciseLocationDisplay: React.FC<LocationDetailProps> = ({
  location,
  isLoading = false,
  accuracy,
  source,
  confidence
}) => {
  const getAccuracyLevel = (acc?: number) => {
    if (!acc) return { level: 'Unknown', color: 'secondary', icon: MapPin };
    
    if (acc <= 5) return { 
      level: 'Building Level', 
      color: 'default', 
      icon: Target,
      description: '±5m accuracy' 
    };
    if (acc <= 10) return { 
      level: 'Street Level', 
      color: 'default', 
      icon: Navigation,
      description: '±10m accuracy' 
    };
    if (acc <= 50) return { 
      level: 'Village Level', 
      color: 'secondary', 
      icon: Zap,
      description: '±50m accuracy' 
    };
    
    return { 
      level: 'Area Level', 
      color: 'outline', 
      icon: MapPin,
      description: '±100m+ accuracy' 
    };
  };

  const getConfidenceColor = (conf?: number) => {
    if (!conf) return 'secondary';
    if (conf >= 90) return 'default';
    if (conf >= 75) return 'secondary';
    return 'outline';
  };

  const accuracyInfo = getAccuracyLevel(accuracy);
  const AccuracyIcon = accuracyInfo.icon;

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2">
            <div className="animate-pulse">
              <Target className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium text-blue-700">
              🎯 Detecting ultra-precise location...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-3">
        <div className="space-y-2">
          {/* Location Display */}
          <div className="flex items-start space-x-2">
            <AccuracyIcon className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                {location}
              </p>
            </div>
          </div>

          {/* Accuracy & Confidence Badges */}
          <div className="flex flex-wrap gap-1">
            {accuracy && (
              <Badge variant={(accuracyInfo.color as 'default' | 'secondary' | 'outline')} className="text-xs">
                🎯 {accuracyInfo.level}
                {accuracyInfo.description && ` • ${accuracyInfo.description}`}
              </Badge>
            )}
            
            {confidence && (
              <Badge variant={(getConfidenceColor(confidence) as 'default' | 'secondary' | 'outline')} className="text-xs">
                📊 {confidence}% confident
              </Badge>
            )}
            
            {source && (
              <Badge variant="outline" className="text-xs">
                📡 {source}
              </Badge>
            )}
          </div>

          {/* Precision Indicator */}
          {accuracy && accuracy <= 10 && (
            <div className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
              ✨ Ultra-precise location detected! This is your exact position.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UltraPreciseLocationDisplay;