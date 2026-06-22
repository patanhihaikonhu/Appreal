import React, { useState, useRef } from "react";
import { Upload, Sparkles, Image as ImageIcon, Wand2, AlertCircle, RefreshCw, Layers } from "lucide-react";
import { ARTWORK_PRESETS } from "../constants";
import { PlacedDesign } from "../types";

interface DesignHubProps {
  activeDesign: PlacedDesign | null;
  onSelectDesign: (src: string, name: string) => void;
  onUpdateDesign: (updated: Partial<PlacedDesign>) => void;
}

export default function DesignHub({
  activeDesign,
  onSelectDesign,
  onUpdateDesign,
}: DesignHubProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "ai-generate" | "ai-edit" | "presets">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for AI Design Generation
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [stylePreset, setStylePreset] = useState("logo");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // State for AI Design Editing
  const [editPrompt, setEditPrompt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Local file upload drag and drop state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Base64 helper converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        onSelectDesign(event.target.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = () => {
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // call server-side Imagen API
  const handleGenerateDesign = async () => {
    if (!generatePrompt.trim()) return;
    setIsGenerating(true);
    setGenError(null);

    try {
      const response = await fetch("/api/generate-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: generatePrompt,
          aspectRatio,
          stylePreset,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to contact design endpoint");
      }

      onSelectDesign(data.imageUrl, `AI_${stylePreset}_${generatePrompt.substring(0, 15).replace(/\s+/g, "_")}.png`);
      setActiveTab("ai-edit"); // direct user to edit tab for easy iteration
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || "Something went wrong during design generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // call server-side Gemini Edit API
  const handleEditDesign = async () => {
    if (!activeDesign || !editPrompt.trim()) return;
    setIsEditing(true);
    setEditError(null);

    try {
      const response = await fetch("/api/edit-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: activeDesign.src,
          editPrompt: editPrompt,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to modify graphic design file");
      }

      // Update source on canvas, keep size settings intact for convenience!
      onUpdateDesign({ src: data.imageUrl, name: `AI_Edit_${activeDesign.name}` });
      setEditPrompt(""); // Reset edit input
    } catch (err: any) {
      console.error(err);
      setEditError(err.message || "Failed to edit image contents with Gemini.");
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Tabs navigation list */}
      <div className="flex border-b border-white/10 bg-slate-900/45">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-xs font-bold select-none border-b-2 transition-all ${
            activeTab === "upload"
              ? "border-indigo-500 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Logo
        </button>
        <button
          onClick={() => setActiveTab("ai-generate")}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-xs font-bold select-none border-b-2 transition-all ${
            activeTab === "ai-generate"
              ? "border-indigo-500 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          AI Gen
        </button>
        <button
          onClick={() => setActiveTab("ai-edit")}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-xs font-bold select-none border-b-2 transition-all ${
            activeTab === "ai-edit"
              ? "border-indigo-500 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-violet-400" />
          AI Edit
        </button>
        <button
          onClick={() => setActiveTab("presets")}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-3 text-xs font-bold select-none border-b-2 transition-all ${
            activeTab === "presets"
              ? "border-indigo-500 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Presets
        </button>
      </div>

      <div className="p-4">
        {/* TAB 1: FILE UPLOAD */}
        {activeTab === "upload" && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
              isDraggingFile
                ? "border-indigo-400 bg-indigo-500/10"
                : "border-white/10 bg-white/5 hover:border-slate-500 hover:bg-white/10"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-slate-900/60 border border-white/10 flex items-center justify-center text-slate-300 mb-2.5">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-200">
              {isDraggingFile ? "Drop file to upload" : "Drag & Drop your logo image here"}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">
              Supports Transparent PNG, JPG, or SVG (Max 10MB)
            </p>
          </div>
        )}

        {/* TAB 2: AI GENERATOR */}
        {activeTab === "ai-generate" && (
          <div className="flex flex-col gap-3 font-sans">
            <div>
              <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                Prompt Description
              </label>
              <textarea
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                rows={2}
                placeholder="e.g., A minimalist geometric circular badge of a howling wolf on top of a cliff, vector art, retro colors"
                className="w-full text-xs p-2.5 rounded-lg border border-white/10 bg-slate-950/60 text-white outline-none focus:border-indigo-400 placeholder:text-slate-600 font-sans resize-none leading-relaxed transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                  artwork style
                </label>
                <select
                  value={stylePreset}
                  onChange={(e) => setStylePreset(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/10 bg-slate-950/80 text-white outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="logo" className="bg-slate-950">Flat Vector Logo</option>
                  <option value="artwork" className="bg-slate-950">T-Shirt Graphic</option>
                  <option value="pattern" className="bg-slate-950">Seamless Pattern</option>
                  <option value="none" className="bg-slate-950">Raw Description (Custom)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1.5">
                  Aspect Ratio
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-white/10 bg-slate-950/80 text-white outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="1:1" className="bg-slate-950">Standard 1:1 (Square)</option>
                  <option value="4:3" className="bg-slate-950">Card 4:3</option>
                  <option value="3:4" className="bg-slate-950">Portrait 3:4</option>
                  <option value="16:9" className="bg-slate-950">Wide 16:9</option>
                </select>
              </div>
            </div>

            {genError && (
              <div className="flex items-start gap-2 bg-red-500/10 text-red-300 text-xs p-2.5 rounded-lg border border-red-500/20">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{genError}</span>
              </div>
            )}

            <button
              onClick={handleGenerateDesign}
              disabled={isGenerating || !generatePrompt.trim()}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/20 cursor-pointer select-none"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Design in Studio...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Print Pattern
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 3: AI EDITOR */}
        {activeTab === "ai-edit" && (
          <div className="flex flex-col gap-3">
            {activeDesign ? (
              <div className="flex flex-col gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                {/* Active logo indicator */}
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded border border-white/10 bg-slate-900 p-1 overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={activeDesign.src} alt="Active" className="max-w-full max-h-full object-contain" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-widest">Active Canvas Graphic</p>
                    <p className="text-xs text-slate-300 truncate font-mono font-medium">{activeDesign.name}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5">
                    Describe Modifications & Adjustments
                  </label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    rows={2}
                    placeholder="e.g., Change the orange background to deep royal blue, and make the details look glossy gold"
                    className="w-full text-xs p-2.5 rounded-lg border border-white/10 bg-slate-950/60 text-white outline-none focus:border-indigo-400 placeholder:text-slate-600 resize-none leading-relaxed"
                  />
                  <p className="text-[9px] text-slate-400 mt-1 italic">
                    Gemini analyzes the details & adjusts the artwork dynamically using AI inpainting.
                  </p>
                </div>

                {editError && (
                  <div className="flex items-start gap-2 bg-red-500/10 text-red-300 text-xs p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{editError}</span>
                  </div>
                )}

                <button
                  onClick={handleEditDesign}
                  disabled={isEditing || !editPrompt.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer select-none"
                >
                  {isEditing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Inpainting via Gemini 2.5 Flash...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      Apply AI Adjustments
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1.5 stroke-1 text-indigo-400" />
                <p className="text-xs">Please upload a logo or select a preset first before applying AI edits.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PRESETS */}
        {activeTab === "presets" && (
          <div className="flex flex-col gap-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Quick Select Sample Prints
            </p>
            <div className="grid grid-cols-2 gap-2">
              {ARTWORK_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onSelectDesign(preset.url, `${preset.name.replace(/\s+/g, "_")}.png`)}
                  className={`flex flex-col items-start text-left bg-white/5 border border-white/5 hover:border-indigo-400 rounded-lg overflow-hidden group transition-all cursor-pointer`}
                >
                  <div className="w-full aspect-square bg-[#0f1224] relative overflow-hidden flex items-center justify-center p-1 border-b border-white/5">
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-1.5">
                    <p className="text-[10px] font-semibold text-slate-300 line-clamp-1">{preset.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helpful Hint HUD overlay */}
      {activeDesign && (
        <div className="bg-slate-950/60 border-t border-white/5 flex items-center justify-between px-4 py-2.5">
          <span className="text-[10px] text-slate-400 italic truncate max-w-[70%]">
            Active Art: {activeDesign.name}
          </span>
          <button
            onClick={() => onSelectDesign("", "")}
            className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
          >
            Clear Art
          </button>
        </div>
      )}
    </div>
  );
}
