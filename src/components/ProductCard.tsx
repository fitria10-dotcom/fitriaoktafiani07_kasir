import React from 'react';
import { Product } from '../types/pos';
import { ProductImage } from './ProductImage';
import { formatRupiahComma } from '../utils/formatters';
import { playBeep } from '../utils/audio';

interface ProductCardProps {
  product: Product;
  branchId: string;
  cartQuantity?: number;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  branchId,
  cartQuantity = 0,
  onAddToCart,
}) => {
  const stock = product.stockByBranch[branchId] ?? 0;
  const isOutOfStock = stock <= 0 || !product.isAvailable;
  const isLowStock = stock > 0 && stock <= product.minStock;

  const handleClick = () => {
    if (isOutOfStock) return;
    playBeep();
    onAddToCart(product);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-neutral-200/60 select-none transition-all duration-150 ${
        isOutOfStock
          ? 'opacity-50 cursor-not-allowed filter grayscale'
          : 'cursor-pointer hover:shadow-lg hover:border-red-400 active:scale-[0.97]'
      }`}
    >
      {/* Product Image */}
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        category={product.category}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {/* Cart quantity badge */}
      {cartQuantity > 0 && (
        <div className="absolute top-2 right-2 bg-[#b31412] text-white text-xs font-extrabold w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in-75 duration-150 z-20">
          {cartQuantity}
        </div>
      )}

      {/* Stock warning pill top left */}
      {isLowStock && (
        <div className="absolute top-2 left-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow z-20">
          Sisa {stock}
        </div>
      )}

      {isOutOfStock && (
        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow z-20">
          Habis
        </div>
      )}

      {/* Bottom Gradient Overlay for typography (exact look as photo) */}
      <div className="absolute inset-x-0 bottom-0 pt-10 pb-2.5 px-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end text-white z-10">
        <h4 className="font-bold text-xs md:text-sm leading-tight text-white drop-shadow-md line-clamp-1">
          {product.name}
        </h4>
        <div className="flex items-center justify-between mt-0.5">
          <span className="font-extrabold text-xs md:text-sm text-white/95 tracking-wide drop-shadow-sm font-mono">
            {formatRupiahComma(product.price)}
          </span>
          <span className="text-[10px] text-white/70 hidden sm:inline">
            {product.code}
          </span>
        </div>
      </div>
    </div>
  );
};
