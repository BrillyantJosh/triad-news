"use client";

interface HarmonyGaugeProps {
  score: number;
  size?: number;
}

export default function HarmonyGauge({ score, size = 48 }: HarmonyGaugeProps) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return "#4ADE80";
    if (s >= 50) return "#FBBF24";
    if (s >= 25) return "#FB923C";
    return "#FF6B6B";
  };

  const color = getColor(score);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span
        className="absolute text-xs font-bold"
        style={{ color, fontSize: size * 0.25 }}
      >
        {score}
      </span>
    </div>
  );
}
