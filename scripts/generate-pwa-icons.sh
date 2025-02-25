#!/bin/bash

# Create public directory if it doesn't exist
mkdir -p public

# Base icon sizes
SIZES=(64 192 512)

# Generate PWA icons with proper dimensions and quality
for size in "${SIZES[@]}"; do
  magick convert src/assets/logo.svg \
    -background none \
    -density 300 \
    -resize ${size}x${size} \
    -gravity center \
    -extent ${size}x${size} \
    -quality 100 \
    public/pwa-${size}x${size}.png
done

# Generate maskable icon with padding (safe area)
magick convert src/assets/logo.svg \
  -background "#0A0A0A" \
  -density 300 \
  -resize 400x400 \
  -gravity center \
  -extent 512x512 \
  -quality 100 \
  public/maskable-icon-512x512.png

echo "PWA icons generated successfully!" 