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
    const svgBuffer = await fs.readFile(join(__dirname, "../public/logo.svg"));

    // Convert SVG to PNG (32x32)
    const pngBuffer = await svg2png(svgBuffer, { width: 32, height: 32 });

    // Save temporary PNG
    const tempPngPath = join(__dirname, "../public/temp-favicon.png");
    await fs.writeFile(tempPngPath, pngBuffer);

    // Convert PNG to ICO
    const icoBuffer = await pngToIco(tempPngPath);

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
