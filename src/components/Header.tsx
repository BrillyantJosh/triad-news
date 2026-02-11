"use client";

import { useState } from "react";

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  totalArticles: number;
}

export default function Header({
  onRefresh,
  isRefreshing,
  totalArticles,
}: HeaderProps) {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <header className="relative border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo triangle */}
            <div className="relative w-10 h-10 flex-shrink-0">
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <defs>
                  <linearGradient
                    id="triadGrad"
                    x1="0%"
                    y1="100%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#FF6B6B" />
                    <stop offset="50%" stopColor="#C084FC" />
                    <stop offset="100%" stopColor="#4ADE80" />
                  </linearGradient>
                </defs>
                <polygon
                  points="20,2 38,36 2,36"
                  fill="none"
                  stroke="url(#triadGrad)"
                  strokeWidth="2"
                />
                <circle cx="20" cy="5" r="3" fill="#FF6B6B" />
                <circle cx="36" cy="35" r="3" fill="#818CF8" />
                <circle cx="4" cy="35" r="3" fill="#4ADE80" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold bg-gradient-to-r from-red-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                TRIAD NEWS
              </h1>
              <p className="text-[10px] sm:text-xs tracking-[0.25em] text-white/40 uppercase">
                Novice skozi oči harmonije
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-white/30">
              {totalArticles} člankov
            </span>
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="text-xs text-white/40 hover:text-white/70 transition-colors px-2 py-1"
            >
              ?
            </button>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all disabled:opacity-40"
            >
              <svg
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {isRefreshing ? "Osvežujem..." : "Osveži"}
            </button>
          </div>
        </div>
      </div>

      {/* About panel */}
      {showAbout && (
        <div className="border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="inline-block w-3 h-3 rounded-full bg-red-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-red-400">Teza</span>
                  <p className="text-white/50 mt-1">
                    Glavna trditev novice. Kaj sporočilo trdi?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="inline-block w-3 h-3 rounded-full bg-indigo-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-indigo-400">
                    Antiteza
                  </span>
                  <p className="text-white/50 mt-1">
                    Nasprotna perspektiva. Kaj manjka, kaj je spregledano?
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="inline-block w-3 h-3 rounded-full bg-green-400 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-green-400">Sinteza</span>
                  <p className="text-white/50 mt-1">
                    Višja perspektiva. Kako harmonizirati obe strani?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
