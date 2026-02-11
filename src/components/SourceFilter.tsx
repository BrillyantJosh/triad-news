"use client";

import { NEWS_SOURCES } from "@/lib/sources";

interface SourceFilterProps {
  selected: string | null;
  onChange: (source: string | null) => void;
}

export default function SourceFilter({ selected, onChange }: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
          !selected
            ? "bg-white/10 border-white/20 text-white"
            : "border-white/5 text-white/40 hover:text-white/60 hover:border-white/10"
        }`}
      >
        Vsi viri
      </button>
      {NEWS_SOURCES.map((source) => (
        <button
          key={source.id}
          onClick={() => onChange(selected === source.id ? null : source.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
            selected === source.id
              ? "bg-white/10 border-white/20 text-white"
              : "border-white/5 text-white/40 hover:text-white/60 hover:border-white/10"
          }`}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: source.color }}
          />
          {source.name}
        </button>
      ))}
    </div>
  );
}
