import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Cloud as CloudOrig, Environment, Html } from "@react-three/drei";
import * as THREE from "three";
import { Color, Vector3 } from "three";
import JanelaPanel from "./JanelaPanel";

const Cloud: any = CloudOrig;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => (1 - t) * a + t * b;

export default function FlyThroughScene() {
  const [showFly, setShowFly] = useState(true);
  const [activeCanvasBg, setActiveCanvasBg] = useState("#fca17d");
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  const handleRestart = () => {
    setShowFly(false);
    setActiveCanvasBg("#fca17d");
    setTimeout(() => setShowFly(true), 100);
  };

  const onCanvasBgChange = (newColor: string) => setActiveCanvasBg(newColor);

  useEffect(() => {
    if (glRef.current) glRef.current.setClearColor(new Color(activeCanvasBg));
  }, [activeCanvasBg]);

  return (
    <Canvas
      camera={{ position: [0, 15, 50], fov: 75 }}
      style={{ width: "100vw", height: "100vh", background: activeCanvasBg }}
      onCreated={({ gl }) => {
        glRef.current = gl;
        gl.setClearColor(new Color(activeCanvasBg));
      }}
    >
      {showFly && <SceneContents onRestart={handleRestart} onCanvasBgChange={onCanvasBgChange} />}
    </Canvas>
  );
}

function SceneContents({
  onRestart,
  onCanvasBgChange,
}: {
  onRestart: () => void;
  onCanvasBgChange: (color: string) => void;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [activeSceneKey, setActiveSceneKey] = useState<"sunset" | "rain">("sunset");

  const handleSensoresClick = () => {
    setIsTransitioning(true);
    setIsMenuVisible(false);
  };

  const handleMidpoint = () => {
    // O "SNAP"
    setActiveSceneKey("rain");
    onCanvasBgChange("#1a2025");
  };

  const handleFinish = () => {
    setIsTransitioning(false);
  };

  return (
    <>
      {/* --- Cenário 1: Pôr do Sol --- */}
      {activeSceneKey === "sunset" && (
        <>
          <fog attach="fog" args={["#fca17d", 100, 800]} />
          <Environment preset="city" background={false} />
          <ambientLight intensity={1.5} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1.3}
            color="#ffd1a6"
          />
          <NuvensDeFundo cor="#ffb080" /> {/* Cor do pôr do sol */}
        </>
      )}

      {/* --- Cenário 2: Chuva (Céu Escuro) --- */}
      {activeSceneKey === "rain" && (
        <>
          <fog attach="fog" args={["#1a2025", 10, 300]} />
          <Environment preset="city" background={false} />
          <ambientLight intensity={0.25} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={0.25}
            color="#6f8796"
          />
          <NuvensDeFundo cor="#2a3340" />
          <Rain count={1800} /> 
        </>
      )}

      <Fly onRestart={onRestart} onSensoresClick={handleSensoresClick} isMenuVisible={isMenuVisible} />

      {isTransitioning && (
        <TransitionClouds
          onMidpoint={handleMidpoint}
          onFinish={handleFinish}
        />
      )}
    </>
  );
}

/* ------------------------------
   NuvensDeFundo (sem mudanças)
   ------------------------------ */
function NuvensDeFundo({ cor }: { cor: string }) {
  const baseClouds = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        position: [(Math.random() - 0.5) * 300, -30 + Math.random() * 6, 40 - i * 12 - Math.random() * 12] as [
          number, number, number
        ],
        scale: Math.random() * 12 + 6,
        depth: 2.5,
        seed: Math.floor(Math.random() * 10000) + 1,
        key: `base-${i}`,
      })),
    []
  );

  return (
    <>
      {baseClouds.map((c) => (
        <CloudInstance key={c.key} position={c.position} scale={c.scale} color={cor} depth={c.depth} seed={c.seed} />
      ))}
    </>
  );
}

/* ------------------------------
   CloudInstance (sem mudanças)
   ------------------------------ */
function CloudInstance({
  position,
  scale,
  color,
  depth,
  seed,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
  depth?: number;
  seed: number;
}) {
  const ref = useRef<any>(null);
  const params = useMemo(() => {
    const s = seed;
    return {
      bobSpeed: (0.5 + (s % 10) * 0.02) * 0.05,
      bobAmt: 0.2 + (s % 5) * 0.1,
      driftSpeed: 0.06 + (s % 10) * 0.02,
      driftDir: s % 2 === 0 ? 1 : -1,
      rotSpeed: (0.002 + ((s * 3) % 8) * 0.0006) * 0.05,
      churnSpeed: 0.1 + (s % 5) * 0.05,
    };
  }, [seed]);
  const base = useMemo(() => new Vector3(...position), [position]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const y = base.y + Math.sin(t * params.bobSpeed + seed * 2) * params.bobAmt;
    const x = base.x + t * params.driftSpeed * params.driftDir;
    ref.current.position.set(x, y, base.z);
  });

  return (
    <group ref={ref} position={position} scale={[scale, scale, scale]}>
      <Cloud opacity={0.92} depth={depth ?? 2} segments={18} color={color} speed={params.churnSpeed} fade={0.12} />
    </group>
  );
}

/* ------------------------------
   Rain (sem mudanças)
   ------------------------------ */
function Rain({ count = 1500 }: { count?: number; opacity?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 800;
      arr[i * 3 + 1] = Math.random() * 200 + 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }
    return arr;
  }, [count]);

  const speeds = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = 200 + Math.random() * 400;
    return arr;
  }, [count]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const positionsAttr = (ref.current.geometry.attributes.position as any);
    for (let i = 0; i < count; i++) {
      let y = positionsAttr.array[i * 3 + 1];
      y -= speeds[i] * delta * 0.02;
      if (y < -10) {
        y = Math.random() * 160 + 80;
        positionsAttr.array[i * 3 + 0] = (Math.random() - 0.5) * 800;
        positionsAttr.array[i * 3 + 2] = (Math.random() - 0.5) * 600;
      }
      positionsAttr.array[i * 3 + 1] = y;
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <points ref={ref} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.9}
        transparent
        opacity={0.65}
        depthWrite={false}
        sizeAttenuation
        color="#9fb1c2"
      />
    </points>
  );
}

/* ------------------------------
   TransitionClouds — CORRIGIDO (A "ÚLTIMA VEZ")
   ------------------------------ */
function TransitionClouds({
  onMidpoint,
  onFinish,
}: {
  onMidpoint: () => void;
  onFinish: () => void;
}) {
  const ref = useRef<any>(null);
  const progressRef = useRef(0);

  const duration = 2.6; // Duração total
  const midpoint = 0.48; // Ponto do "snap"

  // *** A "PISTA" ONDE O "CARRO" (NUVENS) VAI PASSAR ***
  const startX = 150; // Começa na direita
  const endX = -150; // Termina na esquerda
  const travelX = startX - endX; // Distância (300)
  
  // Posição Z das nuvens (NA FRENTE do menu)
  // Câmera para em -346
  // Menu está em -350
  // Nuvens passam em -348
  const zPos = -348; 

  const nuvens = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        // Posição local (o "cluster" de nuvens)
        localPos: [
          (Math.random() - 0.5) * 80, // Mais largo para cobrir a tela
          (Math.random() - 0.5) * 60, 
          (Math.random() - 0.5) * 5   
        ] as [number, number, number],
        scale: Math.random() * 28 + 18,
        key: `trn-cloud-${i}`,
      })),
    []
  );

  const calledMidRef = useRef(false);
  const calledFinishRef = useRef(false);
  const holdAfterCover = 0.12;
  const holdTimerRef = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const safeDelta = Math.min(delta, 0.05);
    progressRef.current = Math.min(duration, progressRef.current + safeDelta);
    const frac = progressRef.current / duration;

    // A curva "smooth" (lento-rápido-lento)
    const eased = easeInOutCubic(frac);
    
    // O grupo (o "carro") se move de startX para endX
    const currentX = startX - eased * travelX;
    
    // Define a Posição GLOBAL do grupo
    ref.current.position.set(currentX, 15, zPos); // Y=15 (altura do menu)

    // Lógica de fade da opacidade (o "carro" aparece e desaparece)
    let opacity = 0;
    if (frac < midpoint) {
      opacity = easeInOutCubic(Math.min(1, frac / midpoint));
    } else {
      opacity = easeInOutCubic(Math.max(0, 1 - (frac - midpoint) / (1 - midpoint)));
    }

    // Lógica do "Snap"
    if (opacity >= 0.98 && !calledMidRef.current) {
      holdTimerRef.current += safeDelta;
      if (holdTimerRef.current >= holdAfterCover) {
        calledMidRef.current = true;
        onMidpoint(); 
      }
    }
    if (opacity < 0.98) holdTimerRef.current = 0;
    if (frac >= 1 && !calledFinishRef.current) {
      calledFinishRef.current = true;
      onFinish();
    }

    // Aplica a opacidade
    try {
      for (let i = 0; i < ref.current.children.length; i++) {
        const child = ref.current.children[i] as any;
        if (!child) continue;
        child.children.forEach((mesh: any) => {
          if (mesh && mesh.material) {
            mesh.material.transparent = true;
            mesh.material.opacity = opacity * 0.99;
            mesh.material.needsUpdate = true;
          }
        });
      }
    } catch (e) {}
  });

  return (
    // O grupo é renderizado na raiz da cena,
    // o useFrame controla sua posição global
    <group ref={ref}> 
      {nuvens.map((c) => (
        <group key={c.key} position={c.localPos} scale={[c.scale, c.scale, c.scale]}>
          <Cloud opacity={1.0} color="#ffffff" speed={2} segments={12} fade={0.15} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------
   Fly (sem mudanças)
   ------------------------------ */
function Fly({
  onRestart,
  onSensoresClick,
  isMenuVisible,
}: {
  onRestart: () => void;
  onSensoresClick: () => void;
  isMenuVisible: boolean;
}) {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuOpacity = useRef(0);

  const duration = 3.5;
  const startZ = 50;
  const menuZ = -350;
  const stopOffset = 4;
  const stopZ = menuZ + stopOffset;
  const travelDistance = startZ - stopZ;
  const lookAtTarget = useMemo(() => new Vector3(0, 15, menuZ), [menuZ]);

  useFrame((state, delta) => {
    const safeDelta = Math.min(delta, 0.1);
    if (progressRef.current <= duration) {
      progressRef.current += safeDelta;
    }

    const frac = Math.min(1, progressRef.current / duration);
    const easedFrac = easeInOutCubic(frac);
    const targetZ = startZ - easedFrac * travelDistance;
    const target = new Vector3(0, 15, targetZ);
    camera.position.lerp(target, 0.05);

    camera.lookAt(lookAtTarget);

    const t = state.clock.getElapsedTime();
    camera.rotation.x += Math.sin(t * 0.8) * 0.001;
    camera.rotation.y += Math.sin(t * 0.6) * 0.001;

    // menu fade logic
    if (menuRef.current) {
      let targetOpacity = 0;
      if (isMenuVisible) {
        const realTravelDistance = startZ - camera.position.z;
        const realFrac = Math.max(0, realTravelDistance / travelDistance);
        targetOpacity = Math.max(0, (realFrac - 0.6) / 0.4);
      } else {
        targetOpacity = 0;
      }
      menuOpacity.current = lerp(menuOpacity.current, targetOpacity, 0.1);
      menuRef.current.style.opacity = `${menuOpacity.current}`;
      menuRef.current.style.pointerEvents = menuOpacity.current > 0.9 ? "auto" : "none";
    }
  });

  return (
    <Html position={[0, 15, menuZ]} center distanceFactor={5.5} style={{ opacity: 0 }} ref={menuRef}>
      <JanelaPanel onRestart={onRestart} onSensoresClick={onSensoresClick} />
    </Html>
  );
}