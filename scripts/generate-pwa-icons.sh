#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Base icon sizes
SIZES=(64 192 512)

# Generate PWA icons
for size in "${SIZES[@]}"; do
  convert src/assets/logo.svg -resize ${size}x${size} public/pwa-${size}x${size}.png
done

# Generate maskable icon with padding (safe area)
convert src/assets/logo.svg -resize 400x400 -gravity center -background "#0A0A0A" -extent 512x512 public/maskable-icon-512x512.png

echo "PWA icons generated successfully!" 