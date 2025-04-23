
import React from "react";
import StateInput from "./StateInput";
import CityInput from "./CityInput";
import ColoniaInput from "./ColoniaInput";
import StreetInput from "./StreetInput";
import NumberInput from "./NumberInput";
import PostalCodeInput from "./PostalCodeInput";

/**
 * AddressFields ahora muestra dos bloques de líneas de dirección, para mimetizar
 * la visualización del dropdown y separar claramente:
 *  Línea 1: Calle y número
 *  Línea 2: Colonia, ciudad, estado, CP
 */
export default function AddressFields({ control }: { control: any }) {
  return (
    <div className="flex flex-col gap-0.5">
      {/* Primera línea: Calle y número */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <StreetInput control={control} />
        <NumberInput control={control} />
      </div>
      {/* Segunda línea: Colonia, ciudad, estado, CP */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <ColoniaInput control={control} />
        <CityInput control={control} />
        <StateInput control={control} />
        <PostalCodeInput control={control} />
      </div>
    </div>
  );
}
