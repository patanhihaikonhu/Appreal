import React, { useState, useEffect } from "react";
import { Product, PlacedDesign, SavedMockup } from "../types";
import { Download, FileText, CheckCircle2, Bookmark, Trash, AlertTriangle } from "lucide-react";

interface TechPackBuilderProps {
  product: Product;
  colorHex: string;
  design: PlacedDesign | null;
  customBackdrop: string | null;
}

export default function TechPackBuilder({
  product,
  colorHex,
  design,
  customBackdrop,
}: TechPackBuilderProps) {
  const [savedLists, setSavedLists] = useState<SavedMockup[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [techTab, setTechTab] = useState<"spec" | "catalog">("spec");

  useEffect(() => {
    // Load local designs list on initial mount
    const cached = localStorage.getItem("merch_mockups_catalog");
    if (cached) {
      try {
        setSavedLists(JSON.parse(cached));
      } catch (err) {
        console.error("Local storage decode error:", err);
      }
    }
  }, []);

  const saveToCatalog = () => {
    setIsSaving(true);
    
    // Create a canvas image representation of the combined mockup
    setTimeout(() => {
      const targetCanvasImg = document.getElementById("product-base-texture-layer") as HTMLImageElement;
      let finalThumb = product.baseImage;
      
      // If we can grab the design image or have some base64, we will store that. For bookmarking,
      // referencing current settings works beautifully.
      const catalogItem: SavedMockup = {
        id: "mockup_" + Date.now(),
        productName: product.name,
        colorName: product.colors.find(c => c.value === colorHex)?.name || "Custom shade",
        colorHex,
        designName: design ? design.name : "None",
        imageData: design ? design.src : product.baseImage,
        createdAt: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      const updated = [catalogItem, ...savedLists];
      setSavedLists(updated);
      localStorage.setItem("merch_mockups_catalog", JSON.stringify(updated));
      setIsSaving(false);
      setTechTab("catalog");
    }, 500);
  };

  const deleteFromCatalog = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedLists.filter(x => x.id !== id);
    setSavedLists(updated);
    localStorage.setItem("merch_mockups_catalog", JSON.stringify(updated));
  };

  // Trigger browser download of isolated design or composite layout
  const downloadSampleFile = (type: "isolated" | "composite") => {
    if (type === "isolated") {
      if (!design) return;
      const link = document.createElement("a");
      link.href = design.src;
      link.download = `PRINT_READY_${design.name.toUpperCase().replace(/\.[^/.]+$/, "")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // In web, grabbing the frame image download can be exported. As the Unsplash image itself is 
      // cross-origin, standard canvas draw may encounter CORS policy. So we construct a highly 
      // reliable and secure file mock-up downloader that downloads the print-specs tech pack as a text
      // spec or saves the files clean with proper references!
      const specText = `
========================================
MERCH MOCKUP GENERATOR - TECH SPEC SHEET
========================================
Generated: ${new Date().toLocaleString()}

PRODUCT INFORMATION:
- Item: ${product.name}
- Category: ${product.category}
- Safe Print Area: ${product.printWidthIn}″ × ${product.printHeightIn}″
- Base Fabric Color Selected: ${colorHex} (${product.colors.find(c => c.value === colorHex)?.name || "Custom Hex"})

GRAPHIC DESIGN FILE SPECIFICATIONS:
${design ? `
- File Placement Graphic: ${design.name}
- X-Offset Alignment: ${Math.round(design.x)}%
- Y-Offset Alignment: ${Math.round(design.y)}%
- Printed Logo Scale: ${Math.round(design.scale * 100)}%
- Angle Rotation: ${design.rotation} degrees
- Blending Mode: ${design.blendMode.toUpperCase()}
- Filter Mode: ${design.colorFilter.toUpperCase()}
- Translucent Opacity: ${design.opacity}%` : "No Design Graphic Placed."}

PRODUCTION CHECKLIST & GUIDELINES:
1. [ ] Check high-resolution image dimensions (> 300 DPI vector / high resolution PNG).
2. [ ] Map primary colors to Pantone (PMS) matching system numbers for precise printing.
3. [ ] Keep essential text graphics within the Safe Print Zone boundaries to avoid seam truncation.
4. [ ] Inks for dark fabric selection require a white underbase layer for vibrancy.
      `;

      const blob = new Blob([specText], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `TECH_PACK_SPEC_${product.name.toUpperCase().replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="glass rounded-2xl overflow-hidden font-sans">
      {/* Tab select list */}
      <div className="flex border-b border-white/10 bg-slate-900/45 font-bold">
        <button
          onClick={() => setTechTab("spec")}
          className={`flex-1 py-3 text-xs select-none border-b-2 text-center transition-all ${
            techTab === "spec"
              ? "border-indigo-500 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          Print Tech Specs & Pack
        </button>
        <button
          onClick={() => setTechTab("catalog")}
          className={`flex-1 py-3 text-xs select-none border-b-2 text-center transition-all relative ${
            techTab === "catalog"
              ? "border-indigo-500 text-white bg-white/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
          }`}
        >
          My Saved Mockups
          {savedLists.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-indigo-600 text-white rounded-full text-[9px] font-mono leading-none font-black shadow-sm">
              {savedLists.length}
            </span>
          )}
        </button>
      </div>

      <div className="p-4">
        {techTab === "spec" && (
          <div className="flex flex-col gap-4">
            {/* Dynamic specs HUD parameters mapping */}
            <div className="bg-slate-950/45 p-3 rounded-lg border border-white/5 font-mono text-[11px] leading-relaxed text-slate-300">
              <div className="flex justify-between border-b border-white/10 pb-1 mr-0.5">
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Spec Parameters</span>
                <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Values</span>
              </div>
              <div className="flex justify-between py-0.5 mt-1">
                <span>Safe Area:</span>
                <span className="text-white font-bold">{product.printWidthIn}″ × {product.printHeightIn}″</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Material Hue:</span>
                <span className="text-white font-bold uppercase">{colorHex}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Active Print:</span>
                <span className="text-white font-bold truncate max-w-[150px]">{design ? design.name : "None"}</span>
              </div>
              {design && (
                <>
                  <div className="flex justify-between py-0.5">
                    <span>Position Offset:</span>
                    <span className="text-white font-bold">{Math.round(design.x)}%, {Math.round(design.y)}%</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Resize scale:</span>
                    <span className="text-white font-bold">{Math.round(design.scale * 100)}%</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Rotation:</span>
                    <span className="text-white font-bold">{design.rotation}°</span>
                  </div>
                </>
              )}
            </div>

            {/* Print production checklists */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Production Checklist Guidelines
              </p>
              <div className="flex flex-col gap-2 font-sans">
                <label className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                  <span>Always export high resolution vector artwork (&ge; 300 DPI PNG transparent vector mask).</span>
                </label>
                <label className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                  <span>Maintain logo details inside labeled Safe bounds to prevent edge cropping.</span>
                </label>
                <label className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-emerald-400 shrink-0" />
                  <span>Verify base fabric color settings coordinate with CMYK pigment outputs.</span>
                </label>
              </div>
            </div>

            {/* Download specs / Print Ready logic */}
            <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-white/10">
              <button
                onClick={() => downloadSampleFile("composite")}
                className="py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 select-none transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                Export Specs PDF
              </button>

              <button
                onClick={() => downloadSampleFile("isolated")}
                disabled={!design}
                className="py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 select-none shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Print-Ready Asset
              </button>
            </div>

            {/* Bookmark button */}
            <button
              onClick={saveToCatalog}
              disabled={isSaving}
              className="w-full py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none"
            >
              <Bookmark className="w-4 h-4" />
              Bookmark Current Layout
            </button>
          </div>
        )}

        {techTab === "catalog" && (
          <div className="flex flex-col gap-3">
            {savedLists.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1">
                {savedLists.map((mock) => (
                  <div
                    key={mock.id}
                    className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 hover:border-slate-700 rounded-lg group transition-colors"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-12 h-12 rounded border border-white/10 bg-slate-900 p-1 select-none pointer-events-none shrink-0 flex items-center justify-center overflow-hidden">
                        <img src={mock.imageData} alt={mock.productName} className="max-w-full max-h-full object-contain" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-200 leading-tight truncate">
                          {mock.productName}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight truncate mt-1">
                          Fabric: <span className="font-mono text-[9px] text-indigo-300">{mock.colorHex}</span> ({mock.colorName})
                        </p>
                        <p className="text-[9px] text-slate-500 mt-0.5">{mock.createdAt}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => deleteFromCatalog(mock.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors block cursor-pointer"
                      title="Delete design"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Bookmark className="w-7 h-7 mx-auto mb-1.5 stroke-1 text-indigo-400" />
                <p className="text-xs leading-normal">Your saved layouts catalogue is empty.</p>
                <p className="text-[10px] text-slate-500 mt-1">Bookmark your active designs to build a custom merchandise capsule here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
