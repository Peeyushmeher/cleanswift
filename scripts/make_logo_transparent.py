#!/usr/bin/env python3
"""
Script to create a transparent version of the CleanSwift logo
by removing the black background and cropping to content.
"""

from PIL import Image
import os

# Paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
input_path = os.path.join(project_root, "assets", "ChatGPT Image Dec 13, 2025, 07_43_20 PM.png")
output_path = os.path.join(project_root, "assets", "cleanswift_logo_transparent.png")

# Load the image
img = Image.open(input_path)
img = img.convert("RGBA")

# Get pixel data
pixels = img.load()
width, height = img.size

# Threshold for black detection (pixels darker than this become transparent)
black_threshold = 30

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # If the pixel is very dark (close to black), make it transparent
        if r < black_threshold and g < black_threshold and b < black_threshold:
            pixels[x, y] = (r, g, b, 0)  # Set alpha to 0 (transparent)

# Crop to content (remove empty transparent space)
# Find actual bounds by checking alpha channel
pixels = img.load()
width, height = img.size

min_x, min_y = width, height
max_x, max_y = 0, 0

for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if a > 50:  # Only count pixels that are at least somewhat visible
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

if max_x > min_x and max_y > min_y:
    # Add small padding
    padding = 5
    left = max(0, min_x - padding)
    top = max(0, min_y - padding)
    right = min(width, max_x + padding)
    bottom = min(height, max_y + padding)
    img = img.crop((left, top, right, bottom))

# Save the result
img.save(output_path, "PNG")
print(f"✅ Transparent logo saved to: {output_path}")
print(f"   Final size: {img.size[0]}x{img.size[1]}")

