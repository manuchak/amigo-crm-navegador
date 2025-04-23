
import React from "react";
import AddressFields from "./AddressFields";
import ContactFields from "./ContactFields";
import InstallerWorkshopField from "./InstallerWorkshopField";
import MapFields from "./MapFields";

export default function AddressSection({ control }: { control: any }) {
  return (
    <section className="my-6">
      <div className="mb-2 font-semibold text-violet-700 text-base">Ubicación de la instalación</div>
      <AddressFields control={control} />
      <ContactFields control={control} />
      <InstallerWorkshopField control={control} />
      <MapFields control={control} />
    </section>
  );
}
