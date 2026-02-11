"use client";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <polygon
                points="12,2 22,20 2,20"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1.5"
              />
              <circle cx="12" cy="4" r="2" fill="#FF6B6B" opacity="0.5" />
              <circle cx="21" cy="19" r="2" fill="#818CF8" opacity="0.5" />
              <circle cx="3" cy="19" r="2" fill="#4ADE80" opacity="0.5" />
            </svg>
            <span className="text-sm text-white/30">
              Triad News — Novice skozi oči harmonije
            </span>
          </div>
          <p className="text-xs text-white/20">
            Analiza s pomočjo Claude AI. Triada: teza, antiteza, sinteza.
          </p>
        </div>
      </div>
    </footer>
  );
}
