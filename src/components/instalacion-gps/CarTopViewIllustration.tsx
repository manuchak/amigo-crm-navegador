
import React from "react";

/**
 * Vista superior vector de un coche sedán para croquis de daños o selección.
 * Estilo ilustrativo limpio, personalizable.
 */
type CarTopViewIllustrationProps = {
  width?: number;
  height?: number;
  // Si quieres agregar marcadores interactivos, puedes pasar children
  children?: React.ReactNode;
};

export default function CarTopViewIllustration({
  width = 300,
  height = 140,
  children,
}: CarTopViewIllustrationProps) {
  return (
    <svg
      viewBox="0 0 300 140"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
      style={{ display: "block", background: "transparent" }}
    >
      {/* Cuerpo principal */}
      <ellipse
        cx="150"
        cy="70"
        rx="110"
        ry="48"
        fill="#E7E2F7"
        stroke="#7153C4"
        strokeWidth="5"
      />
      {/* Cabina */}
      <ellipse
        cx="150"
        cy="72"
        rx="60"
        ry="32"
        fill="#C6BBEE"
        stroke="#6E59A5"
        strokeWidth="2"
        opacity="0.95"
      />
      {/* Parabrisas delantero */}
      <rect
        x="118"
        y="29"
        width="64"
        height="20"
        rx="8"
        fill="#b7a7e7"
        opacity="0.28"
      />
      {/* Parabrisas trasero */}
      <rect
        x="118"
        y="91"
        width="64"
        height="20"
        rx="8"
        fill="#b7a7e7"
        opacity="0.28"
      />
      {/* Cofre */}
      <ellipse
        cx="150"
        cy="35"
        rx="50"
        ry="15"
        fill="#f4effe"
        stroke="#d6bcfa"
        strokeWidth="1.5"
        opacity="0.92"
      />
      {/* Cajuela */}
      <ellipse
        cx="150"
        cy="105"
        rx="50"
        ry="15"
        fill="#f4effe"
        stroke="#d6bcfa"
        strokeWidth="1.5"
        opacity="0.92"
      />
      {/* Llantas */}
      <ellipse
        cx="52"
        cy="34"
        rx="10"
        ry="22"
        fill="#aaa"
        stroke="#6E59A5"
        strokeWidth="2"
        opacity="0.6"
      />
      <ellipse
        cx="248"
        cy="34"
        rx="10"
        ry="22"
        fill="#aaa"
        stroke="#6E59A5"
        strokeWidth="2"
        opacity="0.6"
      />
      <ellipse
        cx="52"
        cy="106"
        rx="10"
        ry="22"
        fill="#aaa"
        stroke="#6E59A5"
        strokeWidth="2"
        opacity="0.6"
      />
      <ellipse
        cx="248"
        cy="106"
        rx="10"
        ry="22"
        fill="#aaa"
        stroke="#6E59A5"
        strokeWidth="2"
        opacity="0.6"
      />
      {/* Líneas de puertas centrales */}
      <rect
        x="142"
        y="48"
        width="16"
        height="44"
        rx="4"
        fill="#fff"
        opacity="0.3"
      />
      {/* Bordes laterales - imitan puertas */}
      <rect
        x="44"
        y="50"
        width="16"
        height="40"
        rx="6"
        fill="#fff"
        opacity="0.1"
      />
      <rect
        x="240"
        y="50"
        width="16"
        height="40"
        rx="6"
        fill="#fff"
        opacity="0.1"
      />
      {/* Placeholder para agregar puntos/marcadores interactivos */}
      {children}
    </svg>
  );
}
