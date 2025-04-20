
import React from "react";

interface StageNameTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
}

const StageNameTick: React.FC<StageNameTickProps> = ({ x = 0, y = 0, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text
      x={0}
      y={0}
      dy={14}
      textAnchor="middle"
      fontSize={15}
      fontWeight={600}
      fill="#334155"
      style={{ fontFamily: "inherit" }}
    >
      {payload?.value}
    </text>
  </g>
);

export default StageNameTick;
