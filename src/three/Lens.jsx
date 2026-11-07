import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { irisTexture, engravingTexture } from './textures'
import { pointer, prefersReducedMotion } from './pointer'

const BLADES = 9
const APERTURE_OUTER = 0.6
const APERTURE_OPEN = 0.4
const { damp } = THREE.MathUtils

function Lens({ ready, shots }) {
  const group = useRef()
  const iris = useMemo(irisTexture, [])
  const engraving = useMemo(engravingTexture, [])
  const anim = useRef({ r: 0.001, lastR: -1, intro: 0, shutterUntil: 0 })

  // Aperture: a ring whose 9-sided inner hole opens and closes like blades.
  const apertureGeo = useMemo(() => new THREE.RingGeometry(0.001, APERTURE_OUTER, BLADES, 1), [])
  const seamGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BLADES * 6), 3))
    return g
  }, [])

  useEffect(() => {
    if (shots > 0) anim.current.shutterUntil = performance.now() / 1000 + 0.16
  }, [shots])

  const setAperture = (r) => {
    const twist = (APERTURE_OPEN - r) * 1.8
    const pos = apertureGeo.attributes.position
    const seams = seamGeo.attributes.position
    for (let i = 0; i <= BLADES; i++) {
      const a = (i / BLADES) * Math.PI * 2 + twist
      pos.setXYZ(i, Math.cos(a) * r, Math.sin(a) * r, 0) // first row = inner edge
      if (i < BLADES) {
        const b = a + 1.05
        seams.setXYZ(i * 2, Math.cos(a) * r, Math.sin(a) * r, 0)
        seams.setXYZ(i * 2 + 1, Math.cos(b) * APERTURE_OUTER, Math.sin(b) * APERTURE_OUTER, 0)
      }
    }
    pos.needsUpdate = true
    seams.needsUpdate = true
  }

  useFrame((state, dt) => {
    const a = anim.current
    const t = state.clock.elapsedTime
    const shutter = performance.now() / 1000 < a.shutterUntil
    const target = !ready || shutter ? 0.001 : APERTURE_OPEN
    a.r = damp(a.r, target, shutter ? 40 : 3.2, dt)
    if (Math.abs(a.r - a.lastR) > 1e-4) {
      setAperture(a.r)
      a.lastR = a.r
    }

    a.intro = damp(a.intro, ready ? 1 : 0, 2.2, dt)
    const g = group.current
    const s = 0.55 + 0.45 * a.intro
    g.scale.setScalar(s)
    const idle = prefersReducedMotion ? 0 : 1
    g.rotation.z = (1 - a.intro) * -2.2 + Math.sin(t * 0.3) * 0.05 * idle
    g.rotation.y = damp(g.rotation.y, pointer.x * 0.5 * idle + Math.sin(t * 0.6) * 0.1 * idle, 3, dt)
    g.rotation.x = damp(g.rotation.x, -pointer.y * 0.4 * idle + Math.cos(t * 0.5) * 0.08 * idle, 3, dt)
  })

  return (
    <group ref={group}>
      {/* barrel */}
      <mesh rotation-x={Math.PI / 2} position-z={-0.55}>
        <cylinderGeometry args={[1, 1, 1.1, 96, 1, true]} />
        <meshStandardMaterial color="#0d0d10" metalness={0.7} roughness={0.38} side={THREE.DoubleSide} />
      </mesh>
      {/* knurled grip */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position-z={-0.22 - i * 0.1}>
          <torusGeometry args={[1.0, 0.028, 10, 96]} />
          <meshStandardMaterial color="#19191d" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}
      {/* front bezel */}
      <mesh>
        <torusGeometry args={[0.93, 0.075, 32, 128]} />
        <meshStandardMaterial color="#2a2a31" metalness={1} roughness={0.22} />
      </mesh>
      {/* engraved name ring */}
      <mesh position-z={0.005}>
        <ringGeometry args={[0.72, 0.88, 128]} />
        <meshStandardMaterial map={engraving} metalness={0.25} roughness={0.65} />
      </mesh>
      {/* inner funnel */}
      <mesh rotation-x={Math.PI / 2} position-z={-0.16}>
        <cylinderGeometry args={[0.72, 0.6, 0.32, 96, 1, true]} />
        <meshStandardMaterial color="#060608" metalness={0.4} roughness={0.5} side={THREE.DoubleSide} />
      </mesh>
      {/* coated glass deep inside */}
      <mesh position-z={-0.33}>
        <circleGeometry args={[0.6, 96]} />
        <meshBasicMaterial map={iris} toneMapped={false} />
      </mesh>
      {/* aperture blades */}
      <mesh geometry={apertureGeo} position-z={-0.3}>
        <meshStandardMaterial color="#121217" metalness={0.55} roughness={0.42} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={seamGeo} position-z={-0.298}>
        <lineBasicMaterial color="#34343e" />
      </lineSegments>
      {/* front element: domed, iridescent glass */}
      <mesh rotation-x={Math.PI / 2} position-z={-2.064}>
        <sphereGeometry args={[2.2, 96, 24, 0, Math.PI * 2, 0, Math.asin(0.86 / 2.2)]} />
        {/* additive reflections only: the coloured iris stays fully visible underneath */}
        <meshPhysicalMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color="#000000"
          roughness={0.05}
          metalness={0}
          iridescence={1}
          iridescenceIOR={1.6}
          iridescenceThicknessRange={[250, 650]}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={0.7}
        />
      </mesh>
    </group>
  )
}

/** Studio lighting built from local light panels (no HDR download needed). */
export function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={5} color="#ff5ad6" position={[3, 2, 4]} scale={[4, 1, 1]} />
        <Lightformer form="rect" intensity={4} color="#4b6bff" position={[-3, -1, 3]} scale={[3, 2, 1]} />
        <Lightformer form="ring" intensity={3} color="#ffffff" position={[-1, 3, 5]} scale={1.5} />
        <Lightformer form="rect" intensity={2.5} color="#8a3dff" position={[0, -3, 2]} scale={[6, 1, 1]} />
      </Environment>
    </>
  )
}

export default function LensCanvas({ ready, shots }) {
  return (
    <Canvas
      className="lens-canvas"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.3], fov: 30 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      aria-hidden="true"
    >
      <StudioLights />
      <Lens ready={ready} shots={shots} />
    </Canvas>
  )
}
