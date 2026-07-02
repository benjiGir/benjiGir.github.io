import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { GLTF } from 'three-stdlib'
import type { ThreeElements } from '@react-three/fiber'

const MODEL_URL = '/models/desk.opt.glb'

type GLTFResult = GLTF & {
  nodes: {
    Object_4: THREE.Mesh
    Object_5: THREE.Mesh
    Object_6: THREE.Mesh
    Object_7: THREE.Mesh
    Object_9: THREE.Mesh
    Object_10: THREE.Mesh
    Object_11: THREE.Mesh
    Object_12: THREE.Mesh
    Object_14: THREE.Mesh
  }
  materials: {
    comp_desk_c: THREE.MeshStandardMaterial
    comp_desk: THREE.MeshStandardMaterial
    comp_desk_b: THREE.MeshStandardMaterial
    comp_desk_a: THREE.MeshStandardMaterial
    comp_desk_remote: THREE.MeshStandardMaterial
    comp_desk_2remote: THREE.MeshStandardMaterial
    comp_desk_1remote: THREE.MeshStandardMaterial
    comp_desk_button: THREE.MeshStandardMaterial
    comp_desk_top: THREE.MeshStandardMaterial
  }
}

export function DeskModel(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF(MODEL_URL) as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group name="comp_desk_0" rotation={[Math.PI / 2, 0, 0]}>
        <mesh
          name="Object_4"
          castShadow
          receiveShadow
          geometry={nodes.Object_4.geometry}
          material={materials.comp_desk_c}
        />
        <mesh
          name="Object_5"
          castShadow
          receiveShadow
          geometry={nodes.Object_5.geometry}
          material={materials.comp_desk}
        />
        <mesh
          name="Object_6"
          castShadow
          receiveShadow
          geometry={nodes.Object_6.geometry}
          material={materials.comp_desk_b}
        />
        <mesh
          name="Object_7"
          castShadow
          receiveShadow
          geometry={nodes.Object_7.geometry}
          material={materials.comp_desk_a}
        />
      </group>
      <group name="comp_desk_remote_1" rotation={[Math.PI / 2, 0, 0]}>
        <mesh
          name="Object_9"
          castShadow
          receiveShadow
          geometry={nodes.Object_9.geometry}
          material={materials.comp_desk_remote}
        />
        <mesh
          name="Object_10"
          castShadow
          receiveShadow
          geometry={nodes.Object_10.geometry}
          material={materials.comp_desk_2remote}
        />
        <mesh
          name="Object_11"
          castShadow
          receiveShadow
          geometry={nodes.Object_11.geometry}
          material={materials.comp_desk_1remote}
        />
        <mesh
          name="Object_12"
          castShadow
          receiveShadow
          geometry={nodes.Object_12.geometry}
          material={materials.comp_desk_button}
        />
      </group>
      <mesh
        name="Object_14"
        castShadow
        receiveShadow
        geometry={nodes.Object_14.geometry}
        material={materials.comp_desk_top}
      />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
