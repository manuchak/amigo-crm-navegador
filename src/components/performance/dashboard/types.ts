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
  weatherEvent?: {
    type: string;
    severity: number; // 0-3
    location: string;
    estimatedDelay: string;
  };
  roadBlockage?: {
    active: boolean;
    location: string;
    reason: string;
    estimatedDelay: string;
  };
}
