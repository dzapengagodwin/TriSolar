import React from "react"

export default function NotFoundIllustration({
  className = "w-full max-w-[280px] sm:max-w-[320px] h-auto",
}: {
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="404 Page Not Found Illustration"
      role="img"
    >
      <defs>
        <linearGradient id="minScreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>
      </defs>

      {/* Subtle Ground Shadow */}
      <ellipse cx="160" cy="205" rx="100" ry="8" fill="#F1F5F9" />

      {/* Modern Minimal Laptop */}
      <g>
        {/* Screen Outer Lid */}
        <rect
          x="75"
          y="42"
          width="170"
          height="115"
          rx="10"
          fill="#1E293B"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Display Panel */}
        <rect
          x="82"
          y="49"
          width="156"
          height="101"
          rx="6"
          fill="url(#minScreenGrad)"
        />

        {/* Top Camera Dot */}
        <circle cx="160" cy="45.5" r="1.5" fill="#475569" />

        {/* Browser / Terminal Header */}
        <circle cx="94" cy="59" r="2.5" fill="#EF4444" />
        <circle cx="102" cy="59" r="2.5" fill="#F59E0B" />
        <circle cx="110" cy="59" r="2.5" fill="#10B981" />
        <line
          x1="82"
          y1="67"
          x2="238"
          y2="67"
          stroke="#334155"
          strokeWidth="0.8"
        />

        {/* 404 Code Display */}
        <text
          x="160"
          y="108"
          textAnchor="middle"
          fill="#F97316"
          fontSize="30"
          fontWeight="800"
          fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="-0.5"
        >
          404
        </text>

        <text
          x="160"
          y="126"
          textAnchor="middle"
          fill="#64748B"
          fontSize="8.5"
          fontWeight="600"
          fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="1.2"
        >
          PAGE_NOT_FOUND
        </text>

        {/* Laptop Base */}
        <path
          d="M50 157 H270 C272 157 274 158.5 273.5 160.5 L266 182 C265.5 183.5 264 184.5 262.5 184.5 H57.5 C56 184.5 54.5 183.5 54 182 L46.5 160.5 C46 158.5 48 157 50 157 Z"
          fill="#F8FAFC"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />

        {/* Keyboard Area Outline */}
        <path
          d="M68 160 H252 L248 174 H72 Z"
          fill="#F1F5F9"
          stroke="#E2E8F0"
          strokeWidth="1"
        />

        {/* Trackpad */}
        <rect
          x="142"
          y="176"
          width="36"
          height="5.5"
          rx="1.5"
          fill="#E2E8F0"
        />

        {/* Opening Notch */}
        <rect
          x="147"
          y="157"
          width="26"
          height="2.5"
          rx="1"
          fill="#CBD5E1"
        />
      </g>

      {/* Decorative Minimal Sparkles */}
      <circle cx="56" cy="65" r="2" fill="#FDBA74" />
      <circle cx="266" cy="80" r="2.5" fill="#FDBA74" />
      <circle cx="280" cy="130" r="1.5" fill="#CBD5E1" />
      <circle cx="44" cy="120" r="1.5" fill="#CBD5E1" />
    </svg>
  )
}
