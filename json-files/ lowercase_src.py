import json

with open("encaustic.json") as f:
    data = json.load(f)

for item in data:
    if "src" in item:
        item["src"] = item["src"].lower()

with open("encaustic_lower.json", "w") as f:
    json.dump(data, f, indent=2)
