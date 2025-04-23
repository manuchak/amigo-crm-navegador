
import React from "react";
import StateInput from "./StateInput";
import CityInput from "./CityInput";
import ColoniaInput from "./ColoniaInput";
import StreetInput from "./StreetInput";
import NumberInput from "./NumberInput";
import PostalCodeInput from "./PostalCodeInput";

export default function AddressFields({ control }: { control: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <StateInput control={control}/>
      <CityInput control={control}/>
      <ColoniaInput control={control}/>
      <StreetInput control={control}/>
      <NumberInput control={control}/>
      <PostalCodeInput control={control}/>
    </div>
  );
}
