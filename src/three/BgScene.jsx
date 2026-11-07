import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'
import { cardTexture } from './textures'
import { pointer, prefersReducedMotion } from './pointer'

// Each card is one service. Drop a real photo at public/photos/<slug>.jpg and it
// replaces the generated artwork automatically.
export const SERVICES = [
  { slug: 'portrait', label: 'Portrait\nPhotography', alt: 'Portrait photography by Pose Photography', a: '#8fa49d', b: '#4f6764' },
  { slug: 'wedding', label: 'Wedding\nPhotography', alt: 'Wedding photography by Pose Photography', a: '#d2c1aa', b: '#9a8570' },
  { slug: 'event', label: 'Event\nPhotography', alt: 'Event photography by Pose Photography', a: '#8a929c', b: '#4f5864' },
  { slug: 'senior', label: 'Senior\nPhotos', alt: 'Senior photos by Pose Photography', a: '#c9a68c', b: '#8c6a55' },
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

// One blurred rectangle shared by every print as its wall shadow.
const SHADOW = (() => {
  if (typeof document === 'undefined') return null
  const c = document.createElement('canvas')
  c.width = 300
  c.height = 350
  const g = c.getContext('2d')
  g.filter = 'blur(22px)'
  g.fillStyle = 'rgba(55, 40, 28, 1)'
  g.fillRect(60, 60, 180, 230)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
})()

function Print({ service, position, rotation, scale, delay, ready }) {
  const ref = useRef()
  const map = usePhoto(service)
  const intro = useRef(0)
  useFrame((_, dt) => {
    intro.current = THREE.MathUtils.damp(intro.current, ready ? 1 : 0, 1.6 - delay, dt)
    const k = intro.current
    ref.current.position.y = position[1] - (1 - k) * 3
    const [shadow, paper, photo] = ref.current.children
    shadow.material.opacity = k * 0.5
    paper.material.opacity = k * 0.96
    photo.material.opacity = k * 0.96
  })
  return (
    <Float speed={prefersReducedMotion ? 0 : 0.9} rotationIntensity={0.18} floatIntensity={0.35}>
      <group ref={ref} position={position} rotation={rotation} scale={scale}>
        {/* soft shadow on the wall, light coming from the upper right */}
        <mesh position={[-0.16, -0.2, -0.05]}>
          <planeGeometry args={[3.0, 3.5]} />
          <meshBasicMaterial map={SHADOW} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        {/* white paper border, then the photo */}
        <mesh>
          <planeGeometry args={[2.2, 2.7]} />
          <meshBasicMaterial color="#fbf8f2" transparent toneMapped={false} />
        </mesh>
        <mesh position-z={0.01}>
          <planeGeometry args={[2.0, 2.5]} />
          <meshBasicMaterial map={map} transparent toneMapped={false} />
        </mesh>
      </group>
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
        { position: [-w * 0.5, h * 0.36, -1], rotation: [0.1, 0.3, 0.12], scale: 0.5 },
        { position: [w * 0.52, h * 0.27, -2], rotation: [0.05, -0.35, -0.1], scale: 0.5 },
        { position: [-w * 0.52, -h * 0.3, -2], rotation: [-0.1, 0.3, -0.1], scale: 0.48 },
        { position: [w * 0.5, -h * 0.4, -1], rotation: [-0.05, -0.3, 0.12], scale: 0.48 },
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
      </Rig>
    </Canvas>
  )
}
