import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import MockupCanvas from "./components/MockupCanvas";
import DesignHub from "./components/DesignHub";
import ControlPanel from "./components/ControlPanel";
import TechPackBuilder from "./components/TechPackBuilder";
import { PRODUCTS } from "./constants";
import { PlacedDesign } from "./types";
import { Sparkles, Shirt, Layers, HelpCircle, ToggleLeft, ToggleRight, Info } from "lucide-react";

export default function App() {
  // State for active chosen product base
  const [selectedProductId, setSelectedProductId] = useState<string>("classic-tshirt");
  
  // Find current product configuration
  const activeProduct = PRODUCTS.find((p) => p.id === selectedProductId) || PRODUCTS[0];

  // State for base fabric color (synchronized on product load)
  const [selectedColorHex, setSelectedColorHex] = useState<string>(activeProduct.defaultColor);

  // State for placed print graphic (starts as null so helpful empty guidance displays)
  const [placedDesign, setPlacedDesign] = useState<PlacedDesign | null>(null);

  // State for custom active backdrop generated using Imagen scene builder
  const [customBackdrop, setCustomBackdrop] = useState<string | null>(null);

  // Boolean flag to show or hide the dashed boundary printable zone guidelines
  const [showPrintZones, setShowPrintZones] = useState<boolean>(true);

  // Selector callback for Sidebar product base updates
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    const targetProduct = PRODUCTS.find((p) => p.id === productId);
    if (targetProduct) {
      setSelectedColorHex(targetProduct.defaultColor);
    }
  };

  // Selector callback for loading new designs
  const handleSelectDesign = (src: string, name: string) => {
    if (!src) {
      setPlacedDesign(null);
    } else {
      setPlacedDesign({
        src,
        name,
        x: 0,
        y: 0,
        scale: 0.8, // defaults to comfortable fit
        rotation: 0,
        opacity: 100,
        blendMode: "normal",
        colorFilter: "none",
      });
    }
  };

  // Modifier callback for position coordinates or image overrides of design
  const handleUpdateDesign = (updated: Partial<PlacedDesign>) => {
    if (placedDesign) {
      setPlacedDesign({ ...placedDesign, ...updated });
    }
  };

  return (
    <div className="min-h-screen mesh-bg text-slate-100 flex flex-col antialiased relative overflow-x-hidden">
      {/* Mesh space aesthetic floating subtle stars / grid backdrop overlays */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

      {/* Dynamic Header Banner with Glass styling */}
      <header className="sticky top-0 z-30 glass-header px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 font-black">
            M
          </div>
          <div>
            <h1 className="text-sm font-black font-sans tracking-tight text-white flex items-center gap-1.5 uppercase">
              Merch.AI Studio
              <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded px-1.5 py-0.5 normal-case tracking-normal border border-indigo-500/30">
                PRO AI-Powered
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              High-fidelity interactive customization with server-side Gemini inpainting and background scenes.
            </p>
          </div>
        </div>

        {/* Header HUD Settings toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowPrintZones(!showPrintZones)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 select-none cursor-pointer transition-all"
          >
            {showPrintZones ? (
              <>
                <ToggleRight className="w-4 h-4 text-indigo-400" />
                Hide Guides
              </>
            ) : (
              <>
                <ToggleLeft className="w-4 h-4 text-slate-400" />
                Show Guides
              </>
            )}
          </button>

          <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            STUDIO ENGINE ACTIVE
          </span>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start relative z-10">
        
        {/* LEFT COLUMN: Sidebar (Base Products selector) + AI Design Creator (DesignHub) */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Base merchandise chooser */}
          <Sidebar
            selectedProductId={selectedProductId}
            onSelectProduct={handleSelectProduct}
          />

          {/* AI artwork loaders & Uploaders */}
          <DesignHub
            activeDesign={placedDesign}
            onSelectDesign={handleSelectDesign}
            onUpdateDesign={handleUpdateDesign}
          />
        </div>

        {/* WORKSPACE CENTER COLUMN: Realistic Interactive canvas */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Main Workspace Frame Card with Frosted Glass Container wrapper */}
          <div className="glass rounded-2xl p-4 shadow-xl flex flex-col gap-4.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse shadow-xs shadow-indigo-500" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">
                  Interactive Studio Canvas Preview
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-white/10 text-slate-300 rounded border border-white/5">
                Scale/Drag Allowed
              </span>
            </div>

            {/* Interactive Canvas Rendering */}
            <MockupCanvas
              product={activeProduct}
              colorHex={selectedColorHex}
              design={placedDesign}
              customBackdrop={customBackdrop}
              onUpdateDesign={handleUpdateDesign}
              showPrintZones={showPrintZones}
            />

            {/* Micro Help/Tutorial Box in Frosted overlay */}
            <div className="flex items-start gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5 text-[11px] text-slate-300 leading-relaxed font-sans">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <p className="font-bold text-slate-200">Quick Guide:</p>
                <p>
                  1. Choose a merch item from the left. 2. Select / AI-generate a design. 3. Click and Drag directly over the canvas to position, or use the sliders on the right. 4. Generate custom AI scenes and export spec sheets.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Position Fine-tuning Sliders & Export specifications (Tech Pack) */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Base material hue selector + Sliders */}
          <ControlPanel
            product={activeProduct}
            colorHex={selectedColorHex}
            onChangeColor={setSelectedColorHex}
            design={placedDesign}
            onUpdateDesign={handleUpdateDesign}
            onBackdropGenerated={setCustomBackdrop}
            currentBackdrop={customBackdrop}
          />

          {/* Export printing Tech Pack + Local storage collection catalogue */}
          <TechPackBuilder
            product={activeProduct}
            colorHex={selectedColorHex}
            design={placedDesign}
            customBackdrop={customBackdrop}
          />
        </div>

      </main>

      {/* Aesthetic Footer with Glass accents */}
      <footer className="glass-header py-5 text-center mt-auto border-t">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          Merch Mockup Studio &copy; {new Date().getFullYear()} — Designed with Gemini AI Integration
        </p>
      </footer>
    </div>
  );
}
