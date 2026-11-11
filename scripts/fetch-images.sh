#!/usr/bin/env bash
# Replaces the 256px placeholder images with full-resolution versions generated in Figma.
# Links expire ~2026-11-17. Run from the project root: bash scripts/fetch-images.sh
set -e
cd public/food
get(){ curl -fsSL -o "$1.png" "https://www.figma.com/api/mcp/asset/$2.png" && echo "$1 ok"; }
get bowl 17a02f90-7718-42b5-939b-038344f519f8
get rice f093f499-e6df-4bdc-ac88-6597edb86e2e
get chicken 18c8660b-9c01-466b-a8c2-bedfd0d11995
get broccoli 684a50a6-e425-49c8-89cb-023928b46612
get avocado c0c50859-7a42-4b14-aa66-9f7e5eb2046b
get beans d9b015b3-23b0-43a5-aa3f-7e0aacf67913
get crackers 5bad447a-de0c-40d0-91e1-37d4b22ff269
get yogurt 0938f983-3f52-4cc0-83c5-6fd879b93120
get apple-jerky f31f8ce3-b4cc-4662-bcd3-215072708df4
# Convert to 800px JPGs with the same names the site uses
for f in *.png; do python3 -c "from PIL import Image;import sys;i=Image.open(sys.argv[1]).convert('RGB');i.thumbnail((800,800));i=i.point(lambda v: 255 if v>=238 else int(v*255/238));i.save(sys.argv[1][:-4]+'.jpg',quality=85)" "$f" && rm "$f"; done
