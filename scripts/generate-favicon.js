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

    // Convert SVG to PNG with higher quality settings
    const pngBuffer = await svg2png(svgBuffer, {
      width: 64,
      height: 64,
      preserveAspectRatio: true,
      backgroundColor: "transparent",
    });

    // Save temporary PNG
    const tempPngPath = join(__dirname, "../public/temp-favicon.png");
    await fs.writeFile(tempPngPath, pngBuffer);

    // Convert PNG to ICO with multiple sizes for better quality
    const icoBuffer = await pngToIco([tempPngPath], {
      sizes: [16, 32, 48, 64],
      quality: 100,
    });

    // Save ICO file
    await fs.writeFile(join(__dirname, "../public/favicon.ico"), icoBuffer);

    // Clean up temporary PNG
    await fs.unlink(tempPngPath);

    console.log("Favicon generated successfully!");
  } catch (error) {
    console.error("Error generating favicon:", error);
  }
}

generateFavicon();
