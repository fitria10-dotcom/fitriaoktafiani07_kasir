import React, { useState } from 'react';
import { CategoryId } from '../types/pos';
import { Coffee, Utensils, IceCream, Flame, Soup, Apple, Sparkles, Cherry } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  category: CategoryId;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  className = 'w-full h-full object-cover',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Category based theme colors for fallback
  const getCategoryTheme = () => {
    switch (category) {
      case 'MINUMAN':
      case 'VARIASI ES':
        return {
          bg: 'from-amber-500 via-orange-600 to-red-700',
          icon: <Coffee className="w-8 h-8 text-white/90" />,
        };
      case 'DESSERT':
        return {
          bg: 'from-pink-500 via-rose-600 to-red-700',
          icon: <IceCream className="w-8 h-8 text-white/90" />,
        };
      case 'KUAH':
        return {
          bg: 'from-yellow-600 via-amber-700 to-orange-800',
          icon: <Soup className="w-8 h-8 text-white/90" />,
        };
      case 'MENU AYAM':
      case 'MAKANAN':
        return {
          bg: 'from-red-600 via-rose-700 to-amber-800',
          icon: <Utensils className="w-8 h-8 text-white/90" />,
        };
      case 'JUS':
        return {
          bg: 'from-emerald-600 via-teal-700 to-green-800',
          icon: <Apple className="w-8 h-8 text-white/90" />,
        };
      case 'SNACK':
        return {
          bg: 'from-amber-600 via-orange-700 to-red-800',
          icon: <Sparkles className="w-8 h-8 text-white/90" />,
        };
      default:
        return {
          bg: 'from-slate-700 via-zinc-800 to-neutral-900',
          icon: <Cherry className="w-8 h-8 text-white/90" />,
        };
    }
  };

  const theme = getCategoryTheme();

  if (hasError || !src) {
    return (
      <div
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${theme.bg} overflow-hidden select-none ${className}`}
      >
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        <div className="relative z-10 flex flex-col items-center text-center p-2">
          <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md shadow-inner mb-1.5 border border-white/20">
            {theme.icon}
          </div>
          <span className="text-white font-bold text-xs line-clamp-1 drop-shadow-sm px-1">
            {alt}
          </span>
          <span className="text-[10px] text-white/75 uppercase tracking-wider font-semibold">
            {category}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-neutral-800 ${className}`}>
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${theme.bg} animate-pulse flex items-center justify-center`}
        >
          {theme.icon}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
