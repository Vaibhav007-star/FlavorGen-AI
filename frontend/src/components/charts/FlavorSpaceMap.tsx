import React, { useState, useMemo } from 'react';
import { FlavorSpaceNode } from '../../types/sensory';
import { Search, Compass, Info } from 'lucide-react';

interface FlavorSpaceMapProps {
  nodes: FlavorSpaceNode[];
  onSelectNode?: (node: FlavorSpaceNode) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Fruit: '#F95D4A',
  Citrus: '#F59E0B',
  Spice: '#EA580C',
  Herb: '#10B981',
  'Beverage / Roasted': '#92400E',
  Confectionery: '#A16207',
  Dairy: '#06B6D4',
  Vegetable: '#84CC16',
  Ester: '#EC4899',
  'Monoterpene Alcohol': '#A855F7',
  Pyrazine: '#D97706',
  default: '#6366F1',
};

export const FlavorSpaceMap: React.FC<FlavorSpaceMapProps> = ({ nodes = [], onSelectNode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredNode, setHoveredNode] = useState<FlavorSpaceNode | null>(null);

  const safeNodes = Array.isArray(nodes) ? nodes : [];

  const categories = useMemo(() => {
    const set = new Set<string>();
    safeNodes.forEach((n) => {
      if (n && n.category) set.add(n.category);
    });
    return Array.from(set);
  }, [safeNodes]);

  // Compute bounding box to normalize 2D coordinates to SVG canvas [50, 750]
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (safeNodes.length === 0) return { minX: -1, maxX: 1, minY: -1, maxY: 1 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    safeNodes.forEach((n) => {
      if (n && Array.isArray(n.coord_2d)) {
        const [x, y] = n.coord_2d;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });
    return {
      minX: isFinite(minX) ? minX : -1,
      maxX: isFinite(maxX) ? maxX : 1,
      minY: isFinite(minY) ? minY : -1,
      maxY: isFinite(maxY) ? maxY : 1,
    };
  }, [safeNodes]);

  const mapToCanvas = (x: number, y: number) => {
    const rangeX = maxX - minX || 1.0;
    const rangeY = maxY - minY || 1.0;
    const cx = 70 + ((x - minX) / rangeX) * 660;
    const cy = 60 + ((y - minY) / rangeY) * 400;
    return { cx, cy };
  };

  const filteredNodes = useMemo(() => {
    return safeNodes.filter((n) => {
      if (!n) return false;
      const matchSearch =
        (n.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.category || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || n.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [safeNodes, searchTerm, selectedCategory]);

  return (
    <div className="flex flex-col h-full bg-[#161920]/85 backdrop-blur-xl rounded-2xl border border-white/[0.08] p-5 shadow-2xl">
      {/* Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-teal-400" />
          <h3 className="font-bold text-white text-sm font-sans">2D PCA Sensory Plane</h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/60 font-semibold">
            64D Latent Projection
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search molecules/foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#101217] border border-white/10 text-xs text-stone-200 placeholder:text-stone-500 rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-teal-500 w-48 shadow-inner"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#101217] border border-white/10 text-xs text-stone-300 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-teal-500 font-medium"
          >
            <option value="all">All Categories ({nodes.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative flex-1 min-h-[440px] bg-gradient-to-br from-[#0D0F12] to-[#12151B] rounded-xl border border-white/[0.08] overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 800 520" className="w-full h-full select-none">
          {/* Subtle grid lines */}
          <line x1="60" y1="260" x2="740" y2="260" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="400" y1="60" x2="400" y2="480" stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" strokeWidth="1" />
          <text x="730" y="250" fill="#6B7280" fontSize="10" textAnchor="end" fontFamily="sans-serif">
            PC1 (Dominant Volatiles)
          </text>
          <text x="410" y="75" fill="#6B7280" fontSize="10" fontFamily="sans-serif">
            PC2 (Polarity & Mouthfeel)
          </text>

          {/* Render Entity Nodes */}
          {filteredNodes.map((node) => {
            const { cx, cy } = mapToCanvas(node.coord_2d[0], node.coord_2d[1]);
            const color = CATEGORY_COLORS[node.category] || CATEGORY_COLORS['default'];
            const isHovered = hoveredNode?.id === node.id;
            const isIngredient = node.type === 'ingredient';

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectNode && onSelectNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : isIngredient ? 6 : 4.5}
                  fill={color}
                  fillOpacity={isHovered ? 1.0 : 0.85}
                  stroke="#161920"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  className="transition-all duration-200 drop-shadow-sm"
                />
                {(isHovered || isIngredient) && (
                  <text
                    x={cx}
                    y={cy - 9}
                    fill={isHovered ? '#FFFFFF' : '#9CA3AF'}
                    fontSize={isHovered ? '11' : '9'}
                    fontWeight={isHovered ? '700' : '500'}
                    textAnchor="middle"
                    className="pointer-events-none drop-shadow-sm font-sans select-none"
                  >
                    {node.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover info badge */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 bg-[#161920]/95 border border-white/20 rounded-xl p-3 shadow-2xl max-w-xs text-xs backdrop-blur-md">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[hoveredNode.category] || '#6366f1' }}
              />
              <span className="font-bold text-white">{hoveredNode.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.08] text-stone-300 capitalize font-medium">
                {hoveredNode.type}
              </span>
            </div>
            <div className="text-[11px] text-stone-400 mb-1">{hoveredNode.category}</div>
            <div className="font-mono text-[10px] text-stone-500">
              Coords: [{hoveredNode.coord_2d[0]?.toFixed(2)}, {hoveredNode.coord_2d[1]?.toFixed(2)}]
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-medium mt-3">
        <Info className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
        <span>
          Click any node to inspect sensory receptor loadings and bio-isosteric neighbor linkages.
        </span>
      </div>
    </div>
  );
};
