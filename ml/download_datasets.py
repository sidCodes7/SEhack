"""Download second dataset - trying multiple options"""
import kagglehub
import shutil, os, glob

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Try different public ocean datasets
datasets_to_try = [
    ("calcofi/calcofi", "calcofi"),
    ("sohier/calcofi", "calcofi"),
    ("marineinstitute/weather-buoy-network", "weather_buoy"),
    ("danielfedorov/water-quality-monitoring-dataset", "water_quality"),
]

for slug, name in datasets_to_try:
    try:
        print(f"\nTrying: {slug} ...")
        path = kagglehub.dataset_download(slug)
        print(f"SUCCESS! Downloaded to: {path}")
        print("Contents:", os.listdir(path))
        
        # Copy CSV files
        for f in glob.glob(os.path.join(path, "**", "*.csv"), recursive=True):
            basename = os.path.basename(f)
            dest = os.path.join(DATA_DIR, basename)
            shutil.copy2(f, dest)
            print(f"  Copied: {basename}")
        break
        
    except Exception as e:
        print(f"  FAILED: {e}")
        continue

print("\nFinal ml/data/ contents:", os.listdir(DATA_DIR))
