import React, { useState } from "react";
import { Product, PlacedDesign } from "../types";
import { BACKDROP_PRESETS } from "../constants";
import { Sliders, Compass, Sparkles, RefreshCw, AlertCircle, Palette } from "lucide-react";

interface ControlPanelProps {
  product: Product;
  colorHex: string;
  onChangeColor: (hex: string) => void;
  design: PlacedDesign | null;
  onUpdateDesign: (updated: Partial<PlacedDesign>) => void;
  onBackdropGenerated: (imageUrl: string | null) => void;
  currentBackdrop: string | null;
}

export default function ControlPanel({
  product,
  colorHex,
  onChangeColor,
  design,
  onUpdateDesign,
  onBackdropGenerated,
  currentBackdrop,
}: ControlPanelProps) {
  // AI Scene backdrop generator state
  const [backdropPrompt, setBackdropPrompt] = useState("");
  const [isGeneratingBackdrop, setIsGeneratingBackdrop] = useState(false);
  const [backdropError, setBackdropError] = useState<string | null>(null);

  // Trigger server-side backdrop creator
  const handleGenerateBackdrop = async (promptValue: string) => {
    if (!promptValue.trim()) return;
    setIsGeneratingBackdrop(true);
    setBackdropError(null);

    try {
      const response = await fetch("/api/generate-backdrop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptValue,
          productContext: product.name,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate scene mockup background.");
      }

      onBackdropGenerated(data.imageUrl);
      setBackdropPrompt(""); // Reset field on success
    } catch (err: any) {
      console.error(err);
      setBackdropError(err.message || "Failed to make custom AI background.");
    } finally {
      setIsGeneratingBackdrop(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* SECTION 1: COLOR SWATCH REGION */}
      <div className="glass rounded-2xl p-4 font-sans">
        <h3 className="text-xs font-bold font-sans text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          Product Material Hue
        </h3>

        {/* Dynamic swatches list */}
        <div className="flex flex-wrap gap-2 mb-3">
          {product.colors.map((clr) => (
            <button
              key={clr.name}
              onClick={() => onChangeColor(clr.value)}
              title={clr.name}
              className={`w-7 h-7 rounded-full border relative focus:outline-hidden transition-all shadow-xs cursor-pointer ${
                colorHex.toLowerCase() === clr.value.toLowerCase()
                  ? "ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 border-white"
                  : "border-white/20 hover:scale-110"
              }`}
              style={{ backgroundColor: clr.value }}
            >
              {clr.value.toLowerCase() === "#ffffff" && (
                <div className="absolute inset-0 bg-white/20 rounded-full pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Custom hex color selector */}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorHex}
            onChange={(e) => onChangeColor(e.target.value)}
            className="w-10 h-8 px-0 bg-transparent border border-white/10 rounded cursor-pointer shrink-0"
          />
          <input
            type="text"
            value={colorHex}
            onChange={(e) => onChangeColor(e.target.value)}
            placeholder="#FFFFFF"
            className="w-full text-xs p-2 bg-slate-950/60 border border-white/10 text-white rounded select-all font-mono font-medium outline-none uppercase focus:border-indigo-400"
          />
        </div>
      </div>

      {/* SECTION 2: GRAPHIC POSITIONING TOOLS (Conditioned on design existence) */}
      {design ? (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-3.5 flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Sliders className="w-3.5 h-3.5 text-indigo-400" />
            Placement Controls
          </h3>

          <div className="flex flex-col gap-3 font-sans">
            {/* SCALE SLIDER */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Design Size Scale</span>
                <span className="font-mono text-indigo-300 font-bold">{Math.round(design.scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={design.scale}
                onChange={(e) => onUpdateDesign({ scale: parseFloat(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* ROTATION SLIDER */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Rotation Angle</span>
                <span className="font-mono text-indigo-300 font-bold">{design.rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={design.rotation}
                onChange={(e) => onUpdateDesign({ rotation: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* OPACITY SLIDER */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Print Opacity (Solidness)</span>
                <span className="font-mono text-indigo-300 font-bold">{design.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={design.opacity}
                onChange={(e) => onUpdateDesign({ opacity: parseInt(e.target.value) })}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* OFFSET TRANSLATION REGION */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block">X-Offset</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="-80"
                    max="80"
                    value={Math.round(design.x)}
                    onChange={(e) => onUpdateDesign({ x: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-1.5 bg-slate-950/60 border border-white/10 text-white rounded outline-none text-center font-mono focus:border-indigo-400"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 block">Y-Offset</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="-80"
                    max="80"
                    value={Math.round(design.y)}
                    onChange={(e) => onUpdateDesign({ y: parseInt(e.target.value) || 0 })}
                    className="w-full text-xs p-1.5 bg-slate-950/60 border border-white/10 text-white rounded outline-none text-center font-mono focus:border-indigo-400"
                  />
                  <span className="text-xs text-slate-400">%</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-2.5 border-t border-white/10 pt-2.5">
              {/* BLEND MODE SELECTOR */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Blend Shader
                </label>
                <select
                  value={design.blendMode}
                  onChange={(e) => onUpdateDesign({ blendMode: e.target.value as any })}
                  className="w-full text-xs p-1.5 bg-slate-950/80 border border-white/10 text-white rounded outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="normal" className="bg-slate-950">Ink Stain (Normal)</option>
                  <option value="multiply" className="bg-slate-950">Multiply (Shadows)</option>
                  <option value="screen" className="bg-slate-950">Screen (Soft White)</option>
                  <option value="overlay" className="bg-slate-950">Fabric Overlay</option>
                </select>
              </div>

              {/* COLOR FILTER OVERLAYS */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Material Filter
                </label>
                <select
                  value={design.colorFilter}
                  onChange={(e) => onUpdateDesign({ colorFilter: e.target.value as any })}
                  className="w-full text-xs p-1.5 bg-slate-950/80 border border-white/10 text-white rounded outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="none" className="bg-slate-950">Original Colors</option>
                  <option value="grayscale" className="bg-slate-950">Single Grayscale</option>
                  <option value="sepia" className="bg-slate-950">Warm Sepia Tone</option>
                  <option value="invert" className="bg-slate-950">Inverted Mono</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => onUpdateDesign({ x: 0, y: 0, scale: 0.8, rotation: 0, opacity: 100, blendMode: "normal", colorFilter: "none" })}
              className="w-full text-center text-[10px] text-amber-300 hover:text-amber-200 transition-colors uppercase font-bold tracking-widest pt-2 mt-1 border-t border-dashed border-white/10 cursor-pointer"
            >
              Reset Graphic Placement
            </button>
          </div>
        </div>
      ) : null}

      {/* SECTION 3: AI LIFESTYLE BACKGROUND CREATOR */}
      <div className="glass rounded-2xl p-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-2 flex items-center gap-1.5 pb-1.5 border-b border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          AI Mockup Scene Creator
        </h3>

        <p className="text-[10px] text-slate-400 mb-2.5 leading-relaxed font-sans">
          Use Gemini to generate a stylized presentation background. Place your product in a real commercial studio scene dynamically.
        </p>

        <div className="flex flex-col gap-2.5 font-sans">
          {/* Preset drop-scene options */}
          <div>
            <select
              onChange={(e) => {
                const opt = BACKDROP_PRESETS.find(p => p.prompt === e.target.value || p.name === e.target.value);
                if (opt && opt.prompt) {
                  handleGenerateBackdrop(opt.prompt);
                } else {
                  onBackdropGenerated(null); // Clear custom backdrop
                }
              }}
              className="w-full text-xs p-2 bg-slate-950/80 border border-white/10 text-white rounded-lg outline-none cursor-pointer focus:border-indigo-400"
            >
              {BACKDROP_PRESETS.map((p) => (
                <option key={p.name} value={p.prompt || p.name} className="bg-slate-950">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              value={backdropPrompt}
              onChange={(e) => setBackdropPrompt(e.target.value)}
              placeholder="Or custom: sitting on real-life wood..."
              className="w-full text-xs p-2.5 bg-slate-950/60 border border-white/10 text-white rounded-lg outline-none pr-12 focus:border-indigo-400 placeholder:text-slate-600"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleGenerateBackdrop(backdropPrompt);
                }
              }}
            />
            <button
              onClick={() => handleGenerateBackdrop(backdropPrompt)}
              disabled={isGeneratingBackdrop || !backdropPrompt.trim()}
              className="absolute right-1 top-1 h-8 px-3 bg-indigo-600 text-white text-[10px] rounded hover:bg-indigo-500 font-bold select-none disabled:opacity-30 flex items-center justify-center cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              {isGeneratingBackdrop ? (
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              ) : (
                "Go"
              )}
            </button>
          </div>

          {backdropError && (
            <div className="flex items-start gap-1.5 bg-red-500/10 text-red-300 text-[10px] p-2 rounded-lg border border-red-500/20">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.2" />
              <span>{backdropError}</span>
            </div>
          )}

          {currentBackdrop && (
            <button
              onClick={() => onBackdropGenerated(null)}
              className="w-full text-left text-[9px] text-rose-400 hover:text-rose-300 font-extrabold uppercase tracking-widest cursor-pointer select-none"
            >
              Clear Custom AI Background Studio
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
