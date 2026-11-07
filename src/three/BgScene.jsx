import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import { cardTexture } from './textures'
import { pointer, prefersReducedMotion } from './pointer'

// Each card is one service. Drop a real photo at public/photos/<slug>.jpg and it
// replaces the generated artwork automatically.
export const SERVICES = [
  { slug: 'portrait', label: 'PORTRAIT\nPHOTOGRAPHY', alt: 'Portrait photography by Pose Photography', a: '#3b2a8f', b: '#c04fd0' },
  { slug: 'wedding', label: 'WEDDING\nPHOTOGRAPHY', alt: 'Wedding photography by Pose Photography', a: '#5a3a7a', b: '#f0b3d8' },
  { slug: 'event', label: 'EVENT\nPHOTOGRAPHY', alt: 'Event photography by Pose Photography', a: '#1a2a80', b: '#6a4dff' },
  { slug: 'senior', label: 'SENIOR\nPHOTOS', alt: 'Senior photos by Pose Photography', a: '#7a2a6a', b: '#4b6bff' },
]

function usePhoto(service) {
  const fallback = useMemo(() => cardTexture(service.label, service.a, service.b), [service])
  const [tex, setTex] = useState(fallback)
  useEffect(() => {
    let alive = true
    new THREE.TextureLoader().load(
      `/photos/${service.slug}.jpg`,
      (t) => {
        if (!alive) return
        t.colorSpace = THREE.SRGBColorSpace
        // cover-fit the photo into the 4:5 print
        const img = t.image
        const aspect = img.width / img.height
        const target = 0.8
        if (aspect > target) {
          t.repeat.set(target / aspect, 1)
          t.offset.set((1 - target / aspect) / 2, 0)
        } else {
          t.repeat.set(1, aspect / target)
          t.offset.set(0, (1 - aspect / target) / 2)
        }
        setTex(t)
      },
      undefined,
      () => {}, // no photo yet — keep the generated card
    )
    return () => {
      alive = false
    }
  }, [service])
  return tex
}

function Print({ service, position, rotation, scale, delay, ready }) {
  const ref = useRef()
  const map = usePhoto(service)
  const intro = useRef(0)
  useFrame((_, dt) => {
    intro.current = THREE.MathUtils.damp(intro.current, ready ? 1 : 0, 1.6 - delay, dt)
    const k = intro.current
    ref.current.position.y = position[1] - (1 - k) * 3
    ref.current.material.opacity = k * 0.55
    ref.current.children[0].material.opacity = k * 0.62
  })
  return (
    <Float speed={prefersReducedMotion ? 0 : 1.4} rotationIntensity={0.35} floatIntensity={0.6}>
      {/* white paper border, then the photo */}
      <mesh ref={ref} position={position} rotation={rotation} scale={scale}>
        <planeGeometry args={[2.2, 2.7]} />
        <meshBasicMaterial color="#f4f2ea" transparent toneMapped={false} />
        <mesh position-z={0.01}>
          <planeGeometry args={[2.0, 2.5]} />
          <meshBasicMaterial map={map} transparent toneMapped={false} />
        </mesh>
      </mesh>
    </Float>
  )
}

function Rig({ children }) {
  const ref = useRef()
  useFrame((_, dt) => {
    if (prefersReducedMotion) return
    ref.current.rotation.y = THREE.MathUtils.damp(ref.current.rotation.y, pointer.x * 0.08, 2, dt)
    ref.current.rotation.x = THREE.MathUtils.damp(ref.current.rotation.x, -pointer.y * 0.05, 2, dt)
  })
  return <group ref={ref}>{children}</group>
}

function Prints({ ready }) {
  const { viewport } = useThree()
  const { width: w, height: h } = viewport
  const portrait = w / h < 0.9
  // Phones: prints peek in from the top and bottom edges, clear of the text.
  // Wide screens: they orbit the left and right sides.
  const layout = portrait
    ? [
        { position: [-w * 0.42, h * 0.4, -1], rotation: [0.1, 0.3, 0.16], scale: 0.62 },
        { position: [w * 0.44, h * 0.36, -2], rotation: [0.05, -0.35, -0.14], scale: 0.62 },
        { position: [-w * 0.46, -h * 0.4, -2], rotation: [-0.1, 0.3, -0.12], scale: 0.6 },
        { position: [w * 0.42, -h * 0.43, -1], rotation: [-0.05, -0.3, 0.15], scale: 0.6 },
      ]
    : [
        { position: [-w * 0.42, h * 0.2, -1], rotation: [0.1, 0.45, 0.1], scale: 0.8 },
        { position: [w * 0.42, h * 0.22, -2], rotation: [0.05, -0.45, -0.08], scale: 0.78 },
        { position: [-w * 0.4, -h * 0.24, -2.5], rotation: [-0.1, 0.4, -0.12], scale: 0.7 },
        { position: [w * 0.43, -h * 0.22, -1.2], rotation: [-0.05, -0.4, 0.12], scale: 0.72 },
      ]
  return SERVICES.map((s, i) => <Print key={s.slug} service={s} {...layout[i]} delay={i * 0.2} ready={ready} />)
}

export default function BgScene({ ready }) {
  return (
    <Canvas
      className="bg-canvas"
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      aria-hidden="true"
    >
      <Rig>
        <Prints ready={ready} />
        <Sparkles count={60} scale={[16, 10, 6]} size={3} speed={0.35} opacity={0.7} color="#d9b8ff" />
        <Sparkles count={30} scale={[14, 9, 4]} size={5} speed={0.25} opacity={0.5} color="#ff7ad9" />
      </Rig>
    </Canvas>
  )
}
