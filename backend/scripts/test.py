import codecs
from pathlib import Path

script_dir = Path(__file__).parent  # folder containing this script
input_file = script_dir / "all_data.json"
output_file = script_dir / "all_data_clean.json"

with codecs.open(input_file, "r", "utf-8-sig") as f:
    data = f.read()

with open(output_file, "w", encoding="utf-8") as f:
    f.write(data)
