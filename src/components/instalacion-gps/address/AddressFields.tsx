
import React from "react";
import StateInput from "./StateInput";
import CityInput from "./CityInput";
import ColoniaInput from "./ColoniaInput";
import StreetInput from "./StreetInput";
import NumberInput from "./NumberInput";
import PostalCodeInput from "./PostalCodeInput";

export default function AddressFields({ control }: { control: any }) {
  // Cambiamos el orden para que siga el flujo más esperado para direcciones mexicanas
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Primer fila: Estado, Ciudad, Colonia */}
      <StateInput control={control} />
      <CityInput control={control} />
      <ColoniaInput control={control} />
      {/* Segunda fila: Calle, Número, Código Postal */}
      <StreetInput control={control} />
      <NumberInput control={control} />
      <PostalCodeInput control={control} />
    </div>
  );
}
