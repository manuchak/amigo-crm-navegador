
import React from "react";

interface Props {
  imagePreviews: string[];
}

export function ImagePreviewList({ imagePreviews }: Props) {
  if (!imagePreviews.length) return null;
  return (
    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
      {imagePreviews.map((url, i) => (
        <img
          key={url}
          src={url}
          className="w-20 h-20 object-cover rounded border"
          alt={`Vista previa taller ${i + 1}`}
        />
      ))}
    </div>
  );
}
