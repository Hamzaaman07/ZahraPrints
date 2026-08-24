/**
 * The carved screen — the girih field as physical, lit geometry.
 *
 * Every strap segment from scripts/build-girih.ts becomes a solid bar, so what
 * you see is the same verified tiling as the flat field, extruded rather than
 * redrawn. Several screens sit at increasing depth and are rotated against each
 * other by multiples of 36° (the tiling's own symmetry step), so moving the
 * camera slides them apart into real parallax instead of a faked one.
 *
 * One InstancedMesh carries every bar across every layer, which keeps ~3,900
 * bars at a single draw call.
 */
import { Suspense, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import girih from "../data/girih.json";

/** girih.json is authored at ~±840; bring it into comfortable world units. */
const S = 0.02;
const LAYER_GAP = 10.4;
const BAR_W = 0.34;
const BAR_D = 0.72;

/** Phones get the same screen with fewer layers and no post pass. */
export type Quality = "high" | "low";
const LAYERS: Record<Quality, number> = { high: 4, low: 2 };

function Bars({ quality }: { quality: Quality }) {
  const layers = LAYERS[quality];
  const mesh = useRef<THREE.InstancedMesh>(null);
  const seg = girih.segments;
  const count = (seg.length / 4) * layers;

  const matrices = useMemo(() => {
    const out: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const pos = new THREE.Vector3();
    const scale = new THREE.Vector3();

    for (let layer = 0; layer < layers; layer++) {
      const spin = (layer * 36 * Math.PI) / 180; // the tiling's own symmetry step
      const z = -layer * LAYER_GAP;
      const cos = Math.cos(spin), sin = Math.sin(spin);

      for (let i = 0; i < seg.length; i += 4) {
        const x1 = seg[i] * S, y1 = seg[i + 1] * S;
        const x2 = seg[i + 2] * S, y2 = seg[i + 3] * S;
        // Rotate the whole layer about its centre before placing the bar.
        const rx1 = x1 * cos - y1 * sin, ry1 = x1 * sin + y1 * cos;
        const rx2 = x2 * cos - y2 * sin, ry2 = x2 * sin + y2 * cos;
        const dx = rx2 - rx1, dy = ry2 - ry1;
        const len = Math.hypot(dx, dy);
        if (len < 1e-4) continue;

        pos.set((rx1 + rx2) / 2, (ry1 + ry2) / 2, z);
        euler.set(0, 0, Math.atan2(dy, dx));
        q.setFromEuler(euler);
        // Overlap the ends slightly so joints read as solid, not as gaps.
        scale.set(len + BAR_W * 0.9, BAR_W, BAR_D);
        out.push(new THREE.Matrix4().compose(pos, q, scale));
      }
    }
    return out;
  }, [seg, layers]);

  useLayoutEffect(() => {
    if (!mesh.current) return;
    matrices.forEach((m, i) => mesh.current!.setMatrixAt(i, m));
    mesh.current.instanceMatrix.needsUpdate = true;
    mesh.current.count = matrices.length;
    mesh.current.computeBoundingSphere();
  }, [matrices]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#E9A62C"
        metalness={0.96}
        roughness={0.2}
        envMapIntensity={1.5}
      />
    </instancedMesh>
  );
}

/** Mouse parallax plus a slow forward drift, so it is alive without scrolling. */
function Rig({ quality }: { quality: Quality }) {
  const near = quality === "high" ? 24 : 30;
  const target = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const scroll = window.scrollY / Math.max(window.innerHeight, 1);
    const cam = state.camera;

    // Travel into the screens on scroll, with a slow idle push so it breathes.
    const wantZ = near - scroll * 16 - Math.sin(t * 0.18) * 1.4;
    const wantX = target.current.x * 3.2;
    const wantY = -target.current.y * 2.2;

    const k = 1 - Math.pow(0.001, delta); // frame-rate independent easing
    cam.position.x += (wantX - cam.position.x) * k;
    cam.position.y += (wantY - cam.position.y) * k;
    cam.position.z += (wantZ - cam.position.z) * k;
    cam.lookAt(0, 0, -14);
  });

  return null;
}

interface GirihScreenProps {
  className?: string;
  quality?: Quality;
}

export function GirihScreen({ className = "", quality = "high" }: GirihScreenProps) {
  return (
    <div className={className} data-testid="girih-screen" data-quality={quality}>
      <Canvas
        dpr={quality === "high" ? [1, 1.75] : [1, 1.25]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 24], fov: 42, near: 0.1, far: 120 }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <fog attach="fog" args={["#0B0A08", 22, 62]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 8, 12]} intensity={2.2} color="#FFD98A" />
        <directionalLight position={[-8, -4, 6]} intensity={1.1} color="#C85D1E" />
        <pointLight position={[0, 0, 8]} intensity={40} distance={40} color="#F5B324" />

        <Suspense fallback={null}>
          <Bars quality={quality} />
          {/* Lightformers give real specular reflections with no external HDR
              to fetch, which also keeps the page working behind a strict CSP. */}
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={3} position={[0, 6, 10]} scale={[14, 6, 1]} color="#FFE3A8" />
            <Lightformer form="rect" intensity={2} position={[-10, -2, 6]} scale={[10, 10, 1]} color="#C85D1E" />
            <Lightformer form="ring" intensity={2.5} position={[8, 3, -6]} scale={6} color="#F5B324" />
          </Environment>
          {/* Bloom is the expensive pass; phones keep the geometry and lose
              only the glow, which is the cheapest thing to give up. */}
          {quality === "high" && (
            <EffectComposer>
              <Bloom intensity={0.75} luminanceThreshold={0.45} luminanceSmoothing={0.3} mipmapBlur />
              <Vignette eskil={false} offset={0.25} darkness={0.85} />
            </EffectComposer>
          )}
        </Suspense>
        <Rig quality={quality} />
      </Canvas>
    </div>
  );
}
