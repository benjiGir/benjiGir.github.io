import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import type { ThreeElements } from '@react-three/fiber'

type GLTFResult = GLTF & {
  nodes: {
    Board_Material001_0: THREE.Mesh
    Plate_Material004_0: THREE.Mesh
    Roller_Material009_0: THREE.Mesh
    Roller_Material003_0: THREE.Mesh
    PCB_Material005_0: THREE.Mesh
    PCB_copper_0: THREE.Mesh
    Keycap_Dark_blue_0: THREE.Mesh
    Keycap001_Blue_0: THREE.Mesh
    Keycap002_White_0: THREE.Mesh
    Keycap003_White_0: THREE.Mesh
    Keycap004_White_0: THREE.Mesh
    Keycap005_White_0: THREE.Mesh
    Keycap006_Blue_0: THREE.Mesh
    Keycap007_Blue_0: THREE.Mesh
    Keycap008_Blue_0: THREE.Mesh
    Keycap009_Blue_0: THREE.Mesh
    Keycap010_White_0: THREE.Mesh
    Keycap011_White_0: THREE.Mesh
    Keycap012_White_0: THREE.Mesh
    Keycap013_White_0: THREE.Mesh
    Keycap014_Blue_0: THREE.Mesh
    Keycap015_White_0: THREE.Mesh
    Keycap016_White_0: THREE.Mesh
    Keycap017_White_0: THREE.Mesh
    Keycap018_White_0: THREE.Mesh
    Keycap019_White_0: THREE.Mesh
    Keycap020_White_0: THREE.Mesh
    Keycap021_White_0: THREE.Mesh
    Keycap022_White_0: THREE.Mesh
    Keycap023_White_0: THREE.Mesh
    Keycap024_White_0: THREE.Mesh
    Keycap025_White_0: THREE.Mesh
    Keycap026_White_0: THREE.Mesh
    Keycap027_White_0: THREE.Mesh
    Keycap028_Blue_0: THREE.Mesh
    Keycap029_Blue_0: THREE.Mesh
    Keycap030_Blue_0: THREE.Mesh
    Keycap031_Blue_0: THREE.Mesh
    Keycap032_Dark_blue_0: THREE.Mesh
    Keycap033_Dark_blue_0: THREE.Mesh
    Keycap034_Dark_blue_0: THREE.Mesh
    Keycap035_Dark_blue_0: THREE.Mesh
    Keycap036_Blue_0: THREE.Mesh
    Keycap037_White_0: THREE.Mesh
    Keycap038_White_0: THREE.Mesh
    Keycap039_White_0: THREE.Mesh
    Keycap040_White_0: THREE.Mesh
    Keycap041_White_0: THREE.Mesh
    Keycap042_White_0: THREE.Mesh
    Keycap043_White_0: THREE.Mesh
    Keycap044_White_0: THREE.Mesh
    Keycap045_White_0: THREE.Mesh
    Keycap046_White_0: THREE.Mesh
    Keycap047_White_0: THREE.Mesh
    Keycap048_White_0: THREE.Mesh
    Keycap049_White_0: THREE.Mesh
    Keycap050_Blue_0: THREE.Mesh
    Keycap051_White_0: THREE.Mesh
    Keycap052_White_0: THREE.Mesh
    Keycap053_White_0: THREE.Mesh
    Keycap054_White_0: THREE.Mesh
    Keycap055_White_0: THREE.Mesh
    Keycap056_White_0: THREE.Mesh
    Keycap057_White_0: THREE.Mesh
    Keycap058_White_0: THREE.Mesh
    Keycap059_White_0: THREE.Mesh
    Keycap060_White_0: THREE.Mesh
    Keycap061_White_0: THREE.Mesh
    Keycap062_Dark_blue_0: THREE.Mesh
    Keycap063_Blue_0: THREE.Mesh
    Keycap064_White_0: THREE.Mesh
    Keycap065_White_0: THREE.Mesh
    Keycap066_White_0: THREE.Mesh
    Keycap067_White_0: THREE.Mesh
    Keycap068_White_0: THREE.Mesh
    Keycap069_White_0: THREE.Mesh
    Keycap070_White_0: THREE.Mesh
    Keycap071_White_0: THREE.Mesh
    Keycap072_White_0: THREE.Mesh
    Keycap073_White_0: THREE.Mesh
    Keycap074_Blue_0: THREE.Mesh
    Keycap075_Blue_0: THREE.Mesh
    Keycap076_Blue_0: THREE.Mesh
    Keycap077_Blue_0: THREE.Mesh
    Keycap079_Blue_0: THREE.Mesh
    Plane_Dark_blue_0: THREE.Mesh
    Plane001_Material007_0: THREE.Mesh
    Plane001_Material006_0: THREE.Mesh
    Plane001_copper_0: THREE.Mesh
    Plane002_Material007_0: THREE.Mesh
    Plane002_Material006_0: THREE.Mesh
    Plane002_copper_0: THREE.Mesh
    Plane003_Material007_0: THREE.Mesh
    Plane003_Material006_0: THREE.Mesh
    Plane003_copper_0: THREE.Mesh
    Plane004_Material007_0: THREE.Mesh
    Plane004_Material006_0: THREE.Mesh
    Plane004_copper_0: THREE.Mesh
    Plane007_Material007_0: THREE.Mesh
    Plane007_Material006_0: THREE.Mesh
    Plane007_copper_0: THREE.Mesh
    Plane008_Material007_0: THREE.Mesh
    Plane008_Material006_0: THREE.Mesh
    Plane008_copper_0: THREE.Mesh
    Plane010_Material007_0: THREE.Mesh
    Plane010_Material006_0: THREE.Mesh
    Plane010_copper_0: THREE.Mesh
    Plane032_Material007_0: THREE.Mesh
    Plane032_Material006_0: THREE.Mesh
    Plane032_copper_0: THREE.Mesh
    Plane033_Material007_0: THREE.Mesh
    Plane033_Material006_0: THREE.Mesh
    Plane033_copper_0: THREE.Mesh
    Plane035_Material007_0: THREE.Mesh
    Plane035_Material006_0: THREE.Mesh
    Plane035_copper_0: THREE.Mesh
    Plane036_Material007_0: THREE.Mesh
    Plane036_Material006_0: THREE.Mesh
    Plane036_copper_0: THREE.Mesh
    Plane037_Material007_0: THREE.Mesh
    Plane037_Material006_0: THREE.Mesh
    Plane037_copper_0: THREE.Mesh
    Plane038_Material007_0: THREE.Mesh
    Plane038_Material006_0: THREE.Mesh
    Plane038_copper_0: THREE.Mesh
    Plane039_Material006_0: THREE.Mesh
    Plane039_Material007_0: THREE.Mesh
    Plane039_copper_0: THREE.Mesh
    Plane040_Material007_0: THREE.Mesh
    Plane040_Material006_0: THREE.Mesh
    Plane040_copper_0: THREE.Mesh
    Plane041_Material007_0: THREE.Mesh
    Plane041_Material006_0: THREE.Mesh
    Plane041_copper_0: THREE.Mesh
    Plane042_Material006_0: THREE.Mesh
    Plane042_Material007_0: THREE.Mesh
    Plane042_copper_0: THREE.Mesh
    Plane043_Material007_0: THREE.Mesh
    Plane043_Material006_0: THREE.Mesh
    Plane043_copper_0: THREE.Mesh
    Plane048_Material007_0: THREE.Mesh
    Plane048_Material006_0: THREE.Mesh
    Plane048_copper_0: THREE.Mesh
    Plane051_Material007_0: THREE.Mesh
    Plane051_Material006_0: THREE.Mesh
    Plane051_copper_0: THREE.Mesh
    Cube001_Stabiliser_plastic_0: THREE.Mesh
    Cube001_Stabilisers_metall_0: THREE.Mesh
    Cube003_Stabiliser_plastic_0: THREE.Mesh
    Cube003_Stabilisers_metall_0: THREE.Mesh
    Cube004_Stabiliser_plastic_0: THREE.Mesh
    Cube004_Stabilisers_metall_0: THREE.Mesh
    Cube005_Stabiliser_plastic_0: THREE.Mesh
    Cube005_Stabilisers_metall_0: THREE.Mesh
    ['Screw_����������_0']: THREE.Mesh
    Screw_Metal_0: THREE.Mesh
    ['Screw001_����������_0']: THREE.Mesh
    Screw001_Metal_0: THREE.Mesh
    ['Screw002_����������_0']: THREE.Mesh
    Screw002_Metal_0: THREE.Mesh
    ['Screw003_����������_0']: THREE.Mesh
    Screw003_Metal_0: THREE.Mesh
  }
  materials: {
    ['Material.001']: THREE.MeshStandardMaterial
    ['Material.004']: THREE.MeshStandardMaterial
    ['Material.009']: THREE.MeshStandardMaterial
    ['Material.003']: THREE.MeshStandardMaterial
    ['Material.005']: THREE.MeshStandardMaterial
    copper: THREE.MeshStandardMaterial
    Dark_blue: THREE.MeshStandardMaterial
    Blue: THREE.MeshStandardMaterial
    White: THREE.MeshStandardMaterial
    ['Material.007']: THREE.MeshStandardMaterial
    ['Material.006']: THREE.MeshStandardMaterial
    Stabiliser_plastic: THREE.MeshStandardMaterial
    Stabilisers_metall: THREE.MeshStandardMaterial
    material: THREE.MeshStandardMaterial
    Metal: THREE.MeshStandardMaterial
  }
}

export function KeyboardModel(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/models/keyboard.opt.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group name="31f862be085f439f8dcb2901c0814560fbx" scale={0.01}>
        <group
          name="Roller"
          position={[-7.468049, 0.616668, -42.466171]}
          rotation={[-1.580757, 0.000892, 1.515411]}
          scale={[1.079667, 1.079667, 1.246376]}>
          <mesh
            name="Roller_Material009_0"
            castShadow
            receiveShadow
            geometry={nodes.Roller_Material009_0.geometry}
            material={materials['Material.009']}
          />
          <mesh
            name="Roller_Material003_0"
            castShadow
            receiveShadow
            geometry={nodes.Roller_Material003_0.geometry}
            material={materials['Material.003']}
          />
        </group>
        <group
          name="PCB"
          position={[-3.894956, -0.273189, -19.718384]}
          rotation={[-1.580757, 0.000892, 1.515411]}
          scale={5.863143}>
          <mesh
            name="PCB_Material005_0"
            castShadow
            receiveShadow
            geometry={nodes.PCB_Material005_0.geometry}
            material={materials['Material.005']}
          />
          <mesh
            name="PCB_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.PCB_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane001"
          position={[-9.187489, 0.307124, -15.118641]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane001_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane001_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane001_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane001_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane001_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane001_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane002"
          position={[-8.982165, 0.270053, -18.821854]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane002_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane002_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane002_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane002_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane002_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane002_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane003"
          position={[-8.54595, 0.191291, -26.689375]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane003_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane003_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane003_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane003_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane003_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane003_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane004"
          position={[-8.109735, 0.11254, -34.556896]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane004_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane004_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane004_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane004_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane004_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane004_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane007"
          position={[-6.725412, 0.306278, -14.982117]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane007_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane007_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane007_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane007_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane007_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane007_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane008"
          position={[-6.725412, 0.306278, -14.982117]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane008_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane008_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane008_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane008_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane008_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane008_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane010"
          position={[-5.294003, 0.047854, -40.798752]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane010_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane010_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane010_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane010_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane010_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane010_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane032"
          position={[-6.697889, 0.3013, -15.478521]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane032_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane032_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane032_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane032_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane032_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane032_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane033"
          position={[-6.568363, 0.277921, -17.814606]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane033_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane033_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane033_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane033_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane033_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane033_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane035"
          position={[-6.686112, 0.299187, -15.690893]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane035_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane035_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane035_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane035_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane035_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane035_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane036"
          position={[-6.66315, 0.29503, -16.105068]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane036_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane036_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane036_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane036_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane036_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane036_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane037"
          position={[-6.711673, 0.303796, -15.229887]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane037_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane037_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane037_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane037_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane037_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane037_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane038"
          position={[-6.542402, 0.273231, -18.28286]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane038_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane038_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane038_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane038_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane038_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane038_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane039"
          position={[-6.492583, 0.264238, -19.18137]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane039_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane039_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane039_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane039_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane039_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane039_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane040"
          position={[-6.711673, 0.303796, -15.229887]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane040_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane040_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane040_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane040_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane040_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane040_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane041"
          position={[-6.711673, 0.303796, -15.229887]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane041_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane041_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane041_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane041_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane041_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane041_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane042"
          position={[-6.336918, 0.236135, -21.988899]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane042_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane042_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane042_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane042_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane042_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane042_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane043"
          position={[-5.948293, 0.165972, -28.998112]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane043_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane043_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane043_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane043_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane043_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane043_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane048"
          position={[-5.431471, 0.072668, -38.319416]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane048_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane048_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane048_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane048_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane048_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane048_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Plane051"
          position={[-5.445505, 0.075204, -38.066284]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}>
          <mesh
            name="Plane051_Material007_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane051_Material007_0.geometry}
            material={materials['Material.007']}
          />
          <mesh
            name="Plane051_Material006_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane051_Material006_0.geometry}
            material={materials['Material.006']}
          />
          <mesh
            name="Plane051_copper_0"
            castShadow
            receiveShadow
            geometry={nodes.Plane051_copper_0.geometry}
            material={materials.copper}
          />
        </group>
        <group
          name="Cube001"
          position={[-1.201303, 0.186961, -14.736975]}
          rotation={[-1.580757, 0.000892, 1.515411]}
          scale={[90.000008, 100, 100.000008]}>
          <mesh
            name="Cube001_Stabiliser_plastic_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_Stabiliser_plastic_0.geometry}
            material={materials.Stabiliser_plastic}
          />
          <mesh
            name="Cube001_Stabilisers_metall_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_Stabilisers_metall_0.geometry}
            material={materials.Stabilisers_metall}
          />
        </group>
        <group
          name="Cube003"
          position={[-1.780725, -0.048129, -38.391338]}
          rotation={[-1.580757, 0.000892, 1.515411]}
          scale={[90.000008, 100, 100.000008]}>
          <mesh
            name="Cube003_Stabiliser_plastic_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube003_Stabiliser_plastic_0.geometry}
            material={materials.Stabiliser_plastic}
          />
          <mesh
            name="Cube003_Stabilisers_metall_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube003_Stabilisers_metall_0.geometry}
            material={materials.Stabilisers_metall}
          />
        </group>
        <group
          name="Cube004"
          position={[-5.512674, -0.048968, -38.811321]}
          rotation={[-1.580757, 0.000892, 1.515411]}
          scale={[90.000008, 100, 100.000008]}>
          <mesh
            name="Cube004_Stabiliser_plastic_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube004_Stabiliser_plastic_0.geometry}
            material={materials.Stabiliser_plastic}
          />
          <mesh
            name="Cube004_Stabilisers_metall_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube004_Stabilisers_metall_0.geometry}
            material={materials.Stabilisers_metall}
          />
        </group>
        <group
          name="Cube005"
          position={[1.346437, 0.094621, -23.778904]}
          rotation={[-1.580757, 0.000892, -1.626182]}
          scale={[90.000008, 100, 100.000008]}>
          <mesh
            name="Cube005_Stabiliser_plastic_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube005_Stabiliser_plastic_0.geometry}
            material={materials.Stabiliser_plastic}
          />
          <mesh
            name="Cube005_Stabilisers_metall_0"
            castShadow
            receiveShadow
            geometry={nodes.Cube005_Stabilisers_metall_0.geometry}
            material={materials.Stabilisers_metall}
          />
        </group>
        <group
          name="Screw"
          position={[-7.567292, -0.375124, -21.504902]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 0.512129]}>
          <mesh
            name="Screw_����������_0"
            castShadow
            receiveShadow
            geometry={nodes['Screw_����������_0'].geometry}
            material={materials.material}
          />
          <mesh
            name="Screw_Metal_0"
            castShadow
            receiveShadow
            geometry={nodes.Screw_Metal_0.geometry}
            material={materials.Metal}
          />
        </group>
        <group
          name="Screw001"
          position={[-8.220556, -0.492593, -33.356499]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 0.512129]}>
          <mesh
            name="Screw001_����������_0"
            castShadow
            receiveShadow
            geometry={nodes['Screw001_����������_0'].geometry}
            material={materials.material}
          />
          <mesh
            name="Screw001_Metal_0"
            castShadow
            receiveShadow
            geometry={nodes.Screw001_Metal_0.geometry}
            material={materials.Metal}
          />
        </group>
        <group
          name="Screw002"
          position={[-6.798059, -0.513997, -35.378647]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 0.512129]}>
          <mesh
            name="Screw002_����������_0"
            castShadow
            receiveShadow
            geometry={nodes['Screw002_����������_0'].geometry}
            material={materials.material}
          />
          <mesh
            name="Screw002_Metal_0"
            castShadow
            receiveShadow
            geometry={nodes.Screw002_Metal_0.geometry}
            material={materials.Metal}
          />
        </group>
        <group
          name="Screw003"
          position={[1.993342, -0.538616, -37.059963]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 0.512129]}>
          <mesh
            name="Screw003_����������_0"
            castShadow
            receiveShadow
            geometry={nodes['Screw003_����������_0'].geometry}
            material={materials.material}
          />
          <mesh
            name="Screw003_Metal_0"
            castShadow
            receiveShadow
            geometry={nodes.Screw003_Metal_0.geometry}
            material={materials.Metal}
          />
        </group>
        <mesh
          name="Board_Material001_0"
          castShadow
          receiveShadow
          geometry={nodes.Board_Material001_0.geometry}
          material={materials['Material.001']}
          position={[-3.885794, -1.051147, -19.815762]}
          rotation={[-1.580757, 0.000891, 1.515411]}
          scale={6.260129}
        />
        <mesh
          name="Plate_Material004_0"
          castShadow
          receiveShadow
          geometry={nodes.Plate_Material004_0.geometry}
          material={materials['Material.004']}
          position={[-3.886334, 0.120196, -19.743454]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}
        />
        <mesh
          name="Keycap_Dark_blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap_Dark_blue_0.geometry}
          material={materials.Dark_blue}
          position={[-9.134981, 1.032952, -15.126008]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap001_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap001_Blue_0.geometry}
          material={materials.Blue}
          position={[-4.821785, 0.830446, -14.884842]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap002_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap002_White_0.geometry}
          material={materials.White}
          position={[-8.930161, 0.995969, -18.820148]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap003_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap003_White_0.geometry}
          material={materials.White}
          position={[-8.930161, 0.995969, -18.820148]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap004_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap004_White_0.geometry}
          material={materials.White}
          position={[-8.930161, 0.995969, -18.820148]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap005_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap005_White_0.geometry}
          material={materials.White}
          position={[-8.930161, 0.995969, -18.820148]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap006_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap006_Blue_0.geometry}
          material={materials.Blue}
          position={[-8.493944, 0.917214, -26.68767]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap007_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap007_Blue_0.geometry}
          material={materials.Blue}
          position={[-8.493944, 0.917214, -26.68767]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap008_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap008_Blue_0.geometry}
          material={materials.Blue}
          position={[-8.493944, 0.917214, -26.68767]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap009_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap009_Blue_0.geometry}
          material={materials.Blue}
          position={[-8.494081, 0.765281, -26.686161]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap010_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap010_White_0.geometry}
          material={materials.White}
          position={[-8.057726, 0.838471, -34.555199]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap011_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap011_White_0.geometry}
          material={materials.White}
          position={[-8.057726, 0.838471, -34.555199]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap012_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap012_White_0.geometry}
          material={materials.White}
          position={[-8.057726, 0.838471, -34.555199]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap013_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap013_White_0.geometry}
          material={materials.White}
          position={[-8.057726, 0.838471, -34.555199]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap014_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap014_Blue_0.geometry}
          material={materials.Blue}
          position={[-4.821785, 0.830446, -14.884842]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap015_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap015_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap016_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap016_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap017_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap017_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap018_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap018_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap019_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap019_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap020_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap020_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap021_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap021_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap022_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap022_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap023_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap023_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap024_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap024_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap025_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap025_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap026_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap026_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap027_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap027_White_0.geometry}
          material={materials.White}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap028_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap028_Blue_0.geometry}
          material={materials.Blue}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap029_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap029_Blue_0.geometry}
          material={materials.Blue}
          position={[-6.688833, 0.926435, -14.989317]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap030_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap030_Blue_0.geometry}
          material={materials.Blue}
          position={[-2.954754, 0.718966, -14.780206]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap031_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap031_Blue_0.geometry}
          material={materials.Blue}
          position={[-1.087705, 0.622639, -14.675724]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap032_Dark_blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap032_Dark_blue_0.geometry}
          material={materials.Dark_blue}
          position={[0.779354, 0.541059, -14.571381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap033_Dark_blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap033_Dark_blue_0.geometry}
          material={materials.Dark_blue}
          position={[0.779354, 0.541059, -14.571381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap034_Dark_blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap034_Dark_blue_0.geometry}
          material={materials.Dark_blue}
          position={[0.779354, 0.541059, -14.571381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap035_Dark_blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap035_Dark_blue_0.geometry}
          material={materials.Dark_blue}
          position={[-1.087705, 0.622639, -14.675724]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap036_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap036_Blue_0.geometry}
          material={materials.Blue}
          position={[-2.954754, 0.718966, -14.780206]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap037_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap037_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap038_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap038_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap039_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap039_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap040_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap040_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap041_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap041_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap042_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap042_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap043_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap043_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap044_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap044_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap045_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap045_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap046_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap046_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap047_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap047_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap048_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap048_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap049_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap049_White_0.geometry}
          material={materials.White}
          position={[-6.300667, 1.097447, 11.788023]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap050_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap050_Blue_0.geometry}
          material={materials.Blue}
          position={[-1.087705, 0.622639, -14.675724]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap051_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap051_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap052_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap052_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap053_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap053_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap054_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap054_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap055_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap055_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap056_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap056_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap057_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap057_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap058_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap058_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap059_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap059_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap060_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap060_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap061_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap061_White_0.geometry}
          material={materials.White}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap062_Dark_blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap062_Dark_blue_0.geometry}
          material={materials.Dark_blue}
          position={[-4.398911, 0.979696, 11.266381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap063_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap063_Blue_0.geometry}
          material={materials.Blue}
          position={[0.779354, 0.541059, -14.571381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap064_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap064_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap065_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap065_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap066_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap066_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap067_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap067_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap068_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap068_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap069_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap069_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap070_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap070_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap071_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap071_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap072_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap072_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap073_White_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap073_White_0.geometry}
          material={materials.White}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap074_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap074_Blue_0.geometry}
          material={materials.Blue}
          position={[-2.394643, 0.858582, 8.895947]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap075_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap075_Blue_0.geometry}
          material={materials.Blue}
          position={[0.779354, 0.541059, -14.571381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap076_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap076_Blue_0.geometry}
          material={materials.Blue}
          position={[0.779354, 0.541059, -14.571381]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap077_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap077_Blue_0.geometry}
          material={materials.Blue}
          position={[-0.195826, 0.380657, -30.762064]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Keycap079_Blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Keycap079_Blue_0.geometry}
          material={materials.Blue}
          position={[-0.195826, 0.380657, -30.762064]}
          rotation={[-1.580756, 0.000893, -1.626181]}
          scale={[100, 100.000008, 100.000008]}
        />
        <mesh
          name="Plane_Dark_blue_0"
          castShadow
          receiveShadow
          geometry={nodes.Plane_Dark_blue_0.geometry}
          material={materials.Dark_blue}
          position={[1.225104, 0.460071, -22.660875]}
          rotation={[-1.580757, 0.000893, 1.515411]}
          scale={[100.000008, 100, 100.000008]}
        />
      </group>
    </group>
  )
}

useGLTF.preload('/models/keyboard.opt.glb')
