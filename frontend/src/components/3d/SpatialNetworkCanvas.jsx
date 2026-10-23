import React, { useRef, useState, useEffect, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import SceneFallback from './SceneFallback';
import * as THREE from 'three';

// Class ErrorBoundary specifically to catch WebGL initialization issues
class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('WebGL initialization caught in boundary, rendering fallback:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <SceneFallback title="Collaboration Network (WebGL Fallback)" />;
    }
    return this.props.children;
  }
}

/**
 * 3D Network Mesh Component
 * Renders connected nodes and floating geometric primitives with smooth ambient rotation
 */
function NetworkMesh({ pointerPos }) {
  const groupRef = useRef();
  const sphereRef = useRef();
  const octaRef = useRef();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth subtle ambient rotation
    groupRef.current.rotation.y += delta * 0.2;
    groupRef.current.rotation.x += delta * 0.08;

    // Subtle pointer parallax tracking
    if (pointerPos) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        groupRef.current.rotation.y + pointerPos.x * 0.02,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        pointerPos.y * 0.1,
        0.05
      );
    }

    if (sphereRef.current) {
      sphereRef.current.rotation.z += delta * 0.15;
    }
    if (octaRef.current) {
      octaRef.current.rotation.x -= delta * 0.25;
      octaRef.current.rotation.y += delta * 0.25;
    }
  });

  // Fixed coordinates for orbiting node spheres representing students and projects
  const nodePositions = [
    [1.8, 0.9, -0.5],
    [-1.6, 1.2, 0.4],
    [-1.4, -1.1, -0.6],
    [1.5, -1.3, 0.7],
    [0.2, 2.0, 0.2],
    [-0.3, -2.1, 0.1],
  ];

  return (
    <group ref={groupRef}>
      {/* Central Core: Collaboration Node Sphere */}
      <mesh ref={sphereRef}>
        <sphereGeometry args={[0.85, 32, 32]} />
        <meshStandardMaterial
          color="#10B981"
          roughness={0.25}
          metalness={0.8}
          wireframe={false}
        />
      </mesh>

      {/* Geometric Outer Cage (Wireframe Icosahedron) */}
      <mesh ref={octaRef}>
        <icosahedronGeometry args={[1.7, 1]} />
        <meshStandardMaterial
          color="#34D399"
          wireframe={true}
          transparent={true}
          opacity={0.35}
        />
      </mesh>

      {/* Orbiting Skill & Project Nodes */}
      {nodePositions.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? "#10B981" : "#38BDF8"}
            emissive={idx % 2 === 0 ? "#059669" : "#0284C7"}
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Main 3D Hero Scene
 */
export default function SpatialNetworkCanvas() {
  const prefersReducedMotion = useReducedMotion();
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handlePointerMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    setPointerPos({ x, y });
  };

  // If user prefers reduced motion or is on low-power mobile, gracefully render the 2D SVG/CSS fallback
  if (prefersReducedMotion || isMobile) {
    return <SceneFallback title="CollabSphere Spatial Network" />;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '380px',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 50%, #111D2E 0%, #0B0F17 100%)',
        border: '1px solid var(--border-dark)',
      }}
      onPointerMove={handlePointerMove}
    >
      <WebGLErrorBoundary>
        <Suspense fallback={<SceneFallback />}>
          <Canvas
            camera={{ position: [0, 0, 4.8], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
          >
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} color="#FFFFFF" />
            <pointLight position={[-4, -4, -2]} intensity={0.8} color="#10B981" />
            <NetworkMesh pointerPos={pointerPos} />
          </Canvas>
        </Suspense>
      </WebGLErrorBoundary>

      {/* Floating Info Tag */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.3rem 0.75rem',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          color: '#A7F3D0',
          pointerEvents: 'none',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }} />
        <span>Interactive 3D Network • Move pointer to explore</span>
      </div>
    </div>
  );
}
