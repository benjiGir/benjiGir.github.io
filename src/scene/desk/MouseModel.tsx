import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import type { ThreeElements } from '@react-three/fiber'

type GLTFResult = GLTF & {
  nodes: {
    Cube001_altt_0: THREE.Mesh
    Cube006_Material004_0: THREE.Mesh
    Plane004_Material002_0: THREE.Mesh
    Plane014_Material002_0: THREE.Mesh
    Plane015_Material002_0: THREE.Mesh
    Plane016_tus_0: THREE.Mesh
    Plane019_tus_0: THREE.Mesh
    Plane020_tus_0: THREE.Mesh
    Plane021_altt_0: THREE.Mesh
    Plane024_Material002_0: THREE.Mesh
    Plane025_altt_0: THREE.Mesh
    Plane026_altt_0: THREE.Mesh
    Plane027_altt_0: THREE.Mesh
    Plane028_altt_0: THREE.Mesh
    Plane029_altt_0: THREE.Mesh
    Plane030_Material002_0: THREE.Mesh
    Plane037_Material001_0: THREE.Mesh
    wTube003_tus_0: THREE.Mesh
    wTube004_tus_0: THREE.Mesh
  }
  materials: {
    altt: THREE.MeshStandardMaterial
    ['Material.004']: THREE.MeshStandardMaterial
    ['Material.002']: THREE.MeshStandardMaterial
    material: THREE.MeshStandardMaterial
    ['Material.001']: THREE.MeshStandardMaterial
  }
}

export function MouseModel(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/models/mouse.opt.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]} scale={0.224}>
        <group
          name="391675b8b63d4a6cb47ddd589e55981dfbx"
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}>
          <mesh
            name="Cube001_altt_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_altt_0.geometry}
            material={materials.altt}
            position={[26.4454, 617.2559, 13.5803]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Cube006_Material004_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube006_Material004_0.geometry}
            material={materials['Material.004']}
            position={[22.4412, 643.9473, 10.0373]}
            rotation={[-1.3658, -0.2707, -2.3345]}
            scale={[1.5638, 1.3416, 16.0411]}
          />
          <mesh
            name="Plane004_Material002_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane004_Material002_0.geometry}
            material={materials['Material.002']}
            position={[23.1062, 657.2395, 39.9912]}
            rotation={[-1.3416, -0.3605, -2.5455]}
            scale={35.2873}
          />
          <mesh
            name="Plane014_Material002_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane014_Material002_0.geometry}
            material={materials['Material.002']}
            position={[31.3305, 659.8857, 20.066]}
            rotation={[-2.2907, 0.6302, -2.4928]}
            scale={34.7245}
          />
          <mesh
            name="Plane015_Material002_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane015_Material002_0.geometry}
            material={materials['Material.002']}
            position={[39.6149, 645.0125, 16.1395]}
            rotation={[-2.2907, 0.6302, -2.4928]}
            scale={35.0314}
          />
          <mesh
            name="Plane016_tus_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane016_tus_0.geometry}
            material={materials.material}
            position={[35.1243, 668.1474, 50.5188]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Plane019_tus_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane019_tus_0.geometry}
            material={materials.material}
            position={[35.6188, 667.624, 50.3664]}
            rotation={[-1.4055, -0.6335, -2.4538]}
            scale={35.3387}
          />
          <mesh
            name="Plane020_tus_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane020_tus_0.geometry}
            material={materials.material}
            position={[23.9864, 658.1293, 39.9975]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Plane021_altt_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane021_altt_0.geometry}
            material={materials.altt}
            position={[26.3558, 617.2462, 13.3268]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Plane024_Material002_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane024_Material002_0.geometry}
            material={materials['Material.002']}
            position={[40.7554, 612.4639, 48.0262]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Plane025_altt_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane025_altt_0.geometry}
            material={materials.altt}
            position={[37.7667, 613.9792, 27.7222]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Plane026_altt_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane026_altt_0.geometry}
            material={materials.altt}
            position={[51.9052, 613.8045, 59.9313]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={[36.6738, 36.6738, 35.2873]}
          />
          <mesh
            name="Plane027_altt_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane027_altt_0.geometry}
            material={materials.altt}
            position={[58.5987, 612.7871, 77.4948]}
            rotation={[-Math.PI / 2, 0, 0.2322]}
            scale={35.2873}
          />
          <mesh
            name="Plane028_altt_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane028_altt_0.geometry}
            material={materials.altt}
            position={[40.7554, 612.2098, 48.0262]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={[35.0678, 35.0678, 35.2873]}
          />
          <mesh
            name="Plane029_altt_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane029_altt_0.geometry}
            material={materials.altt}
            position={[40.7554, 612.4639, 48.0262]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Plane030_Material002_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane030_Material002_0.geometry}
            material={materials['Material.002']}
            position={[40.7554, 612.4639, 48.0262]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={35.2873}
          />
          <mesh
            name="Plane037_Material001_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane037_Material001_0.geometry}
            material={materials['Material.001']}
            position={[23.1062, 657.2395, 39.9912]}
            rotation={[-1.3416, -0.3605, -2.5455]}
            scale={35.2873}
          />
          <mesh
            name="wTube003_tus_0"
            castShadow
            receiveShadow
            geometry={nodes.wTube003_tus_0.geometry}
            material={materials.material}
            position={[33.4541, 648.2386, 20.4648]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={37.338}
          />
          <mesh
            name="wTube004_tus_0"
            castShadow
            receiveShadow
            geometry={nodes.wTube004_tus_0.geometry}
            material={materials.material}
            position={[33.4541, 648.2386, 20.4648]}
            rotation={[-Math.PI / 2, 0, -2.7279]}
            scale={37.338}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/mouse.opt.glb')
