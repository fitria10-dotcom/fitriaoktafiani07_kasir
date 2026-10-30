import React from 'react';
import { CategoryId } from '../types/pos';
import { CATEGORIES } from '../data/initialData';
import { playClick } from '../utils/audio';
import { ChevronRight } from 'lucide-react';

interface SidebarCategoryProps {
  selectedCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
  categoryCounts?: Record<string, number>;
}

export const SidebarCategory: React.FC<SidebarCategoryProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts = {},
}) => {
  return (
    <aside className="w-32 md:w-40 lg:w-44 bg-[#f8f9fa] border-r border-neutral-200 flex flex-col flex-shrink-0 h-full overflow-y-auto select-none shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)]">
      <div className="flex flex-col py-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const count = categoryCounts[cat.id];

          return (
            <button
              key={cat.id}
              onClick={() => {
                playClick();
                onSelectCategory(cat.id);
              }}
              className={`relative text-left px-3.5 py-3 md:py-3.5 text-xs md:text-sm font-bold tracking-wider transition-all duration-150 flex items-center justify-between border-b border-neutral-200/70 cursor-pointer ${
                isActive
                  ? 'bg-[#b31412] text-white shadow-sm'
                  : 'text-neutral-700 hover:bg-neutral-200/60 active:bg-neutral-200'
              }`}
            >
              <span className="truncate pr-1 uppercase">{cat.name}</span>

              {isActive ? (
                <ChevronRight className="w-4 h-4 text-white flex-shrink-0 animate-in slide-in-from-left-1 duration-150" />
              ) : count !== undefined && count > 0 ? (
                <span className="text-[10px] text-neutral-400 font-medium">
                  {count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
