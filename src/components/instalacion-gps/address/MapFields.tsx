
import React from "react";
import MapInputBox from "./MapInputBox";

export default function MapFields({ control }: { control: any }) {
  return (
    <div className="mt-4">
      <MapInputBox control={control}/>
    </div>
  );
}
