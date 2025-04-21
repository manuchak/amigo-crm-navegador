
import React from 'react';
import { Button } from '@/components/ui/button';
import { ValidationFormData } from '../types';

interface RatingFieldProps {
  label: string;
  name: keyof ValidationFormData;
  value: number | null;
  onChange: (name: keyof ValidationFormData, value: any) => void;
  disabled?: boolean;
}

export const RatingField: React.FC<RatingFieldProps> = ({
  label,
  name,
  value,
  onChange,
  disabled = false
}) => {
  const handleRatingClick = (rating: number) => {
    // If clicking the same rating that's already selected, clear it
    if (value === rating) {
      onChange(name, null);
    } else {
      onChange(name, rating);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex space-x-3">
        {[1, 2, 3, 4, 5].map(rating => (
          <Button 
            key={rating}
            type="button"
            size="sm"
            variant={value === rating ? "default" : "outline"}
            onClick={() => handleRatingClick(rating)}
            className="w-9 h-9 p-0 rounded-full"
            aria-label={`Rating ${rating}`}
            disabled={disabled}
          >
            {rating}
          </Button>
        ))}
      </div>
    </div>
  );
};
