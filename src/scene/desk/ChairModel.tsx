import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'
import IntrinsicElements = React.JSX.IntrinsicElements;

type GLTFResult = GLTF & {
  nodes: {
    Object_4: THREE.Mesh
    Object_5: THREE.Mesh
    Object_6: THREE.Mesh
  }
  materials: {
    ['01_-_Default']: THREE.MeshStandardMaterial
    ['01_-_Default_0']: THREE.MeshStandardMaterial
  }
}

export function ChairModel(props: IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF('/models/chair.opt.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_4.geometry}
        material={materials['01_-_Default']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_5.geometry}
        material={materials['01_-_Default']}
      />
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Object_6.geometry}
        material={materials['01_-_Default_0']}
      />
    </group>
  )
}

useGLTF.preload('/models/chair.opt.glb')
