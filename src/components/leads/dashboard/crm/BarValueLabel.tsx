
import React from "react";

interface BarValueLabelProps {
  x?: number;
  y?: number;
  width?: number;
  value?: number;
}

const BarValueLabel: React.FC<BarValueLabelProps> = ({
  x = 0,
  y = 0,
  width = 0,
  value = 0,
}) => {
  if (typeof value !== "number" || isNaN(value)) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 8}
      textAnchor="middle"
      fill="#F59E42"
      fontWeight={700}
      fontSize={14}
      style={{ fontFamily: "inherit" }}
    >
      {value.toFixed(1)}
    </text>
  );
};

export default BarValueLabel;
