"use client";

export default function LoadingPulse({ text = "AI analizira..." }: { text?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-purple-400">
      <div className="relative flex items-center justify-center w-5 h-5">
        <span className="absolute w-full h-full rounded-full bg-purple-400/30 animate-ping" />
        <span className="relative w-2.5 h-2.5 rounded-full bg-purple-400" />
      </div>
      <span className="animate-pulse">{text}</span>
    </div>
  );
}
