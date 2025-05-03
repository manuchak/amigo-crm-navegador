
import { ActiveService } from './types';

// Define mock services with routes in the Puebla, Tlaxcala, Veracruz, Arco Norte regions
export const mockActiveServices: ActiveService[] = [
  {
    id: "S001",
    trackingId: "TRACK-7645",
    custodioName: "Carlos Mendoza",
    destination: "Terminal de Autobuses, Puebla",
    destinationCoordinates: [-98.2063, 19.0414],
    origin: "CDMX Centro de Distribución",
    originCoordinates: [-99.1332, 19.4326],
    currentLocation: {
      coordinates: [-98.3967, 19.0762],
      address: "Autopista México-Puebla Km 98"
    },
    eta: "14:30",
    etaOriginal: "14:25",
    status: "in_transit",
    delayRisk: false,
    delayRiskPercent: 0,
    inRiskZone: false,
    cargo: {
      type: "paquetes",
      weight: 350,
      count: 24
    },
    routeCoordinates: [
      [-99.1332, 19.4326],
      [-98.9456, 19.3287],
      [-98.7631, 19.2019],
      [-98.5423, 19.1243],
      [-98.3967, 19.0762],
      [-98.2063, 19.0414]
    ]
  },
  {
    id: "S002",
    trackingId: "TRACK-8921",
    custodioName: "Miguel Ángel Flores",
    destination: "Centro de Distribución Tlaxcala",
    destinationCoordinates: [-98.2370, 19.3139],
    origin: "CDMX Norte",
    originCoordinates: [-99.1673, 19.4978],
    currentLocation: {
      coordinates: [-98.4560, 19.2803],
      address: "Carretera Federal Puebla-Tlaxcala Km 25"
    },
    eta: "16:15",
    etaOriginal: "15:45",
    status: "delayed",
    delayRisk: true,
    delayRiskPercent: 78,
    inRiskZone: false,
    cargo: {
      type: "contenedores",
      weight: 1200,
      count: 3
    },
    routeCoordinates: [
      [-99.1673, 19.4978],
      [-98.9230, 19.3490],
      [-98.7631, 19.3100],
      [-98.5982, 19.2950],
      [-98.4560, 19.2803],
      [-98.2370, 19.3139]
    ]
  },
  {
    id: "S003",
    trackingId: "TRACK-6432",
    custodioName: "Alberto Guerra",
    destination: "Puerto de Veracruz",
    destinationCoordinates: [-96.1342, 19.1738],
    origin: "Puebla Centro Logístico",
    originCoordinates: [-98.1936, 19.0413],
    currentLocation: {
      coordinates: [-96.9240, 19.2810],
      address: "Carretera Puebla-Veracruz Km 180"
    },
    eta: "18:50",
    etaOriginal: "18:30",
    status: "in_transit",
    delayRisk: true,
    delayRiskPercent: 45,
    inRiskZone: false,
    cargo: {
      type: "pallets",
      weight: 2800,
      count: 12
    },
    routeCoordinates: [
      [-98.1936, 19.0413],
      [-97.8230, 19.0590],
      [-97.5120, 19.1020],
      [-97.2340, 19.1530],
      [-96.9240, 19.2810],
      [-96.1342, 19.1738]
    ]
  },
  {
    id: "S004",
    trackingId: "TRACK-5577",
    custodioName: "Juan Carlos Méndez",
    destination: "Centro Logístico Tlaxcala Sur",
    destinationCoordinates: [-98.2370, 19.2939],
    origin: "CDMX Este",
    originCoordinates: [-99.0437, 19.4051],
    currentLocation: {
      coordinates: [-98.5823, 19.5633],
      address: "Arco Norte Km 56"
    },
    eta: "15:20",
    etaOriginal: "14:45",
    status: "delayed",
    delayRisk: false,
    delayRiskPercent: 0,
    inRiskZone: true,
    cargo: {
      type: "cajas",
      weight: 890,
      count: 65
    },
    routeCoordinates: [
      [-99.0437, 19.4051],
      [-98.9230, 19.5120],
      [-98.7631, 19.5430],
      [-98.5823, 19.5633],
      [-98.4120, 19.4890],
      [-98.2370, 19.2939]
    ]
  },
  {
    id: "S005",
    trackingId: "TRACK-3398",
    custodioName: "Roberto Sánchez",
    destination: "Terminal Logística Puebla",
    destinationCoordinates: [-98.2123, 19.0514],
    origin: "CDMX Sur",
    originCoordinates: [-99.1363, 19.2594],
    currentLocation: {
      coordinates: [-99.0045, 19.7128],
      address: "Arco Norte Km 23"
    },
    eta: "13:40",
    etaOriginal: "13:15",
    status: "delayed",
    delayRisk: true,
    delayRiskPercent: 55,
    inRiskZone: true,
    cargo: {
      type: "tarimas",
      weight: 1640,
      count: 18
    },
    routeCoordinates: [
      [-99.1363, 19.2594],
      [-99.0890, 19.4120],
      [-99.0550, 19.6320],
      [-99.0045, 19.7128],
      [-98.7230, 19.5890],
      [-98.4560, 19.3420],
      [-98.2123, 19.0514]
    ]
  },
  {
    id: "S006",
    trackingId: "TRACK-2211",
    custodioName: "Felipe Guzmán",
    destination: "Centro Comercial Angelópolis, Puebla",
    destinationCoordinates: [-98.2528, 19.0292],
    origin: "CDMX Oeste",
    originCoordinates: [-99.2203, 19.3521],
    currentLocation: {
      coordinates: [-98.8456, 19.1523],
      address: "Autopista México-Puebla Km 65"
    },
    eta: "12:10",
    etaOriginal: "12:10",
    status: "on_time",
    delayRisk: false,
    delayRiskPercent: 0,
    inRiskZone: false,
    cargo: {
      type: "paquetes",
      weight: 540,
      count: 42
    },
    routeCoordinates: [
      [-99.2203, 19.3521],
      [-99.0437, 19.3120],
      [-98.9456, 19.2560],
      [-98.8456, 19.1523],
      [-98.6320, 19.0890],
      [-98.4120, 19.0590],
      [-98.2528, 19.0292]
    ]
  },
  {
    id: "S007",
    trackingId: "TRACK-9015",
    custodioName: "Raúl Torres",
    destination: "Centro de Distribución Veracruz",
    destinationCoordinates: [-96.1542, 19.1638],
    origin: "Puebla Centro",
    originCoordinates: [-98.1936, 19.0413],
    currentLocation: {
      coordinates: [-97.1340, 19.1827],
      address: "Carretera Federal Puebla-Veracruz Km 122"
    },
    eta: "17:40",
    etaOriginal: "17:40",
    status: "on_time",
    delayRisk: false,
    delayRiskPercent: 0,
    inRiskZone: false,
    cargo: {
      type: "contenedores",
      weight: 2200,
      count: 4
    },
    routeCoordinates: [
      [-98.1936, 19.0413],
      [-97.9120, 19.0720],
      [-97.6230, 19.1120],
      [-97.3450, 19.1520],
      [-97.1340, 19.1827],
      [-96.7230, 19.1735],
      [-96.4120, 19.1690],
      [-96.1542, 19.1638]
    ]
  }
];
