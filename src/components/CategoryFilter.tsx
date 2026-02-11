"use client";

interface CategoryFilterProps {
  categories: string[];
  selected: string | null;
  onChange: (category: string | null) => void;
}

export default function CategoryFilter({
  categories,
  selected,
  onChange,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
          !selected
            ? "bg-purple-400/10 border-purple-400/30 text-purple-300"
            : "border-white/5 text-white/40 hover:text-white/60 hover:border-white/10"
        }`}
      >
        Vse kategorije
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(selected === cat ? null : cat)}
          className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
            selected === cat
              ? "bg-purple-400/10 border-purple-400/30 text-purple-300"
              : "border-white/5 text-white/40 hover:text-white/60 hover:border-white/10"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
