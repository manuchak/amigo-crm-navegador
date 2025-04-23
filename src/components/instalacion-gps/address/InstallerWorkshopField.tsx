
import React from "react";
import InstallerWorkshopSwitch from "./InstallerWorkshopSwitch";

export default function InstallerWorkshopField({ control }: { control: any }) {
  return (
    <div className="mt-3">
      <InstallerWorkshopSwitch control={control}/>
    </div>
  );
}
