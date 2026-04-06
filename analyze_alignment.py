import json
import math
import os

path = r"C:\Users\Shadow\Documents\DayZ\Editor\Custom\Community\Player_Building_Container.json"

def analyze_offsets(file_path):
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    objects = data.get('Objects', [])
    containers = [o for o in objects if 'Container_1' in o.get('name', '')]
    
    if not containers:
        print("No containers found.")
        return

    print(f"Analyzing {len(containers)} containers...")
    
    offsets = []
    for i in range(len(containers) - 1):
        p1 = containers[i]['pos']
        p2 = containers[i+1]['pos']
        dx = abs(p1[0] - p2[0])
        dy = abs(p1[1] - p2[1])
        dz = abs(p1[2] - p2[2])
        dist = math.sqrt(dx**2 + dy**2 + dz**2)
        if dist < 20: # Neighbors
            offsets.append((dx, dy, dz, dist))

    # Summarize common offsets
    print("\nCommon Offsets (dx, dy, dz, dist):")
    for o in sorted(offsets, key=lambda x: x[3])[:20]:
        print(f"  {o[0]:.3f}, {o[1]:.3f}, {o[2]:.3f} (Dist: {o[3]:.3f})")

analyze_offsets(path)
