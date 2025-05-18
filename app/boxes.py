import os
import sys
import json
import cv2
import math

sys.stdout.reconfigure(encoding="utf-8")

if len(sys.argv) != 3:
    print("❌ Usage: python boxes.py <json_file> <image_file>")
    sys.exit(1)

json_path = os.path.abspath(sys.argv[1])
image_path = os.path.abspath(sys.argv[2])

if not os.path.exists(json_path):
    print(f"❌ JSON file not found: {json_path}")
    sys.exit(1)

if not os.path.exists(image_path):
    print(f"❌ Image file not found: {image_path}")
    sys.exit(1)

# Extract base filename and ID (parent directory name)
base_name = os.path.splitext(os.path.basename(json_path))[0]
id_folder = os.path.basename(os.path.dirname(json_path))  # Get {id}

# Paths
BASE_OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(json_path), "../.."))
processed_json_path = os.path.join(BASE_OUTPUT_DIR, "jsons", id_folder, f"{base_name}_processed.json")
output_image_path = os.path.join(BASE_OUTPUT_DIR, "images", id_folder, f"{base_name}.jpg")

# Ensure output dirs exist
os.makedirs(os.path.dirname(processed_json_path), exist_ok=True)
os.makedirs(os.path.dirname(output_image_path), exist_ok=True)

# Class map
class_map = {
    0: "Glassdirty",
    1: "Glassloss",
    2: "Polymer",
    3: "broken disc",
    4: "pollution-flashover",
    5: "snow"
}

# Read detections
with open(json_path, "r") as file:
    response = json.load(file)

detections = []
for d in response.get("results", {}).get("detections", []):
    if "class" in d and "confidence" in d and "bbox" in d:
        detections.append({
            "label": class_map.get(d["class"], "unknown"),
            "confidence": d["confidence"],
            "bbox": [
                math.floor(d["bbox"][0]),
                math.floor(d["bbox"][1]),
                math.floor(d["bbox"][2]),
                math.floor(d["bbox"][3]),
            ],
        })

# Save processed JSON
with open(processed_json_path, "w") as file:
    json.dump(detections, file, indent=4)
print(f"✅ Processed JSON saved: {processed_json_path}")

# Load and annotate image
image = cv2.imread(image_path)
if image is None:
    print(f"❌ Failed to load image: {image_path}")
    sys.exit(1)

for det in detections:
    x1, y1, x2, y2 = det["bbox"]
    label = f"{det['label']} {det['confidence']:.2f}"
    cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

# Save image
cv2.imwrite(output_image_path, image)
print(f"✅ Processed image saved: {output_image_path}")
