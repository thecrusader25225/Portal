#!/bin/bash
set -x

# Get the absolute path of the script's directory
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

IMAGE_PATH="$1"
FILENAME=$(basename -- "$IMAGE_PATH")         # e.g. abc.jpg
NAME="${FILENAME%.*}"                         # e.g. abc
PARENT_DIR=$(basename "$(dirname "$IMAGE_PATH")")  # ID from uploads/{id}/abc.jpg

# Construct output paths
OUTPUT_JSON_DIR="$BASE_DIR/output/jsons/$PARENT_DIR"
OUTPUT_IMAGE_DIR="$BASE_DIR/output/images/$PARENT_DIR"

# Create directories if they don't exist
mkdir -p "$OUTPUT_JSON_DIR"
mkdir -p "$OUTPUT_IMAGE_DIR"

OUTPUT_JSON="$OUTPUT_JSON_DIR/${NAME}.json"
OUTPUT_IMAGE="$OUTPUT_IMAGE_DIR/${NAME}.jpg"

echo "Processing: $IMAGE_PATH"
echo "Saving JSON to: $OUTPUT_JSON"
echo "Saving BBox image to: $OUTPUT_IMAGE"

# Run curl command and save response to JSON
curl -s -X POST "http://127.0.0.1:8000/predict/" \
    -H "accept: application/json" \
    -H "Content-Type: multipart/form-data" \
    -F "image=@$IMAGE_PATH" > "$OUTPUT_JSON"

echo "✅ Prediction complete. Output saved to $OUTPUT_JSON"

# Run Python script to generate bounding boxes on the image
echo "Running boxes.py..."
python "$BASE_DIR/app/boxes.py" "$OUTPUT_JSON" "$IMAGE_PATH" 

set +x
