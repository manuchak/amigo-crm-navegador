
export interface ActiveService {
  id: string;
  custodioName: string;
  vehicleType?: string;
  status: 'in-transit' | 'delayed' | 'completed';
  origin: string;
  destination: string;
  originCoordinates?: [number, number];
  destinationCoordinates?: [number, number];
  routeCoordinates?: [number, number][];
  eta: string;
  etaOriginal: string;
  adjustedEta?: string;
  estimatedDelayMinutes?: number;
  currentLocation: {
    coordinates: [number, number];
    address: string;
    timestamp: string;
  };
  trackingId: string;
  inRiskZone: boolean;
  delayRisk: boolean;
  delayRiskPercent: number;
  cargoType?: string;
  cargoValue?: number;
  cargoWeight?: number;
  cargoUnits?: number;
  progress?: number;
  isOnTime?: boolean; // New field to explicitly track if service is on time
  weatherEvent?: {
    type: string;
    severity: number; // 0-3
    location: string;
    estimatedDelay: string;
    causesDelay: boolean; // New field to track if this actually causes a delay
  };
  roadBlockage?: {
    active: boolean;
    location: string;
    reason: string;
    estimatedDelay: string;
    causesDelay: boolean; // New field to track if this actually causes a delay
  };
}
