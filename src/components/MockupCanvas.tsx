import React, { useRef, useState, useEffect } from "react";
import { Product, PlacedDesign } from "../types";
import { Move, Layers, RefreshCw, ZoomIn } from "lucide-react";

interface MockupCanvasProps {
  product: Product;
  colorHex: string;
  design: PlacedDesign | null;
  customBackdrop: string | null;
  onUpdateDesign: (updated: Partial<PlacedDesign>) => void;
  showPrintZones: boolean;
}

export default function MockupCanvas({
  product,
  colorHex,
  design,
  customBackdrop,
  onUpdateDesign,
  showPrintZones,
}: MockupCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });

  // Handle Dragging within the Safe Print Zone
  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!design) return;
    
    // Prevent default scrolling for touch devices inside the canvas
    if (e.cancelable) {
      e.preventDefault();
    }
    
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDragStart({ x: clientX, y: clientY });
    setInitialPos({ x: design.x, y: design.y });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !design || !zoneRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      // Calculate translation in percentage based on zone dimensions
      const rect = zoneRef.current.getBoundingClientRect();
      const changeXPercent = (deltaX / rect.width) * 100;
      const changeYPercent = (deltaY / rect.height) * 100;

      // Bound shifts to stay within editable range safely (-100 to 100)
      const newX = Math.min(Math.max(initialPos.x + changeXPercent, -80), 80);
      const newY = Math.min(Math.max(initialPos.y + changeYPercent, -80), 80);

      onUpdateDesign({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove, { passive: false });
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragStart, initialPos, design, onUpdateDesign]);

  // CSS structure for applying color filter to base product image (multiply overlay strategy)
  // We use CSS relative stacking of high-density textures
  const filterStyle = () => {
    if (!design) return "";
    switch (design.colorFilter) {
      case "grayscale":
        return "grayscale(100%)";
      case "invert":
        return "invert(100%)";
      case "sepia":
        return "sepia(80%)";
      default:
        return "";
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Dynamic Product canvas container board */}
      <div
        id="mockup-frame-board"
        ref={containerRef}
        className="relative w-full aspect-square bg-[#ececed] rounded-2xl overflow-hidden shadow-sm border border-neutral-200/60 select-none group"
        style={{
          // Custom generated Backdrop if available from Gemini API
          backgroundImage: customBackdrop ? `url(${customBackdrop})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dynamic Color Multiplier Backdrop Wrapper */}
        <div
          className="absolute inset-0 transition-colors duration-300"
          style={{
            backgroundColor: colorHex,
            // If custom generated background is active, darken opacity to merge the custom shirt color blends properly
            mixBlendMode: "normal",
          }}
        >
          {/* Base Product Image with blend mode multiply to lock shading/depth layers */}
          <img
            id="product-base-texture-layer"
            src={product.baseImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover select-none pointer-events-none opacity-90 transition-all duration-300"
            style={{
              mixBlendMode: "multiply",
              filter: `contrast(1.1) brightness(1.02)`,
            }}
          />
        </div>

        {/* Ambient Overlay Layer to lock deep glossy/matte shadows */}
        <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-neutral-900/10 mix-blend-overlay" />

        {/* -------------------- safe target print-zone -------------------- */}
        <div
          ref={zoneRef}
          style={{
            top: `${product.editZone.top}%`,
            left: `${product.editZone.left}%`,
            width: `${product.editZone.width}%`,
            height: `${product.editZone.height}%`,
            borderStyle: showPrintZones || isDragging ? "dashed" : "solid",
            borderColor: showPrintZones || isDragging ? "var(--color-neutral-400)" : "transparent",
            borderRadius: product.editZone.shape === "rounded" ? "1.5rem" : "0.375rem",
          }}
          className="absolute border-2 transition-colors duration-200"
        >
          {/* Label banner for print bounds */}
          {(showPrintZones || isDragging) && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-neutral-900/85 backdrop-blur-xs text-[10px] font-medium font-mono text-white px-2 py-0.5 rounded-full select-none pointer-events-none uppercase tracking-wider">
              {product.editZone.label} ({product.printWidthIn}″ × {product.printHeightIn}″)
            </div>
          )}

          {/* Interactive placed graphic layer */}
          {design ? (
            <div
              className={`absolute flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform duration-75`}
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(calc(-50% + ${design.x}%), calc(-50% + ${design.y}%)) rotate(${design.rotation}deg) scale(${design.scale})`,
                width: "80%",
                height: "80%",
              }}
              onMouseDown={handleStart}
              onTouchStart={handleStart}
            >
              <div 
                className={`relative w-full h-full flex items-center justify-center p-1 rounded-sm border ${
                  isDragging ? "border-sky-500/80 bg-sky-500/5" : "border-transparent hover:border-neutral-400/40"
                }`}
              >
                {/* Visual anchor dots for design */}
                {isDragging && (
                  <>
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-sky-500" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-sky-500" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-full bg-white border-2 border-sky-500" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-full bg-white border-2 border-sky-500" />
                  </>
                )}
                
                <img
                  src={design.src}
                  alt={design.name}
                  referrerPolicy="no-referrer"
                  style={{
                    opacity: design.opacity / 100,
                    filter: filterStyle(),
                    mixBlendMode: design.blendMode === "normal" ? "normal" : design.blendMode,
                    maxHeight: "100%",
                    maxWidth: "100%",
                    objectFit: "contain",
                  }}
                  className="select-none pointer-events-none drop-shadow-md"
                />
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center text-neutral-500/60 select-none pointer-events-none font-sans">
              <Layers className="w-8 h-8 mb-2 stroke-1" />
              <p className="text-xs font-medium">Add Design & Click/Drag here to reposition</p>
            </div>
          )}
        </div>

        {/* Floating Quick Stats HUD indicator */}
        <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm shadow-sm rounded-lg px-2.5 py-1.5 text-[10px] font-mono text-neutral-600/90 flex flex-col gap-0.5 border border-neutral-200/40">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Active Target: {product.name}
          </span>
          {design && (
            <span>
              Offset: {Math.round(design.x)}%, {Math.round(design.y)}% | Size: {Math.round(design.scale * 100)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
