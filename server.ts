import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

// Ensure environment variables are loaded
dotenv.config();

const app = express();
const PORT = 3000;

// Set up large payload limits for binary/base64 graphics
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Helper to check and get Gemini client lazily to avoid startup crashes if key is omitted
let genAIClient: GoogleGenAI | null = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured in the Secrets panel.");
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return genAIClient;
}

// Check health endpoint
app.get("/api/health", (req, res) => {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
  res.json({
    status: "ok",
    apiKeyConfigured: hasKey,
    timestamp: new Date().toISOString()
  });
});

/**
 * Endpoint: POST /api/generate-design
 * Generate premium logo or graphics using text-to-image (Imagen 4)
 */
app.post("/api/generate-design", async (req, res) => {
  const { prompt, aspectRatio = "1:1", stylePreset = "none" } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "A descriptive text prompt is required." });
    return;
  }

  try {
    const ai = getGeminiClient();

    // Enhance prompt with style modifiers if any preset exists
    let enhancedPrompt = prompt;
    if (stylePreset === "logo") {
      enhancedPrompt = `A premium, clean vector logo of: ${prompt}. Minimalist modern graphic style, isolated on a solid pristine white background, suitable for high resolution printing, sharp branding.`;
    } else if (stylePreset === "pattern") {
      enhancedPrompt = `A seamless, high-resolution aesthetic pattern texture of: ${prompt}. Repeating flat vector artwork style, beautiful color scheme, perfect for apparel textile prints.`;
    } else if (stylePreset === "artwork") {
      enhancedPrompt = `A stunning high-end graphic t-shirt print illustration showing: ${prompt}. Artistic, screen-print design style, bold colors, cool contrast, isolated backdrop.`;
    }

    console.log(`[Express] Calling generateImages with prompt: "${enhancedPrompt}"`);

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: enhancedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
        aspectRatio: aspectRatio as any,
      },
    });

    if (!response?.generatedImages?.[0]?.image?.imageBytes) {
      throw new Error("No image data returned from Google GenAI model.");
    }

    const base64Bytes = response.generatedImages[0].image.imageBytes;
    res.json({
      success: true,
      imageUrl: `data:image/png;base64,${base64Bytes}`,
      promptUsed: enhancedPrompt
    });
  } catch (error: any) {
    console.error("[Express] Error generating design:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate design. Verify your GEMINI_API_KEY configuration.",
    });
  }
});

/**
 * Endpoint: POST /api/edit-design
 * Use Gemini 2.5 Flash Image to edit/inpaint or restyle an existing logo/image
 */
app.post("/api/edit-design", async (req, res) => {
  const { imageBase64, editPrompt } = req.body;

  if (!imageBase64) {
    res.status(400).json({ error: "Source image in Base64 encoding is required." });
    return;
  }
  if (!editPrompt || typeof editPrompt !== "string") {
    res.status(400).json({ error: "Instruction prompt detailing how to edit the image is required." });
    return;
  }

  try {
    const ai = getGeminiClient();

    // Clean up base64 prefix if present
    let rawBase64 = imageBase64;
    let mimeType = "image/png";

    if (imageBase64.includes("data:")) {
      const parts = imageBase64.split(",");
      rawBase64 = parts[1];
      const mimeMatch = parts[0].match(/data:(.*?);/);
      if (mimeMatch) {
         mimeType = mimeMatch[1];
      }
    }

    console.log(`[Express] Requesting edit with instructions: "${editPrompt}"`);

    // We use gemini-2.5-flash-image to edit images using multimodal input
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: rawBase64,
              mimeType: mimeType,
            },
          },
          {
            text: `Please edit or adjust this image according to the following instruction: ${editPrompt}. Maintain high resolution and isolate the final logo or illustration against a clean solid background so it remains perfect for product mockup placement. Return ONLY the edited image outcome.`,
          },
        ],
      },
    });

    let foundImageBase64 = "";
    if (response?.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          foundImageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!foundImageBase64) {
      throw new Error("Gemini model returned a text response instead of an updated image. Try rephrasing your prompt to focus on visual modifications.");
    }

    res.json({
      success: true,
      imageUrl: `data:image/png;base64,${foundImageBase64}`
    });
  } catch (error: any) {
    console.error("[Express] Error editing design:", error);
    res.status(500).json({
      error: error?.message || "Failed to edit image. Ensure Gemini model parameters are satisfied.",
    });
  }
});

/**
 * Endpoint: POST /api/generate-backdrop
 * Generate detailed background environments for mockups (e.g., "sitting on a clean minimalist wooden table...")
 */
app.post("/api/generate-backdrop", async (req, res) => {
  const { prompt, productContext = "a merchandise item" } = req.body;

  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Background style prompt is required." });
    return;
  }

  try {
    const ai = getGeminiClient();
    const refinedPrompt = `${prompt}. Minimalist lifestyle setting suitable to drop a product mockup into, beautiful cinematic lighting, shallow depth of field, high-end commercial photo, photorealistic, 8k. Keep the subject area clean.`;

    console.log(`[Express] Generating custom product backdrop: "${refinedPrompt}"`);

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: refinedPrompt,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/jpeg",
        aspectRatio: "1:1",
      },
    });

    if (!response?.generatedImages?.[0]?.image?.imageBytes) {
      throw new Error("No backdrop product scene was generated.");
    }

    res.json({
      success: true,
      imageUrl: `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`
    });
  } catch (error: any) {
    console.error("[Express] Error generating backdrop:", error);
    res.status(500).json({
      error: error?.message || "Failed to generate dynamic canvas background backdrop.",
    });
  }
});

// Setup dev vs production environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("[Express] Starting server in DEVELOPMENT mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Express] Serving static assets in PRODUCTION environment...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Express] Mockup Studio server is listening at http://localhost:${PORT}`);
  });
}

startServer();
