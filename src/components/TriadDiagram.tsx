"use client";

interface TriadDiagramProps {
  harmonyScore: number;
}

export default function TriadDiagram({ harmonyScore }: TriadDiagramProps) {
  const opacity = 0.3 + (harmonyScore / 100) * 0.7;

  return (
    <div className="flex justify-center py-4">
      <svg viewBox="0 0 200 180" className="w-48 h-auto">
        {/* Glow effect */}
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="lineGradTH" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#818CF8" />
          </linearGradient>
          <linearGradient id="lineGradTA" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF6B6B" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="lineGradAS" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#4ADE80" />
          </linearGradient>
        </defs>

        {/* Triangle edges */}
        <line
          x1="100"
          y1="20"
          x2="180"
          y2="160"
          stroke="url(#lineGradTH)"
          strokeWidth="1.5"
          opacity={opacity}
        />
        <line
          x1="100"
          y1="20"
          x2="20"
          y2="160"
          stroke="url(#lineGradTA)"
          strokeWidth="1.5"
          opacity={opacity}
        />
        <line
          x1="20"
          y1="160"
          x2="180"
          y2="160"
          stroke="url(#lineGradAS)"
          strokeWidth="1.5"
          opacity={opacity}
        />

        {/* Center fill */}
        <polygon
          points="100,20 180,160 20,160"
          fill="rgba(192,132,252,0.05)"
          opacity={opacity}
        />

        {/* Nodes */}
        <circle
          cx="100"
          cy="20"
          r="8"
          fill="#FF6B6B"
          filter="url(#glow)"
          opacity={opacity}
        />
        <circle
          cx="180"
          cy="160"
          r="8"
          fill="#818CF8"
          filter="url(#glow)"
          opacity={opacity}
        />
        <circle
          cx="20"
          cy="160"
          r="8"
          fill="#4ADE80"
          filter="url(#glow)"
          opacity={opacity}
        />

        {/* Labels */}
        <text
          x="100"
          y="8"
          textAnchor="middle"
          fill="#FF6B6B"
          fontSize="10"
          fontWeight="bold"
        >
          TEZA
        </text>
        <text
          x="192"
          y="168"
          textAnchor="start"
          fill="#818CF8"
          fontSize="10"
          fontWeight="bold"
        >
          ANTITEZA
        </text>
        <text
          x="8"
          y="168"
          textAnchor="end"
          fill="#4ADE80"
          fontSize="10"
          fontWeight="bold"
        >
          SINTEZA
        </text>
      </svg>
    </div>
  );
}
