
import { ActiveService } from "./types";

export const mockActiveServices: ActiveService[] = [
  {
    id: "SVC-001",
    custodioName: "Carlos Méndez",
    vehicleType: "Camión 3.5T",
    status: "in-transit",
    origin: "CDMX - Centro de Distribución",
    destination: "Puebla - Tienda Central",
    originCoordinates: [-99.1332, 19.4326], // CDMX
    destinationCoordinates: [-98.2063, 19.0414], // Puebla
    eta: "14:45",
    etaOriginal: "14:30",
    adjustedEta: "15:20",
    estimatedDelayMinutes: 50,
    currentLocation: {
      coordinates: [-98.7623, 19.2134],
      address: "Autopista México-Puebla km 85",
      timestamp: "12:30"
    },
    trackingId: "TRK12345",
    inRiskZone: false,
    delayRisk: true,
    delayRiskPercent: 85,
    cargoType: "Electrónicos",
    cargoValue: 120000,
    cargoWeight: 1500,
    cargoUnits: 120,
    progress: 65,
    weatherEvent: {
      type: "Lluvia intensa",
      severity: 2,
      location: "Tramo San Martín-Puebla",
      estimatedDelay: "30-45 minutos",
      causesDelay: true
    },
    roadBlockage: null
  },
  {
    id: "SVC-002",
    custodioName: "Miguel Ángel Pérez",
    vehicleType: "Van de carga",
    status: "in-transit",
    origin: "Veracruz - Puerto",
    destination: "Xalapa - Centro",
    originCoordinates: [-96.1342, 19.1738], // Veracruz
    destinationCoordinates: [-96.9102, 19.5438], // Xalapa
    eta: "13:15",
    etaOriginal: "13:00",
    currentLocation: {
      coordinates: [-96.4534, 19.3087],
      address: "Carretera Federal Veracruz-Xalapa km 35",
      timestamp: "12:15"
    },
    trackingId: "TRK12346",
    inRiskZone: true,
    delayRisk: false,
    delayRiskPercent: 0,
    cargoType: "Textiles",
    cargoValue: 80000,
    cargoWeight: 900,
    cargoUnits: 45,
    progress: 50,
    roadBlockage: {
      active: false,
      location: "",
      reason: "",
      estimatedDelay: "",
      causesDelay: false
    }
  },
  {
    id: "SVC-003",
    custodioName: "Ana Laura Gutiérrez",
    vehicleType: "Tractocamión",
    status: "in-transit",
    origin: "Tlaxcala - Centro Logístico",
    destination: "CDMX - Central de Abastos",
    originCoordinates: [-98.2370, 19.3139], // Tlaxcala
    destinationCoordinates: [-99.0959, 19.3708], // Central de Abastos
    eta: "15:30",
    etaOriginal: "14:00",
    adjustedEta: "16:15",
    estimatedDelayMinutes: 135,
    currentLocation: {
      coordinates: [-98.5823, 19.5633],
      address: "Autopista Arco Norte km 42",
      timestamp: "12:20"
    },
    trackingId: "TRK12347",
    inRiskZone: false,
    delayRisk: true,
    delayRiskPercent: 95,
    cargoType: "Alimentos",
    cargoValue: 250000,
    cargoWeight: 12000,
    cargoUnits: 500,
    progress: 30,
    roadBlockage: {
      active: true,
      location: "Autopista Arco Norte km 50",
      reason: "Accidente múltiple",
      estimatedDelay: "1-2 horas",
      causesDelay: true
    }
  },
  {
    id: "SVC-004",
    custodioName: "Roberto Sánchez",
    vehicleType: "Camión tipo Torton",
    status: "in-transit",
    origin: "Querétaro - Parque Industrial",
    destination: "CDMX - Centro",
    originCoordinates: [-100.3899, 20.5888], // Querétaro
    destinationCoordinates: [-99.1332, 19.4326], // CDMX
    eta: "16:45",
    etaOriginal: "16:30",
    currentLocation: {
      coordinates: [-99.7535, 19.8123],
      address: "Autopista México-Querétaro km 120",
      timestamp: "12:25"
    },
    trackingId: "TRK12348",
    inRiskZone: false,
    delayRisk: false,
    delayRiskPercent: 15,
    cargoType: "Automotriz",
    cargoValue: 450000,
    cargoWeight: 8000,
    cargoUnits: 35,
    progress: 40
  },
  // Adding several "on time" services
  {
    id: "SVC-005",
    custodioName: "Francisco Ramírez",
    vehicleType: "Van de reparto",
    status: "in-transit",
    origin: "CDMX - Bodega Sur",
    destination: "Toluca - Centro Distribución",
    originCoordinates: [-99.1553, 19.3643], // CDMX Sur
    destinationCoordinates: [-99.6567, 19.2826], // Toluca
    eta: "13:00",
    etaOriginal: "13:00",
    currentLocation: {
      coordinates: [-99.4523, 19.3284],
      address: "Carr. México-Toluca km 28",
      timestamp: "12:15"
    },
    trackingId: "TRK12349",
    inRiskZone: false,
    delayRisk: false,
    delayRiskPercent: 5,
    cargoType: "Medicamentos",
    cargoValue: 300000,
    cargoWeight: 600,
    cargoUnits: 75,
    progress: 70,
    isOnTime: true
  },
  {
    id: "SVC-006",
    custodioName: "Javier Morales",
    vehicleType: "Camión 3.5T",
    status: "in-transit",
    origin: "Puebla - Fábrica Textil",
    destination: "Tlaxcala - Centro",
    originCoordinates: [-98.2063, 19.0414], // Puebla
    destinationCoordinates: [-98.2370, 19.3139], // Tlaxcala
    eta: "12:40",
    etaOriginal: "12:15",
    adjustedEta: "13:10",
    estimatedDelayMinutes: 55,
    currentLocation: {
      coordinates: [-98.2315, 19.1874],
      address: "Carretera Puebla-Tlaxcala km 22",
      timestamp: "12:05"
    },
    trackingId: "TRK12350",
    inRiskZone: false,
    delayRisk: true,
    delayRiskPercent: 60,
    cargoType: "Textiles",
    cargoValue: 150000,
    cargoWeight: 1200,
    cargoUnits: 80,
    progress: 55,
    weatherEvent: {
      type: "Neblina densa",
      severity: 1,
      location: "Carretera Puebla-Tlaxcala",
      estimatedDelay: "15-25 minutos",
      causesDelay: false
    },
    isOnTime: true
  },
  {
    id: "SVC-007",
    custodioName: "Gabriela Torres",
    vehicleType: "Tractocamión",
    status: "in-transit",
    origin: "Veracruz - Puerto",
    destination: "CDMX - Centro Logístico",
    originCoordinates: [-96.1342, 19.1738], // Veracruz
    destinationCoordinates: [-99.1332, 19.4326], // CDMX
    eta: "18:15",
    etaOriginal: "17:30",
    adjustedEta: "19:00",
    estimatedDelayMinutes: 90,
    currentLocation: {
      coordinates: [-97.1343, 19.2896],
      address: "Carretera Federal Veracruz-Puebla km 95",
      timestamp: "12:30"
    },
    trackingId: "TRK12351",
    inRiskZone: true,
    delayRisk: true,
    delayRiskPercent: 75,
    cargoType: "Contenedores",
    cargoValue: 580000,
    cargoWeight: 15000,
    cargoUnits: 3,
    progress: 25,
    weatherEvent: {
      type: "Tormenta eléctrica",
      severity: 3,
      location: "Orizaba-Puebla",
      estimatedDelay: "45-60 minutos",
      causesDelay: true
    },
    isOnTime: false
  },
  {
    id: "SVC-008",
    custodioName: "Eduardo Vega",
    vehicleType: "Van de carga",
    status: "delayed",
    origin: "CDMX - Aeropuerto",
    destination: "Cuernavaca - Centro Comercial",
    originCoordinates: [-99.0865, 19.4363], // CDMX Aeropuerto
    destinationCoordinates: [-99.2212, 18.9217], // Cuernavaca
    eta: "14:00",
    etaOriginal: "12:45",
    adjustedEta: "14:20",
    estimatedDelayMinutes: 95,
    currentLocation: {
      coordinates: [-99.1675, 19.0946],
      address: "Autopista México-Cuernavaca km 48",
      timestamp: "12:20"
    },
    trackingId: "TRK12352",
    inRiskZone: false,
    delayRisk: true,
    delayRiskPercent: 100,
    cargoType: "Electrónicos",
    cargoValue: 210000,
    cargoWeight: 800,
    cargoUnits: 40,
    progress: 75,
    roadBlockage: {
      active: true,
      location: "Autopista México-Cuernavaca km 52",
      reason: "Manifestación",
      estimatedDelay: "1-1.5 horas",
      causesDelay: true
    },
    isOnTime: false
  },
  // Additional "on time" services with no risks
  {
    id: "SVC-009",
    custodioName: "Luisa Ramírez",
    vehicleType: "Van de reparto",
    status: "in-transit",
    origin: "CDMX - Almacén Central",
    destination: "Texcoco - Centro Comercial",
    originCoordinates: [-99.1553, 19.3843], 
    destinationCoordinates: [-98.8831, 19.5076],
    eta: "14:15",
    etaOriginal: "14:15",
    currentLocation: {
      coordinates: [-99.0214, 19.4261],
      address: "Carretera México-Texcoco km 15",
      timestamp: "12:25"
    },
    trackingId: "TRK12353",
    inRiskZone: false,
    delayRisk: false,
    delayRiskPercent: 0,
    cargoType: "Electrónicos",
    cargoValue: 175000,
    cargoWeight: 450,
    cargoUnits: 25,
    progress: 50,
    isOnTime: true
  },
  {
    id: "SVC-010",
    custodioName: "Fernando Ortiz",
    vehicleType: "Camión ligero",
    status: "in-transit",
    origin: "Pachuca - Centro Logístico",
    destination: "CDMX - Tienda Norte",
    originCoordinates: [-98.7561, 20.1169],
    destinationCoordinates: [-99.1361, 19.4751],
    eta: "15:30",
    etaOriginal: "15:30",
    currentLocation: {
      coordinates: [-98.9463, 19.7953],
      address: "Autopista México-Pachuca km 28",
      timestamp: "12:15"
    },
    trackingId: "TRK12354",
    inRiskZone: false,
    delayRisk: false,
    delayRiskPercent: 0,
    cargoType: "Productos de consumo",
    cargoValue: 220000,
    cargoWeight: 1200,
    cargoUnits: 90,
    progress: 35,
    isOnTime: true
  },
  {
    id: "SVC-011",
    custodioName: "Isabel Méndez",
    vehicleType: "Camioneta de reparto",
    status: "in-transit",
    origin: "Toluca - Fábrica",
    destination: "CDMX - Centro de Distribución",
    originCoordinates: [-99.6567, 19.2826],
    destinationCoordinates: [-99.1332, 19.4326],
    eta: "13:45",
    etaOriginal: "13:45",
    currentLocation: {
      coordinates: [-99.4033, 19.3622],
      address: "Carretera México-Toluca km 42",
      timestamp: "12:20"
    },
    trackingId: "TRK12355",
    inRiskZone: false,
    delayRisk: false,
    delayRiskPercent: 0,
    cargoType: "Mercancía general",
    cargoValue: 130000,
    cargoWeight: 850,
    cargoUnits: 35,
    progress: 60,
    isOnTime: true
  },
  {
    id: "SVC-012",
    custodioName: "Ricardo Flores",
    vehicleType: "Van de carga",
    status: "in-transit",
    origin: "CDMX - Centro",
    destination: "Cuernavaca - Plaza Comercial",
    originCoordinates: [-99.1332, 19.4326],
    destinationCoordinates: [-99.2212, 18.9217],
    eta: "16:00",
    etaOriginal: "16:00",
    currentLocation: {
      coordinates: [-99.1809, 19.2176],
      address: "Autopista México-Cuernavaca km 25",
      timestamp: "12:30"
    },
    trackingId: "TRK12356",
    inRiskZone: false,
    delayRisk: false,
    delayRiskPercent: 0,
    cargoType: "Productos retail",
    cargoValue: 195000,
    cargoWeight: 600,
    cargoUnits: 50,
    progress: 30,
    isOnTime: true
  }
];
