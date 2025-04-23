
// Minimal avatar/image preview for user's photo
import React from "react";
import { User } from "lucide-react";

export function InstallerImagePreview({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full border text-slate-300">
        <User className="w-6 h-6" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="Foto del instalador"
      className="w-12 h-12 object-cover rounded-full border"
      style={{ minWidth: 48 }}
    />
  );
}
