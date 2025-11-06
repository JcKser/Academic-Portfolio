import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Cloud as CloudOrig, Environment } from "@react-three/drei";
import { Color, Vector3 } from "three";

const Cloud: any = CloudOrig;

export default function FlyThroughScene({ onFinish }: { onFinish: () => void }) {
  return (
    <Canvas
      camera={{ position: [0, 15, 50], fov: 75 }}
      style={{ width: "100vw", height: "100vh", background: "#fca17d" }}
      onCreated={({ gl }) => gl.setClearColor(new Color("#fca17d"))}
    >
      <Fly onFinish={onFinish} />
    </Canvas>
  );
}

/**
 * CloudInstance: componente que anima individualmente cada nuvem.
 * Animações: bob (vertical sinusoidal), drift lateral lento, e pequena rotação.
 */
function CloudInstance({
  initialPosition,
  scale,
  color,
  depth,
  seed,
}: {
  initialPosition: [number, number, number];
  scale: number;
  color: string;
  depth?: number;
  seed: number;
}) {
  const ref = useRef<THREE.Group | null>(null);

  // parametros derivados do seed para variar cada nuvem
  const params = useMemo(() => {
    const s = seed || Math.random() * 1000;
    return {
      bobSpeed: 0.5 + (s % 10) * 0.02, // velocidade vertical
      bobAmt: 0.4 + (s % 5) * 0.12,    // amplitude vertical
      driftSpeed: 0.02 + ((s * 7) % 10) * 0.0015, // drift lateral
      driftDir: (s % 2 === 0 ? 1 : -1),
      rotSpeed: 0.002 + ((s * 3) % 8) * 0.0006,
    };
  }, [seed]);

  // store the base position so we oscillate around it
  const base = useMemo(() => new Vector3(...initialPosition), [initialPosition]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();

    // bob vertical
    const y = base.y + Math.sin(t * params.bobSpeed + seed) * params.bobAmt;

    // slow lateral drift on x and slight parallax on z
    const x = base.x + Math.sin(t * params.driftSpeed + seed * 0.7) * 2 * params.driftDir;
    const z = base.z + Math.cos(t * (params.driftSpeed * 0.6) + seed * 0.3) * 1.5;

    ref.current.position.set(x, y, z);

    // subtle rotation / sway
    ref.current.rotation.y = Math.sin(t * params.rotSpeed + seed * 0.2) * 0.15;
    ref.current.rotation.z = Math.sin(t * params.rotSpeed * 0.7 + seed * 0.4) * 0.06;
  });

  return (
    <group ref={ref} scale={[scale, scale, scale]}>
      <Cloud opacity={0.95} depth={depth ?? 2} segments={18} color={color} />
    </group>
  );
}

function Fly({ speed = 25, distance = 800, onFinish }: { speed?: number; distance?: number; onFinish: () => void }) {
  const { camera } = useThree();
  const progressRef = useRef(0);
  const finishedRef = useRef(false);

  // duração total do "fly" em segundos — ajustado para 1.5s conforme pedido
  const duration = 1.5;

  // distancia que queremos percorrer antes de parar (metade do distance para "parar no meio das nuvens")
  const stopDistance = distance / 2;

  // gerar nuvens — agora só dados iniciais; animação acontece em CloudInstance
  const baseClouds = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => {
        const x = (Math.random() - 0.5) * 300;
        const z = 40 - i * 12 - Math.random() * 12;
        const y = -34 + Math.random() * 2; // ligeiramente mais baixo
        return {
          position: [x, y, z] as [number, number, number],
          scale: Math.random() * 12 + 6,
          color: "#ffffff",
          depth: 2.5,
          seed: Math.floor(Math.random() * 10000),
          key: `base-${i}`,
        };
      }),
    []
  );

  const floatingClouds = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => {
        const x = (Math.random() - 0.5) * 120;
        const y = Math.random() * 12 - 2;
        const z = 40 - i * 25 - Math.random() * 25;
        return {
          position: [x, y, z] as [number, number, number],
          scale: Math.random() * 4 + 2,
          color: "#f8f8f8",
          depth: 1.5,
          seed: Math.floor(Math.random() * 10000),
          key: `float-${i}`,
        };
      }),
    []
  );

  const randomClouds = useMemo(
    () =>
      Array.from({ length: Math.floor(Math.random() * 3) + 3 }, (_, i) => ({
        position: [
          (Math.random() - 0.5) * 250,
          Math.random() * 40 - 10,
          40 - Math.random() * 600,
        ] as [number, number, number],
        scale: Math.random() * 6 + 2,
        color: "#ffffff",
        depth: 2,
        seed: Math.floor(Math.random() * 10000),
        key: `random-${i}`,
      })),
    []
  );

  // feito em useFrame: move a câmera por 'duration' segundos até metade da distância
  useFrame((_, delta) => {
    if (finishedRef.current) return;

    progressRef.current += delta;

    const startZ = 50;
    // frac em [0,1]
    const frac = Math.min(1, progressRef.current / duration);
    const targetZ = startZ - frac * stopDistance;
    const target = new Vector3(0, 15, targetZ);

    // movimento suave da câmera - match da sua interpolação original
    camera.position.lerp(target, Math.max(0.03, Math.min(0.12, delta * 6)));
    camera.lookAt(new Vector3(0, 5, targetZ - 10));

    // leve oscilação
    camera.rotation.x = Math.sin(progressRef.current * 0.8) * 0.03;
    camera.rotation.y = Math.sin(progressRef.current * 0.6) * 0.02;

    // quando completar a duração, paramos no meio das nuvens
    if (progressRef.current >= duration) {
      finishedRef.current = true;
      // mantém câmera exatamente no alvo final (corrige lerp)
      camera.position.set(target.x, target.y, target.z);
      camera.lookAt(new Vector3(0, 5, targetZ - 10));

      // chama onFinish após 650ms (como no original)
      setTimeout(() => onFinish(), 650);
    }
  });

  return (
    <>
      <Environment preset="sunset" background={false} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={1.3} />

      {/* Mar de nuvens bem baixo — cada uma animada localmente */}
      {baseClouds.map((c) => (
        <CloudInstance
          key={c.key}
          initialPosition={c.position}
          scale={c.scale}
          color={c.color}
          depth={c.depth}
          seed={c.seed}
        />
      ))}

      {/* Nuvens flutuantes */}
      {floatingClouds.map((c) => (
        <CloudInstance
          key={c.key}
          initialPosition={c.position}
          scale={c.scale}
          color={c.color}
          depth={c.depth}
          seed={c.seed}
        />
      ))}

      {/* Poucas nuvens aleatórias */}
      {randomClouds.map((c) => (
        <CloudInstance
          key={c.key}
          initialPosition={c.position}
          scale={c.scale}
          color={c.color}
          depth={c.depth}
          seed={c.seed}
        />
      ))}
    </>
  );
}
