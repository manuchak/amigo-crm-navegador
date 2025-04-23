
import React from "react";
import PhoneInputMx from "./PhoneInputMx";
import ReferencesInput from "./ReferencesInput";

export default function ContactFields({ control }: { control: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
      <PhoneInputMx control={control}/>
      <ReferencesInput control={control}/>
    </div>
  );
}
