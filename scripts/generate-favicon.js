import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import svg2png from "svg2png";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateFavicon() {
  try {
    // Read the SVG file
    const svgBuffer = await fs.readFile(
      join(__dirname, "../src/assets/logo.svg")
    );

    // Convert SVG to PNG with higher quality settings for ICO
    const pngBuffer = await svg2png(svgBuffer, {
      width: 128,
      height: 128,
      preserveAspectRatio: true,
      backgroundColor: "transparent",
    });

    // Generate a larger PNG for modern browsers
    const largePngBuffer = await svg2png(svgBuffer, {
      width: 192,
      height: 192,
      preserveAspectRatio: true,
      backgroundColor: "transparent",
    });

    // Save temporary PNG
    const tempPngPath = join(__dirname, "../public/temp-favicon.png");
    await fs.writeFile(tempPngPath, pngBuffer);

    // Convert PNG to ICO with multiple sizes for better quality
    const icoBuffer = await pngToIco([tempPngPath], {
      sizes: [32, 48, 64, 128],
      quality: 100,
    });

    // Save ICO file
    await fs.writeFile(join(__dirname, "../public/favicon.ico"), icoBuffer);

    // Save the larger PNG version for modern browsers
    await fs.writeFile(
      join(__dirname, "../public/favicon-192.png"),
      largePngBuffer
    );

    // Clean up temporary PNG
    await fs.unlink(tempPngPath);

    console.log("Favicon generated successfully!");
  } catch (error) {
    console.error("Error generating favicon:", error);
  }
}

generateFavicon();
