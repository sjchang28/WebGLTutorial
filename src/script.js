import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
//const gui = new dat.GUI()

const parameters = {
    materialColor: '#7fcffb',
    distance: 4
}

// gui
//     .addColor(parameters, 'materialColor')
//     .onChange(() =>
//     {
// 	material.color.set(parameters.materialColor)
//     })
// gui.add(parameters, 'distance').min(0).max(10).step(1)

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test Objects
 */
// Textures
const textureLoader = new THREE.TextureLoader()
const gradient3 = textureLoader.load('/textures/gradients/3.jpg')
gradient3.magFilter = THREE.NearestFilter

// Material
const material = new THREE.MeshToonMaterial({ 
	color: parameters.materialColor,
	gradientMap: gradient3 
})

// Meshes
const mesh1 = new THREE.Mesh(
	new THREE.TorusGeometry(1, 0.4, 16, 60),
	material
)
const mesh2 = new THREE.Mesh(
	new THREE.ConeGeometry(1, 2, 32),
	material
)
const mesh3 = new THREE.Mesh(
	new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16),
	material
)
mesh1.position.y = parameters.distance * 0
mesh2.position.y = parameters.distance * - 1
mesh3.position.y = parameters.distance * - 2

mesh1.position.x = 2
mesh2.position.x = -2
mesh3.position.x = 2

scene.add(mesh1, mesh2, mesh3)

const sectionMeshes = [mesh1, mesh2, mesh3]

// Particles
const particlesCount = 500
const particlesPositions = new Float32Array(particlesCount * 3)
for (let i = 0; i < particlesCount * 3; i++) {
	let i3 = i * 3
	particlesPositions[i3] = (Math.random() - 0.5) * 10
	particlesPositions[i3 + 1] = (parameters.distance * 0.5) - Math.random() * parameters.distance * sectionMeshes.length
	particlesPositions[i3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3))
const particleMaterial = new THREE.PointsMaterial({
	size: 0.03,
	sizeAttenuation: true,
	depthWrite: false,
	color: '#ff88cc'
})
const particles = new THREE.Points(particlesGeometry, particleMaterial)
scene.add(particles)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(2, 1, 1)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// REsize
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

// Scroll
let scrollY = window.scrollY
let currentSection = 0
window.addEventListener('scroll', (event) => {
	scrollY = window.scrollY

	const newSection = Math.round(scrollY / sizes.height)
	if (newSection !== currentSection){
		currentSection = newSection
		gsap.to(
			sectionMeshes[currentSection].rotation,
			{
				duration: 1,
				ease: 'power2.inOut',
				x: '+=3',
				y: '+=6',
				z: '+=1'
			}
		)
	}
})

// Mouse
const cursor = {}
cursor.x = 0
cursor.y = 0

window.addEventListener('mousemove', (event) => {
	cursor.x = event.clientX / sizes.width - 0.5
	cursor.y = event.clientY / sizes.height - 0.5
})

/**
 * Camera
 */
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    for (const mesh of sectionMeshes){
	mesh.rotation.x += deltaTime * 0.2
	mesh.rotation.y += deltaTime * 0.12
    }

    camera.position.y =  - scrollY / sizes.height * parameters.distance

    const parallelX = cursor.x * 0.5
    const parallelY = - cursor.y * 0.5

    cameraGroup.position.x += (parallelX - cameraGroup.position.x) * 2 * deltaTime
    cameraGroup.position.y += (parallelY - cameraGroup.position.y) * 5 * deltaTime

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()