import os
import re

codebase_classnames = set()
# Read classnames from the extraction output (simulated here or I'll just pass them in)
# For now, let's just get the list from the codebase directly in the script
src_dir = r"c:\Users\Shadow\Downloads\Dank-editor-preview\artifacts"
dayz_dir = r"C:\Users\Shadow\Documents\DayZ"

def get_classnames():
    classnames = set()
    pattern = re.compile(r"(Land_|StaticObj_)[a-zA-Z0-9_]+")
    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith((".ts", ".tsx")):
                with open(os.path.join(root, file), "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    matches = pattern.findall(content)
                    for m in matches:
                        classnames.add(m)
    return classnames

def get_verified_sources():
    sources = []
    # Primary sources in missions folder
    mission_dir = os.path.join(dayz_dir, "missions", "dayzOffline.ChernarusPlus")
    sources.append(os.path.join(mission_dir, "MapGroupProto.xml"))
    sources.append(os.path.join(mission_dir, "db", "types.xml"))
    sources.append(os.path.join(mission_dir, "MapGroupPos.xml"))
    # Fallback to Editor folder if mission ones are missing
    sources.append(os.path.join(dayz_dir, "Editor", "MapGroupProto.xml"))
    return [s for s in sources if os.path.exists(s)]

def verify():
    used = get_classnames()
    verified_files = get_verified_sources()
    print(f"Checking {len(used)} classnames against {len(verified_files)} files...")
    
    all_hits = set()
    for vf in verified_files:
        with open(vf, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            for cls in used:
                if cls in content:
                    all_hits.add(cls)
    
    unverified = used - all_hits
    
    print("\nVERIFIED ASSETS:")
    for cls in sorted(all_hits):
        print(f"  [OK] {cls}")
        
    print("\nUNVERIFIED ASSETS (REMOVE IMMEDIATELY):")
    for cls in sorted(unverified):
        print(f"  [FAIL] {cls}")

if __name__ == "__main__":
    verify()
