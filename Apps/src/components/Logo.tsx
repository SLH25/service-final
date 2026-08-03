// src/components/Logo.tsx
// import React from "react";

export default function Logo({
  width = 420,
  className = "",
  ariaLabel = "HelloServices logo",
}) {
  const height = (width * 152) / 420;

  // Couleurs inspirées de l'image fournie
  const ORANGE = "#F59E0B"; // fond
  const WHITE = "#FFFFFF"; // texte HelloServices
  const BLACK = "#111111"; // combiné + slogan

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      width={width}
      height={height}
      viewBox="0 0 420 152"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{ariaLabel}</title>

      {/* Fond orange, coins fortement arrondis */}
      <rect x="12" y="14" width="396" height="96" rx="10" fill={ORANGE} />

      {/* Texte principal "HelloServices" en blanc */}
      <g aria-hidden="true">
        {/* Gros H vide pour laisser place au combiné noir */}
        <text
          x="42"
          y="78"
          fill={WHITE}
          fontSize="60"
          fontFamily="ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="800"
          letterSpacing="0.5"
        >
          H
        </text>

        {/* Combiné de téléphone noir intégré au H */}
        <g transform="translate(68,44) rotate(-20)">
          <path
            d="M16 0c3.6 0 6.6 3 6.6 6.6v3.2c0 1.6-0.6 3.1-1.8 4.2l-5.9 5.6c-1.4 1.4-3.7 1.4-5.1 0l-1.8-1.8c-0.9-0.9-2.4-0.9-3.3 0L0 20.6c-0.9 0.9-0.9 2.4 0 3.3l1.8 1.8c1.4 1.4 1.4 3.7 0 5.1l-5.6 5.9C-4.9 37.9-6.4 38.5-8 38.5h-3.2C-15 38.5-18 35.5-18 31.9c0-12.8 10.4-23.1 23.1-23.1H8.5C11.1 8.8 13.9 6.1 16 3.4 16.6 2.7 16.9 1.9 16.9 1 16.9 0.6 16.5 0 16 0z"
            fill={BLACK}
          />
        </g>

        {/* "elloServices" pour compléter le mot, en blanc */}
        <text
          x="98"
          y="78"
          fill={WHITE}
          fontSize="44"
          fontFamily="ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="700"
          letterSpacing="0.5"
        >
          elloServices
        </text>
      </g>

      {/* Slogan noir centré sous le bloc orange */}
      <text
        x="210"
        y="138"
        textAnchor="middle"
        fill={BLACK}
        fontSize="14"
        fontFamily="ui-sans-serif, system-ui, Segoe UI, Roboto, Helvetica, Arial"
        fontWeight="800"
        letterSpacing="1.2"
      >
        PROXIMITÉ, QUALITÉ ET CONFIANCE
      </text>
    </svg>
  );
}
