import React, { useState, useEffect } from 'react';
import { Point3D } from '@/lib/shapeGenerators';

interface ShipwreckBuilderProps {
  onGenerate: (pts: Point3D[], params: Record<string, any>) => void;
}

const ShipwreckBuilder: React.FC<ShipwreckBuilderProps> = ({ onGenerate }) => {
  const [sections, setSections] = useState(3);
  const [tilt, setTilt] = useState(15);
  const [debris, setDebris] = useState(0.4);
  const [hullType, setHullType] = useState("Large");

  const generate = () => {
    // This calls the underlying gen_shipwreck logic via the App's generate pipeline
    // For now, we pass the params back to the parent
    onGenerate([], { shape: 'shipwreck', sections, tilt, debris, hullType });
  };

  useEffect(() => {
    generate();
  }, [sections, tilt, debris, hullType]);

  return (
    <div className="p-4 bg-[#0a0f0a] border border-[#27ae6033] rounded-lg space-y-4 font-mono text-[#27ae60]">
      <div className="flex items-center justify-between border-b border-[#27ae6022] pb-2">
        <h2 className="text-sm font-bold tracking-widest text-[#d4a017]">🚢 SHIPWRECK MASTERPIECE</h2>
        <span className="text-[10px] bg-[#d4a01722] px-2 py-0.5 rounded text-[#d4a017]">FIDELITY: MARITIME</span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase opacity-70">Hull Sections</label>
          <input 
            type="range" min="1" max="3" step="1" 
            value={sections} 
            onChange={(e) => setSections(parseInt(e.target.value))}
            className="w-full accent-[#d4a017]"
          />
          <div className="flex justify-between text-[9px] opacity-50">
             <span>Front Only</span>
             <span>Full Hull</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase opacity-70">Maritime Tilt</label>
          <input 
            type="range" min="0" max="45" step="5" 
            value={tilt} 
            onChange={(e) => setTilt(parseInt(e.target.value))}
            className="w-full accent-[#d4a017]"
          />
          <div className="flex justify-between text-[9px] opacity-50">
             <span>Level</span>
             <span>Grounded</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase opacity-70">Debris Density</label>
          <input 
            type="range" min="0" max="1" step="0.1" 
            value={debris} 
            onChange={(e) => setDebris(parseFloat(e.target.value))}
            className="w-full accent-[#d4a017]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase opacity-70">Hull Class</label>
          <select 
            value={hullType}
            onChange={(e) => setHullType(e.target.value)}
            className="w-full bg-[#050805] border border-[#27ae6044] text-[10px] p-1 rounded"
          >
            <option value="Large">Wreck_Ship_Large</option>
            <option value="Medium">Wreck_Ship_Medium</option>
            <option value="Small">Wreck_Ship_Small</option>
          </select>
        </div>
      </div>

      <button 
        onClick={generate}
        className="w-full py-2 bg-[#d4a01722] hover:bg-[#d4a01744] border border-[#d4a017] text-[#d4a017] text-xs font-bold transition-all"
      >
        MATERIALIZE SHIPWRECK
      </button>

      <div className="p-2 bg-[#00000033] border-l-2 border-[#d4a017] text-[9px] leading-relaxed opacity-80">
        Aligns Front, Mid, and Back sections using standard internal DayZ offsets. 
        Debris field uses high-fidelity hull plating fragments.
      </div>
    </div>
  );
};

export default ShipwreckBuilder;
