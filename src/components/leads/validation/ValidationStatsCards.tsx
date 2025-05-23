
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ValidationStats } from './types';
import { Loader2, CheckCircle, Clock, ThumbsUp, MessageSquare, Star } from 'lucide-react';

interface ValidationStatsCardsProps {
  stats: ValidationStats[];
  loading: boolean;
}

export const ValidationStatsCards: React.FC<ValidationStatsCardsProps> = ({ stats, loading }) => {
  // Calculate aggregated stats
  const approvedCount = stats.filter(s => s.status === 'approved').reduce((sum, s) => sum + (s.validation_count || 0), 0);
  const rejectedCount = stats.filter(s => s.status === 'rejected').reduce((sum, s) => sum + (s.validation_count || 0), 0);
  const pendingCount = stats.filter(s => s.status === 'pending').reduce((sum, s) => sum + (s.validation_count || 0), 0);
  const totalCount = approvedCount + rejectedCount + pendingCount;
  
  // Calculate averages across all stats
  const avgDuration = stats.reduce((sum, s) => sum + (s.avg_duration || 0), 0) / (stats.length || 1);
  const avgCallQuality = stats.reduce((sum, s) => sum + (s.avg_call_quality || 0), 0) / (stats.length || 1);
  const avgCommunication = stats.reduce((sum, s) => sum + (s.avg_communication || 0), 0) / (stats.length || 1);
  
  // Format time from seconds to minutes
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Helper function to get star rating elements
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.3 && rating - fullStars < 0.8;
    const totalStars = 5;
    
    return (
      <div className="flex items-center gap-0.5 ml-2">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && (
          <Star className="h-4 w-4 fill-amber-400 text-amber-400 opacity-60" />
        )}
        {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Custodios Validados Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Custodios Validados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <div className="text-2xl font-bold">{totalCount}</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="text-green-500 font-medium">{approvedCount} aprobados</span> · 
            <span className="text-red-500 font-medium ml-1">{rejectedCount} rechazados</span> · 
            <span className="text-amber-500 font-medium ml-1">{pendingCount} pendientes</span>
          </div>
        </CardContent>
      </Card>

      {/* Time to Complete Validation Form Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Tiempo Promedio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-blue-500 mr-2" />
            <div className="text-2xl font-bold">{formatTime(avgDuration)}</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Tiempo promedio de validación por custodio
          </div>
        </CardContent>
      </Card>

      {/* Call Quality Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Calidad de Llamada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <ThumbsUp className="h-5 w-5 text-indigo-500 mr-2" />
            <div className="text-2xl font-bold">{avgCallQuality.toFixed(1)}</div>
            {renderStarRating(avgCallQuality)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Puntuación promedio de calidad en entrevistas
          </div>
        </CardContent>
      </Card>

      {/* Communication Card */}
      <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Comunicación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 text-purple-500 mr-2" />
            <div className="text-2xl font-bold">{avgCommunication.toFixed(1)}</div>
            {renderStarRating(avgCommunication)}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Habilidades de comunicación de custodios
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
