
import React from "react";
import StateInput from "./StateInput";
import CityInput from "./CityInput";
import ColoniaInput from "./ColoniaInput";
import StreetInput from "./StreetInput";
import NumberInput from "./NumberInput";
import PostalCodeInput from "./PostalCodeInput";
import PhoneInput from "./PhoneInput";
import ReferencesInput from "./ReferencesInput";
import MapInput from "./MapInput";
import InstallerWorkshopSwitch from "./InstallerWorkshopSwitch";

export default function AddressSection({ control }: { control: any }) {
  return (
    <section className="my-6">
      <div className="mb-2 font-semibold text-violet-700 text-base">Ubicación de la instalación</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StateInput control={control}/>
        <CityInput control={control}/>
        <PostalCodeInput control={control}/>
        <ColoniaInput control={control}/>
        <StreetInput control={control}/>
        <NumberInput control={control}/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        <PhoneInput control={control}/>
        <InstallerWorkshopSwitch control={control}/>
      </div>
      <div className="mt-4">
        <ReferencesInput control={control}/>
      </div>
      <div className="mt-4">
        <MapInput control={control}/>
      </div>
    </section>
  );
}
