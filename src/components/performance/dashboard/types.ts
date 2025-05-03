
export interface ActiveService {
  id: string;
  trackingId: string;
  custodioName: string;
  destination: string;
  destinationCoordinates: [number, number];
  origin: string;
  originCoordinates: [number, number];
  currentLocation: {
    coordinates: [number, number];
    address: string;
  };
  eta: string; // Estimated time of arrival
  etaOriginal: string; // Original ETA for comparison
  status: 'in_transit' | 'on_time' | 'delayed' | 'completed';
  delayRisk: boolean;
  delayRiskPercent: number;
  inRiskZone: boolean;
  cargo: {
    type: string;
    weight: number;
    count: number;
  };
  routeCoordinates?: [number, number][]; // Array of coordinates representing the route
}
