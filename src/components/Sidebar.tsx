import React, { useState } from "react";
import { Product } from "../types";
import { PRODUCTS } from "../constants";
import { Layers, ShoppingBag, Eye, Shirt, Sparkles } from "lucide-react";

interface SidebarProps {
  selectedProductId: string;
  onSelectProduct: (productId: string) => void;
}

type CategoryFilter = "All" | "Apparel" | "Accessories" | "Living";

export default function Sidebar({
  selectedProductId,
  onSelectProduct,
}: SidebarProps) {
  const [filter, setFilter] = useState<CategoryFilter>("All");

  const filteredProducts = PRODUCTS.filter((item) => {
    if (filter === "All") return true;
    return item.category === filter;
  });

  return (
    <div className="glass rounded-2xl p-4 flex flex-col h-full font-sans">
      {/* Category controls list */}
      <div className="mb-4">
        <h3 className="text-xs font-bold font-sans text-slate-300 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <Shirt className="w-4 h-4 text-indigo-400" />
          Choose Merchandise Category
        </h3>
        <div className="flex flex-wrap gap-1.5 pb-2.5 border-b border-white/10">
          {(["All", "Apparel", "Accessories", "Living"] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-full select-none cursor-pointer transition-all ${
                filter === cat
                  ? "bg-indigo-600 border border-indigo-500 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of merchandise selection boards */}
      <div className="flex-1 overflow-y-auto max-h-[450px] pr-1 flex flex-col gap-2.5">
        {filteredProducts.map((prod) => {
          const isSelected = prod.id === selectedProductId;
          return (
            <button
              key={prod.id}
              onClick={() => onSelectProduct(prod.id)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex gap-3.5 group cursor-pointer ${
                isSelected
                  ? "active-glass-card ring-1 ring-indigo-500/30"
                  : "border-white/5 bg-white/5 hover:bg-white/10 text-slate-300"
              }`}
            >
              {/* Product thumb representation */}
              <div className="w-16 h-16 rounded-lg bg-slate-900/50 backdrop-blur-sm overflow-hidden relative border border-white/10 p-1 shrink-0 flex items-center justify-center">
                <img
                  src={prod.baseImage}
                  alt={prod.name}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-1 right-1 bg-neutral-950/80 backdrop-blur-xs px-1 py-0.2 rounded-xs text-[8px] font-mono text-slate-300 font-bold border border-white/10 uppercase">
                  {prod.category}
                </span>
              </div>

              {/* Text descriptors */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-indigo-200">
                    {prod.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
                    {prod.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex gap-1">
                    {prod.colors.slice(0, 4).map((c) => (
                      <span
                        key={c.name}
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                    {prod.colors.length > 4 && (
                      <span className="text-[8px] font-mono font-bold text-slate-500 leading-none self-center">
                        +{prod.colors.length - 4}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 font-medium font-mono ml-auto">
                    {prod.printWidthIn}″×{prod.printHeightIn}″ print
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
