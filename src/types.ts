export interface ProductColor {
  name: string;
  value: string; // Hex color code
  contrastMugInternal?: boolean; // specialized flag if needed
}

export interface EditZone {
  top: number;    // % from top of container
  left: number;   // % from left of container
  width: number;  // % width of container
  height: number; // % height of container
  shape: 'rect' | 'cylinder' | 'rounded'; // warp or boundary feel
  label: string;
}

export interface Product {
  id: string;
  name: string;
  category: 'Apparel' | 'Accessories' | 'Living';
  baseImage: string; // fallback or base shot
  defaultColor: string;
  colors: ProductColor[];
  editZone: EditZone;
  description: string;
  printWidthIn: number;  // Print width in inches for spec sheet
  printHeightIn: number; // Print height in inches for spec sheet
}

export interface PlacedDesign {
  src: string;          // Base64 or object URL of logo
  name: string;         // Label or file name
  x: number;            // % horizontal shift from center (-50 to 50)
  y: number;            // % vertical shift from center (-50 to 50)
  scale: number;        // scale multiplier (0.1 to 3)
  rotation: number;     // degrees (-180 to 180)
  opacity: number;      // 0 to 100
  blendMode: 'normal' | 'multiply' | 'screen' | 'overlay';
  colorFilter: 'none' | 'grayscale' | 'invert' | 'sepia';
}

export interface MockupSession {
  productId: string;
  colorHex: string;
  design: PlacedDesign | null; 
  customBackdrop: string | null; // Generated backdrop image URL or Base64
}

export interface SavedMockup {
  id: string;
  productName: string;
  colorName: string;
  colorHex: string;
  designName: string;
  imageData: string; // The high-res rendered canvas thumbnail/image
  createdAt: string;
}
