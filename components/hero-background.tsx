"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    )
    camera.position.z = 6

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8))
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)

    const geometry = new THREE.TorusKnotGeometry(1.9, 0.52, 320, 32)
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#7C3AED"),
      emissive: new THREE.Color("#4F46E5"),
      emissiveIntensity: 0.55,
      metalness: 0.65,
      roughness: 0.25,
      transparent: true,
      opacity: 0.75,
      transmission: 0.3,
      thickness: 0.45,
      side: THREE.DoubleSide,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color("#38BDF8"),
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })

    const wireMesh = new THREE.Mesh(geometry, wireMaterial)
    wireMesh.scale.set(1.02, 1.02, 1.02)
    scene.add(wireMesh)

    const primaryLight = new THREE.PointLight("#6366F1", 1.6, 25)
    primaryLight.position.set(4, 5, 6)
    scene.add(primaryLight)

    const secondaryLight = new THREE.PointLight("#22D3EE", 1.2, 20)
    secondaryLight.position.set(-5, -2, 4)
    scene.add(secondaryLight)

    const magentaLight = new THREE.PointLight("#A855F7", 0.8, 16)
    magentaLight.position.set(0, 3, -4)
    scene.add(magentaLight)

    scene.add(new THREE.AmbientLight("#ffffff", 0.25))

    const clock = new THREE.Clock()
    let frameId = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const elapsed = clock.getElapsedTime()

      mesh.rotation.x = elapsed * 0.25
      mesh.rotation.y = elapsed * 0.32
      wireMesh.rotation.x = elapsed * 0.25
      wireMesh.rotation.y = elapsed * 0.32

      const scale = 1 + Math.sin(elapsed * 0.6) * 0.05
      mesh.scale.set(scale, scale, scale)
      wireMesh.scale.set(scale * 1.01, scale * 1.01, scale * 1.01)

      primaryLight.intensity = 1.4 + Math.sin(elapsed * 0.8) * 0.2
      secondaryLight.intensity = 1.1 + Math.cos(elapsed * 0.6) * 0.2

      renderer.render(scene, camera)
    }

    animate()

    const handleResize = () => {
      if (!container) return
      const { clientWidth, clientHeight } = container
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(clientWidth, clientHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener("resize", handleResize)
      geometry.dispose()
      material.dispose()
      wireMaterial.dispose()
      renderer.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [])

  return <div ref={containerRef} className="pointer-events-none absolute inset-0 -z-10" />
}
