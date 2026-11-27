import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Inner 3D Neural Nodes and Synaptic Connections
function NeuralGraph() {
  const groupRef = useRef<THREE.Group>(null);
  const nodesCount = 38;

  // Generate deterministic 3D node positions & connection indices
  const { positions, connections } = useMemo(() => {
    const coords: [number, number, number][] = [];
    // Distribute in a spherical cloud with organic clusters
    for (let i = 0; i < nodesCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodesCount);
      const theta = Math.sqrt(nodesCount * Math.PI) * phi;
      const radius = 2.4 + Math.sin(i * 1.5) * 0.6;
      coords.push([
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi),
      ]);
    }

    const conns: number[] = [];
    // Connect nodes within a proximity threshold
    for (let i = 0; i < nodesCount; i++) {
      for (let j = i + 1; j < nodesCount; j++) {
        const dx = coords[i][0] - coords[j][0];
        const dy = coords[i][1] - coords[j][1];
        const dz = coords[i][2] - coords[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 1.7) {
          conns.push(...coords[i], ...coords[j]);
        }
      }
    }

    return {
      positions: new Float32Array(coords.flat()),
      connections: new Float32Array(conns),
    };
  }, []);

  // Continuous subtle rotation & interactive mouse parallax
  useFrame((state, delta) => {
    if (groupRef.current) {
      const targetRotX =
        state.pointer.y * 0.4 + Math.sin(state.clock.elapsedTime * 0.3) * 0.12;
      const targetRotY =
        state.pointer.x * 0.6 + state.clock.elapsedTime * 0.18;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotX,
        0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotY,
        0.05
      );
    }
  });

  return (
    <group ref={groupRef}>
      {/* Synaptic connection lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[connections, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* Primary Neural Nodes */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.16}
          color="#38bdf8"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* Center glowing core */}
      <mesh>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.15}
          wireframe
        />
      </mesh>
    </group>
  );
}

// Fallback CSS/SVG animation in case WebGL is disabled or encounters issue
function NeuralFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div className="w-48 h-48 rounded-full border border-cyan-500/20 animate-spin [animation-duration:15s] flex items-center justify-center">
        <div className="w-36 h-36 rounded-full border border-purple-500/30 animate-spin [animation-duration:10s] [animation-direction:reverse] flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NeuralNetwork() {
  const [hasWebGl, setHasWebGl] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGl(false);
    } catch {
      setHasWebGl(false);
    }
  }, []);

  if (!hasWebGl) {
    return <NeuralFallback />;
  }

  return (
    <div className="w-full h-full min-h-[280px] relative pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <NeuralGraph />
      </Canvas>
    </div>
  );
}
