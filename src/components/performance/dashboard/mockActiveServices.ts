
import { ActiveService } from './types';

// Mock data for active services
export const mockActiveServices: ActiveService[] = [
  {
    id: 'TR012',
    trackingId: '456282',
    custodioName: 'Joshua H.',
    destination: 'Albert H. Street 156, Ciudad de México',
    destinationCoordinates: [-99.1592, 19.4352],
    origin: 'Insurgentes Sur 1602, Ciudad de México',
    originCoordinates: [-99.1800, 19.3736],
    currentLocation: {
      coordinates: [-99.1696, 19.4041],
      address: 'Av. Chapultepec 480, Ciudad de México'
    },
    eta: '5:47 PM',
    etaOriginal: '5:40 PM',
    status: 'in_transit',
    delayRisk: true,
    delayRiskPercent: 35,
    inRiskZone: false,
    cargo: {
      type: 'containers',
      weight: 12.7,
      count: 4
    },
    routeCoordinates: [
      [-99.1800, 19.3736],
      [-99.1790, 19.3836],
      [-99.1750, 19.3930],
      [-99.1696, 19.4041],
      [-99.1652, 19.4201],
      [-99.1592, 19.4352]
    ]
  },
  {
    id: 'TR013',
    trackingId: '456283',
    custodioName: 'Miguel A.',
    destination: 'Paseo de la Reforma 222, Ciudad de México',
    destinationCoordinates: [-99.1673, 19.4279],
    origin: 'Río Churubusco s/n, Ciudad de México',
    originCoordinates: [-99.1201, 19.3650],
    currentLocation: {
      coordinates: [-99.1329, 19.3827],
      address: 'Eje 3 Sur Baja California, Ciudad de México'
    },
    eta: '4:15 PM',
    etaOriginal: '4:00 PM',
    status: 'delayed',
    delayRisk: true,
    delayRiskPercent: 85,
    inRiskZone: true,
    cargo: {
      type: 'pallets',
      weight: 750.5,
      count: 2
    },
    routeCoordinates: [
      [-99.1201, 19.3650],
      [-99.1250, 19.3730],
      [-99.1329, 19.3827],
      [-99.1400, 19.3950],
      [-99.1500, 19.4100],
      [-99.1673, 19.4279]
    ]
  },
  {
    id: 'TR014',
    trackingId: '456284',
    custodioName: 'Carlos R.',
    destination: 'Av. Universidad 3000, Ciudad de México',
    destinationCoordinates: [-99.1761, 19.3186],
    origin: 'Av. Constituyentes 1001, Ciudad de México',
    originCoordinates: [-99.2111, 19.4011],
    currentLocation: {
      coordinates: [-99.1943, 19.3611],
      address: 'Periférico Sur, Ciudad de México'
    },
    eta: '6:20 PM',
    etaOriginal: '6:30 PM',
    status: 'on_time',
    delayRisk: false,
    delayRiskPercent: 0,
    inRiskZone: false,
    cargo: {
      type: 'electronics',
      weight: 525.3,
      count: 8
    },
    routeCoordinates: [
      [-99.2111, 19.4011],
      [-99.2050, 19.3950],
      [-99.1990, 19.3800],
      [-99.1943, 19.3611],
      [-99.1850, 19.3400],
      [-99.1761, 19.3186]
    ]
  },
  {
    id: 'TR015',
    trackingId: '456285',
    custodioName: 'Fernando L.',
    destination: 'Av. Ejército Nacional 843, Ciudad de México',
    destinationCoordinates: [-99.2028, 19.4382],
    origin: 'Calz. Ignacio Zaragoza 1600, Ciudad de México',
    originCoordinates: [-99.0750, 19.4000],
    currentLocation: {
      coordinates: [-99.2029, 19.4326],
      address: 'Av. Horacio, Polanco, Ciudad de México'
    },
    eta: '3:50 PM',
    etaOriginal: '3:30 PM',
    status: 'delayed',
    delayRisk: true,
    delayRiskPercent: 92,
    inRiskZone: true,
    cargo: {
      type: 'pharmaceutical',
      weight: 115.8,
      count: 6
    },
    routeCoordinates: [
      [-99.0750, 19.4000],
      [-99.0950, 19.4050],
      [-99.1300, 19.4150],
      [-99.1600, 19.4250],
      [-99.1850, 19.4300],
      [-99.2029, 19.4326],
      [-99.2028, 19.4382]
    ]
  },
  {
    id: 'TR016',
    trackingId: '456286',
    custodioName: 'Ricardo G.',
    destination: 'Plaza de la Constitución s/n, Ciudad de México',
    destinationCoordinates: [-99.1332, 19.4326],
    origin: 'Aeropuerto Internacional de la Ciudad de México',
    originCoordinates: [-99.0856, 19.4091],
    currentLocation: {
      coordinates: [-99.0856, 19.4091],
      address: 'Aeropuerto Internacional de la Ciudad de México'
    },
    eta: '4:45 PM',
    etaOriginal: '4:45 PM',
    status: 'in_transit',
    delayRisk: true,
    delayRiskPercent: 15,
    inRiskZone: true,
    cargo: {
      type: 'documents',
      weight: 5.2,
      count: 2
    },
    routeCoordinates: [
      [-99.0856, 19.4091],
      [-99.0950, 19.4150],
      [-99.1100, 19.4200],
      [-99.1200, 19.4250],
      [-99.1332, 19.4326]
    ]
  }
];
