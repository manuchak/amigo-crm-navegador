
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type InstallationSummaryProps = {
  installData: {
    ownerName: string;
    installAddress?: {
      phone?: string;
      street?: string;
      number?: string;
      colonia?: string;
      city?: string;
      state?: string;
    };
    vehicles?: Array<{
      brand: string;
      model: string;
      year: string;
      vehiclePlate?: string;
      type?: "fijo" | "dashcam";
      gpsFeatures?: string[];
      dashcamFeatures?: string[];
      dashcamCameraCount?: number;
    }>;
  };
};

const formatFeatures = (vehicle: InstallationSummaryProps["installData"]["vehicles"][0]) => {
  if (!vehicle) return "";
  
  const features = [];
  if (vehicle.type === "fijo") {
    features.push(...(vehicle.gpsFeatures || []));
  } else if (vehicle.type === "dashcam") {
    features.push(`${vehicle.dashcamCameraCount || 2} cámaras`);
    features.push(...(vehicle.dashcamFeatures || []));
  }
  return features.join(", ");
};

export function InstallationSummary({ installData }: InstallationSummaryProps) {
  return (
    <Card className="bg-white/95 shadow-xl border-0">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-gray-800">Detalles de la Instalación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-600 mb-2">Cliente</h3>
            <div className="space-y-2">
              <p className="text-gray-800">{installData.ownerName}</p>
              <p className="text-gray-600">{installData.installAddress?.phone}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-600 mb-2">Ubicación</h3>
            <p className="text-gray-800">
              {installData.installAddress ? 
                `${installData.installAddress.street} ${installData.installAddress.number}, 
                ${installData.installAddress.colonia}, 
                ${installData.installAddress.city}, 
                ${installData.installAddress.state}` : 
                "Dirección no disponible"}
            </p>
          </div>
        </div>
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium text-gray-600 mb-3">Vehículos y Equipamiento</h3>
          <div className="space-y-3">
            {installData.vehicles?.map((vehicle, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">
                  {vehicle.brand} {vehicle.model} {vehicle.year} - {vehicle.vehiclePlate}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Tipo: {vehicle.type === "fijo" ? "GPS Fijo" : "DashCam"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Características: {formatFeatures(vehicle)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
