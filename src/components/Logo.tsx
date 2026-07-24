/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  hideText?: boolean;
}

export default function Logo({ className = "", size = "md", hideText = false }: LogoProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-16 h-16",
    lg: "w-28 h-28",
  };

  const containerSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div id="va-logo-container" className={`flex items-center gap-3 select-none ${className}`}>
      {/* PERFECT HIGH-FIDELITY VECTOR REPLICA OF THE VA ATTACHED LOGO */}
      <svg
        id="va-logo-svg"
        viewBox="0 0 200 200"
        className={`${containerSize} drop-shadow-md transition-transform duration-300 hover:scale-105`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* White rounded card background (the white card container in the logo image) */}
        <rect width="200" height="200" rx="24" fill="#ffffff" />
        
        {/* Core dark charcoal circular emblem */}
        <circle cx="100" cy="100" r="82" fill="#1e1e1e" />

        {/* Orange Arrow structure at the top */}
        <g id="orange-arrow-group">
          {/* Left horizontal line meeting the chevrons */}
          <line x1="28" y1="54" x2="54" y2="54" stroke="#fd6d28" strokeWidth="3.5" strokeLinecap="round" />
          
          {/* Chevrons pointing right ">>>>" */}
          <path d="M54 47 L61 54 L54 61" stroke="#fd6d28" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M64 47 L71 54 L64 61" stroke="#fd6d28" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M74 47 L81 54 L74 61" stroke="#fd6d28" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M84 47 L91 54 L84 61" stroke="#fd6d28" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Large Stealth Arrowhead */}
          <polygon
            points="105,38 165,54 105,70 120,54"
            fill="#fd6d28"
            stroke="#fd6d28"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </g>

        {/* Stylized Bold White "VA" Letters in the center */}
        <g id="va-letters-group">
          {/* Slanted bold V */}
          <path
            d="M50 78 L74 78 L92 128 L108 78 L132 78 L102 145 L78 145 Z"
            fill="#ffffff"
          />
          {/* Slanted bold A with horizontal extension that cuts to the edge of the circle (x=200) */}
          <path
            d="M124 78 H148 L167 125 H200 V145 H148 L136 100 L124 145 H100 Z"
            fill="#ffffff"
          />
          {/* A's inner triangle charcoal punch-out */}
          <polygon points="126,126 136,102 146,126" fill="#1e1e1e" />
        </g>

        {/* Center-aligned "VIRTUELLE ACADEMIQUE" orange text under "VA" */}
        <text
          x="100"
          y="160"
          fill="#fd6d28"
          fontFamily="'Inter', 'Montserrat', sans-serif"
          fontWeight="900"
          fontSize="10"
          textAnchor="middle"
          letterSpacing="0.8"
        >
          VIRTUELLE ACADEMIQUE
        </text>
      </svg>

      {/* Primary Written Wordmark alongside the logo (for header layouts) */}
      {!hideText && size !== "sm" && (
        <div id="va-wordmark-container" className="flex flex-col select-none">
          <div className="flex items-center gap-1.5">
            <div className="h-px w-4 bg-gold-400" />
            <span className="text-gold-500 font-serif italic text-xs tracking-wider">
              Virtuelle
            </span>
            <div className="h-px w-4 bg-gold-400" />
          </div>
          <span
            className={`font-serif font-bold text-navy-950 uppercase tracking-wide leading-none ${
              size === "lg" ? "text-3xl" : "text-xl"
            }`}
            style={{ letterSpacing: "1.5px" }}
          >
            Academique
          </span>
          <div className="w-full flex flex-col gap-0.5 mt-1.5">
            <div className="h-[1px] w-full bg-gold-400" />
            <div className="h-[0.5px] w-full bg-navy-800/20" />
          </div>
        </div>
      )}
    </div>
  );
}
