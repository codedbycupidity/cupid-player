#!/bin/bash
# Downloads playlist tracks as MP3s with embedded metadata and album art

OUTPUT_DIR="$(dirname "$0")/../audio"
mkdir -p "$OUTPUT_DIR"

SONGS=(
  "TV Girl Lovers Rock"
  "IV OF SPADES Come Inside Of My Heart"
  "Rex Orange County Pluto Projector"
  "The Smiths There Is a Light That Never Goes Out"
  "Sixpence None the Richer Kiss Me"
  "Cigarettes After Sex Sesame Syrup"
  "The Marías Over the Moon"
  "Laufey Lovesick"
  "Cigarettes After Sex Apocalypse"
  "beabadoobee Glue Song feat Clairo"
  "Ralph Castelli Morning Sex"
  "Frank Ocean Thinkin Bout You"
  "Daniel Caesar Get You feat Kali Uchis"
  "beabadoobee Lovesong"
  "Mac Miller Congratulations feat Bilal"
)

for song in "${SONGS[@]}"; do
  echo "Downloading: $song"
  yt-dlp \
    --extract-audio \
    --audio-format mp3 \
    --audio-quality 0 \
    --embed-thumbnail \
    --embed-metadata \
    --output "$OUTPUT_DIR/%(title)s.%(ext)s" \
    "ytsearch1:$song audio" \
    || echo "  FAILED: $song"
  echo ""
done

echo "Done! Downloaded to $OUTPUT_DIR"
