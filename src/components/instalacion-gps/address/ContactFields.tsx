
import React from "react";
import ReferencesInput from "./ReferencesInput";

/**
 * ContactFields: eliminamos input de teléfono porque
 * ya se muestra bajo el nombre del cliente en el form principal.
 */
export default function ContactFields({ control }: { control: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mt-4">
      <ReferencesInput control={control}/>
    </div>
  );
}
