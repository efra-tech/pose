import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { irisTexture, engravingTexture } from './textures'

/*
  The lens is drawn with an orthographic camera where 1 world unit = 1 CSS pixel,
  so the intro (full-screen canvas) and the resting lens (canvas in the "O" slot)
  render at exactly the same size and position — no jump when they swap.
*/

const BLADES = 9
const APERTURE_OUTER = 0.6
const APERTURE_OPEN = 0.4
const LENS_RADIUS = 1.03 // outer edge of the grip rings, in lens units
const REST_TILT = [-0.12, 0.22] // slight fixed angle so the barrel reads as 3D
export const INTRO_SECONDS = 2
const SHUTTER_START = 0.08 // seconds
const SHUTTER_LENGTH = 0.45
const PULLBACK_START = 0.4

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOutBack = (t) => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2)

function useAperture() {
  return useMemo(() => {
    const ring = new THREE.RingGeometry(0.001, APERTURE_OUTER, BLADES, 1)
    const seams = new THREE.BufferGeometry()
    seams.setAttribute('position', new THREE.BufferAttribute(new Float32Array(BLADES * 6), 3))
    const set = (r) => {
      const twist = (APERTURE_OPEN - r) * 1.8 // blades rotate as they open, like a real iris
      const pos = ring.attributes.position
      const s = seams.attributes.position
      for (let i = 0; i <= BLADES; i++) {
        const a = (i / BLADES) * Math.PI * 2 + twist
        pos.setXYZ(i, Math.cos(a) * r, Math.sin(a) * r, 0)
        if (i < BLADES) {
          const b = a + 1.05
          s.setXYZ(i * 2, Math.cos(a) * r, Math.sin(a) * r, 0)
          s.setXYZ(i * 2 + 1, Math.cos(b) * APERTURE_OUTER, Math.sin(b) * APERTURE_OUTER, 0)
        }
      }
      pos.needsUpdate = true
      s.needsUpdate = true
    }
    return { ring, seams, set }
  }, [])
}

function LensModel({ aperture }) {
  const iris = useMemo(irisTexture, [])
  const engraving = useMemo(engravingTexture, [])
  return (
    <>
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
      <mesh geometry={aperture.ring} position-z={-0.3}>
        <meshStandardMaterial color="#121217" metalness={0.55} roughness={0.42} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={aperture.seams} position-z={-0.298}>
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
          iridescence={0.35}
          iridescenceIOR={1.6}
          iridescenceThicknessRange={[250, 650]}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={0.7}
        />
      </mesh>
    </>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 5]} intensity={1.3} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[4, 3, 4]} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffffff" position={[-4, -1, 3]} scale={[4, 3, 1]} />
      </Environment>
    </>
  )
}

const cameraProps = { position: [0, 0, 4000], near: 1, far: 10000, zoom: 1 }

/** Resting lens inside the "O" slot (canvas is 190% of the slot). Renders once. */
function RestingLens() {
  const aperture = useAperture()
  const { size, invalidate } = useThree()
  useEffect(() => {
    aperture.set(APERTURE_OPEN)
    invalidate()
  }, [aperture, invalidate])
  const radius = size.width / 1.9 / 2 / LENS_RADIUS
  return (
    <group scale={radius} rotation={[REST_TILT[0], REST_TILT[1], 0]}>
      <LensModel aperture={aperture} />
    </group>
  )
}

export default function LensCanvas() {
  return (
    <Canvas className="lens-canvas" orthographic frameloop="demand" dpr={[1, 2]} camera={cameraProps} gl={{ alpha: true, antialias: true }} aria-hidden="true">
      <Lighting />
      <RestingLens />
    </Canvas>
  )
}

/**
  Intro: the lens starts filling the screen width with its aperture shut, the
  blades open, then it spins and pulls back into the "O". Plays once per load.
*/
function IntroLens({ slotRef, onDone }) {
  const group = useRef()
  const aperture = useAperture()
  const start = useRef(null)
  const done = useRef(false)
  const { size } = useThree()

  useFrame((state) => {
    if (done.current) return
    if (start.current === null) start.current = state.clock.elapsedTime
    const t = state.clock.elapsedTime - start.current
    const p = clamp01(t / INTRO_SECONDS)

    // where the "O" sits on screen, in pixels from the centre
    const rect = slotRef.current.getBoundingClientRect()
    const tx = rect.left + rect.width / 2 - size.width / 2
    const ty = -(rect.top + rect.height / 2 - size.height / 2)
    const endR = rect.width / 2 / LENS_RADIUS
    const startR = size.width / 2 / LENS_RADIUS // 100% of the screen width

    // first: the shutter opens while the lens holds full width
    const open = easeInOutCubic(clamp01((t - SHUTTER_START) / SHUTTER_LENGTH))
    aperture.set(0.001 + (APERTURE_OPEN - 0.001) * open)

    // then: tunnel back into the "O" (zoom is interpolated in log space so it feels even)
    const k = clamp01((t - PULLBACK_START) / (INTRO_SECONDS - PULLBACK_START))
    const e = easeInOutCubic(k)
    const settle = easeOutBack(k)
    const r = startR * Math.pow(endR / startR, e)
    group.current.scale.setScalar(r)
    group.current.position.set(tx * e, ty * e, 0)
    group.current.rotation.set(REST_TILT[0] * settle, REST_TILT[1] * settle, (1 - e) * -Math.PI * 1.25)

    if (p >= 1) {
      done.current = true
      onDone()
    }
  })

  return (
    <group ref={group}>
      <LensModel aperture={aperture} />
    </group>
  )
}

export function LensIntro({ slotRef, onDone }) {
  return (
    <Canvas className="lens-intro" orthographic dpr={[1, 2]} camera={cameraProps} gl={{ alpha: true, antialias: true }} aria-hidden="true">
      <Lighting />
      <IntroLens slotRef={slotRef} onDone={onDone} />
    </Canvas>
  )
}
