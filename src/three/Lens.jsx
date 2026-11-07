import { useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { irisTexture, engravingTexture } from './textures'

const BLADES = 9
const APERTURE_OUTER = 0.6
const APERTURE_OPEN = 0.4

// Aperture ring with a 9-sided opening, plus the seams between blades.
function makeAperture() {
  const ring = new THREE.RingGeometry(APERTURE_OPEN, APERTURE_OUTER, BLADES, 1)
  const pts = []
  for (let i = 0; i < BLADES; i++) {
    const a = (i / BLADES) * Math.PI * 2
    const b = a + 1.05
    pts.push(Math.cos(a) * APERTURE_OPEN, Math.sin(a) * APERTURE_OPEN, 0)
    pts.push(Math.cos(b) * APERTURE_OUTER, Math.sin(b) * APERTURE_OUTER, 0)
  }
  const seams = new THREE.BufferGeometry()
  seams.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return [ring, seams]
}

function Lens() {
  const iris = useMemo(irisTexture, [])
  const engraving = useMemo(engravingTexture, [])
  const [apertureGeo, seamGeo] = useMemo(makeAperture, [])

  return (
    // a slight fixed angle so the barrel reads as 3D
    <group rotation={[-0.12, 0.22, 0]}>
      {/* barrel */}
      <mesh rotation-x={Math.PI / 2} position-z={-0.55}>
        <cylinderGeometry args={[1, 1, 1.1, 96, 1, true]} />
        <meshStandardMaterial color="#141418" metalness={0.7} roughness={0.38} side={THREE.DoubleSide} />
      </mesh>
      {/* knurled grip */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position-z={-0.22 - i * 0.1}>
          <torusGeometry args={[1.0, 0.028, 10, 96]} />
          <meshStandardMaterial color="#1e1e23" metalness={0.5} roughness={0.55} />
        </mesh>
      ))}
      {/* front bezel */}
      <mesh>
        <torusGeometry args={[0.93, 0.075, 32, 128]} />
        <meshStandardMaterial color="#3a3a42" metalness={1} roughness={0.22} />
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
      {/* front element: reflections added on top, the coloured iris stays visible */}
      <mesh rotation-x={Math.PI / 2} position-z={-2.064}>
        <sphereGeometry args={[2.2, 96, 24, 0, Math.PI * 2, 0, Math.asin(0.86 / 2.2)]} />
        <meshPhysicalMaterial
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          color="#000000"
          roughness={0.05}
          metalness={0}
          iridescence={0.35}
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

export default function LensCanvas() {
  return (
    <Canvas
      className="lens-canvas"
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6.3], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 5]} intensity={1.3} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[4, 3, 4]} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[-4, -1, 3]} scale={[4, 3, 1]} />
      </Environment>
      <Lens />
    </Canvas>
  )
}
