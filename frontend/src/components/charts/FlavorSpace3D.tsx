import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { FlavorSpaceNode } from '../../types/sensory';

interface FlavorSpace3DProps {
  nodes: FlavorSpaceNode[];
  onSelectNode?: (node: FlavorSpaceNode) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Fruit: '#F95D4A',
  Citrus: '#F59E0B',
  Spice: '#EA580C',
  Herb: '#10B981',
  'Beverage / Roasted': '#78350F',
  Confectionery: '#854D0E',
  Dairy: '#06B6D4',
  Vegetable: '#84CC16',
  Ester: '#EC4899',
  'Monoterpene Alcohol': '#A855F7',
  Pyrazine: '#D97706',
  default: '#6366F1',
};

// Node Sphere with hover tooltip and click behavior
const MoleculeSphere: React.FC<{
  node: FlavorSpaceNode;
  position: [number, number, number];
  isSelected: boolean;
  isNeighbor: boolean;
  onSelect: (node: FlavorSpaceNode) => void;
}> = ({ node, position, isSelected, isNeighbor, onSelect }) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const baseColor = CATEGORY_COLORS[node.category] || CATEGORY_COLORS['default'];
  const isIngredient = node.type === 'ingredient';
  const radius = isIngredient ? 0.35 : 0.24;

  // Gentle floating animation
  useFrame((state) => {
    if (meshRef.current && (isSelected || hovered)) {
      meshRef.current.scale.setScalar(1.25 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
    } else if (meshRef.current) {
      meshRef.current.scale.setScalar(1.0);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={baseColor}
          emissive={isSelected ? baseColor : isNeighbor ? '#F59E0B' : hovered ? '#FFFFFF' : '#000000'}
          emissiveIntensity={isSelected ? 0.6 : isNeighbor ? 0.4 : hovered ? 0.2 : 0}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* Selected glowing ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.3, radius * 1.6, 32]} />
          <meshBasicMaterial color={baseColor} side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Neighbor highlight ring */}
      {isNeighbor && !isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.2, radius * 1.4, 24]} />
          <meshBasicMaterial color="#F59E0B" side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
      )}

      {/* Hover HTML Tooltip */}
      {hovered && (
        <Html distanceFactor={14} zIndexRange={[100, 0]}>
          <div className="pointer-events-none p-2.5 rounded-xl bg-stone-900/95 text-white text-[11px] shadow-2xl border border-stone-700 min-w-[150px] -translate-x-1/2 -translate-y-full mb-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: baseColor }} />
              <span>{node.name}</span>
            </div>
            <div className="text-[10px] text-stone-400 capitalize mt-0.5">{node.category} • {node.type}</div>
            <div className="text-[9px] font-mono text-stone-300 mt-1">
              Coords: [{position[0].toFixed(2)}, {position[1].toFixed(2)}, {position[2].toFixed(2)}]
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Connecting lines between selected node and its 3 nearest neighbors
const NeighborLines: React.FC<{
  selectedPos: [number, number, number] | null;
  neighborPositions: [number, number, number][];
}> = ({ selectedPos, neighborPositions }) => {
  if (!selectedPos || neighborPositions.length === 0) return null;

  return (
    <group>
      {neighborPositions.map((pos, idx) => (
        <Line
          key={idx}
          points={[selectedPos, pos]}
          color="#F59E0B"
          lineWidth={1.5}
          dashed
          dashScale={2}
          opacity={0.6}
          transparent
        />
      ))}
    </group>
  );
};

export const FlavorSpace3D: React.FC<FlavorSpace3DProps> = ({ nodes, onSelectNode }) => {
  const [selectedNode, setSelectedNode] = useState<FlavorSpaceNode | null>(null);

  // Normalize 3D coordinates into a bounded volume [-5, 5]
  const { normalizedNodes, selectedPos, neighborPositions, nearestNeighborIds } = useMemo(() => {
    if (!nodes || nodes.length === 0) {
      return { normalizedNodes: [], selectedPos: null, neighborPositions: [], nearestNeighborIds: new Set<string>() };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    nodes.forEach((n, idx) => {
      const x = n.coord_2d[0];
      const y = n.coord_2d[1];
      // Deterministic synthetic 3D coordinate if not present
      const z = n.coord_3d ? n.coord_3d[2] : Math.sin(idx * 0.7) * 2.5;

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    });

    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const rangeZ = maxZ - minZ || 1;

    const normList = nodes.map((n, idx) => {
      const x = ((n.coord_2d[0] - minX) / rangeX - 0.5) * 8.0;
      const y = ((n.coord_2d[1] - minY) / rangeY - 0.5) * 6.0;
      const rawZ = n.coord_3d ? n.coord_3d[2] : Math.sin(idx * 0.7) * 2.5;
      const z = ((rawZ - minZ) / rangeZ - 0.5) * 6.0;
      return {
        node: n,
        position: [x, y, z] as [number, number, number],
      };
    });

    // Find nearest 3 neighbors if a node is selected
    let sPos: [number, number, number] | null = null;
    const nPositions: [number, number, number][] = [];
    const nIds = new Set<string>();

    if (selectedNode) {
      const match = normList.find((item) => item.node.id === selectedNode.id);
      if (match) {
        sPos = match.position;
        const distances = normList
          .filter((item) => item.node.id !== selectedNode.id)
          .map((item) => {
            const dx = item.position[0] - sPos![0];
            const dy = item.position[1] - sPos![1];
            const dz = item.position[2] - sPos![2];
            return {
              node: item.node,
              pos: item.position,
              distSq: dx * dx + dy * dy + dz * dz,
            };
          })
          .sort((a, b) => a.distSq - b.distSq)
          .slice(0, 3);

        distances.forEach((d) => {
          nPositions.push(d.pos);
          nIds.add(d.node.id);
        });
      }
    }

    return {
      normalizedNodes: normList,
      selectedPos: sPos,
      neighborPositions: nPositions,
      nearestNeighborIds: nIds,
    };
  }, [nodes, selectedNode]);

  const handleSelect = (node: FlavorSpaceNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-gradient-to-br from-[#0D0F12] via-[#101318] to-[#0D0F12] border border-white/[0.08] overflow-hidden select-none shadow-2xl">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 2, 9], fov: 50 }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        {/* Luminous Space Lighting */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 15, 10]} intensity={1.1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.4} color="#D99738" />
        <pointLight position={[0, 0, 0]} intensity={0.6} color="#D99738" />

        {/* Orbit Controls with Damping */}
        <OrbitControls
          enableDamping
          dampingFactor={0.06}
          minDistance={3}
          maxDistance={18}
          maxPolarAngle={Math.PI / 1.15}
        />

        {/* Subtle ground plane grid */}
        <gridHelper args={[14, 14, '#2C313F', '#181B24']} position={[0, -3.2, 0]} />

        {/* Nodes */}
        {normalizedNodes.map(({ node, position }) => (
          <MoleculeSphere
            key={node.id}
            node={node}
            position={position}
            isSelected={selectedNode?.id === node.id}
            isNeighbor={nearestNeighborIds.has(node.id)}
            onSelect={handleSelect}
          />
        ))}

        {/* Neighbor Connecting Lines */}
        <NeighborLines selectedPos={selectedPos} neighborPositions={neighborPositions} />
      </Canvas>

      {/* Bottom overlay helper */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none text-[11px] text-stone-400 font-medium">
        <div className="bg-[#161920]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-stone-300 shadow-lg">
          Drag to rotate • Scroll to zoom • Click node to link nearest analogs
        </div>
        {selectedNode && (
          <div className="bg-[#161920]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#D99738]/50 text-[#E5A852] font-semibold shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D99738]" />
            <span>Selected: {selectedNode.name} (showing 3 nearest bio-neighbors)</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlavorSpace3D;
