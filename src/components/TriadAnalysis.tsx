"use client";

import TriadDiagram from "./TriadDiagram";

interface TriadAnalysisProps {
  thesis: { label: string; text: string };
  antithesis: { label: string; text: string };
  synthesis: { label: string; text: string };
  harmonyScore: number;
}

export default function TriadAnalysis({
  thesis,
  antithesis,
  synthesis,
  harmonyScore,
}: TriadAnalysisProps) {
  return (
    <div className="mt-4 space-y-4">
      <TriadDiagram harmonyScore={harmonyScore} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Thesis */}
        <div className="rounded-lg border border-red-400/20 bg-red-400/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span className="text-sm font-semibold text-red-400">
              {thesis.label}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            {thesis.text}
          </p>
        </div>

        {/* Antithesis */}
        <div className="rounded-lg border border-indigo-400/20 bg-indigo-400/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-sm font-semibold text-indigo-400">
              {antithesis.label}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            {antithesis.text}
          </p>
        </div>

        {/* Synthesis */}
        <div className="rounded-lg border border-green-400/20 bg-green-400/[0.03] p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <span className="text-sm font-semibold text-green-400">
              {synthesis.label}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">
            {synthesis.text}
          </p>
        </div>
      </div>
    </div>
  );
}
