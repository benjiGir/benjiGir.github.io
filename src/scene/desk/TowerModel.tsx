import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { GLTF } from 'three-stdlib'

type GLTFResult = GLTF & {
  nodes: {
    defaultMaterial: THREE.Mesh
    defaultMaterial_1: THREE.Mesh
    defaultMaterial_2: THREE.Mesh
    defaultMaterial_3: THREE.Mesh
    defaultMaterial_4: THREE.Mesh
    defaultMaterial_5: THREE.Mesh
    defaultMaterial_6: THREE.Mesh
    defaultMaterial_7: THREE.Mesh
    defaultMaterial_8: THREE.Mesh
    defaultMaterial_9: THREE.Mesh
    defaultMaterial_10: THREE.Mesh
    defaultMaterial_11: THREE.Mesh
    defaultMaterial_12: THREE.Mesh
    defaultMaterial_13: THREE.Mesh
    defaultMaterial_14: THREE.Mesh
    defaultMaterial_15: THREE.Mesh
    defaultMaterial_16: THREE.Mesh
    defaultMaterial_17: THREE.Mesh
    defaultMaterial_18: THREE.Mesh
    defaultMaterial_19: THREE.Mesh
    defaultMaterial_20: THREE.Mesh
    defaultMaterial_21: THREE.Mesh
    defaultMaterial_22: THREE.Mesh
    defaultMaterial_23: THREE.Mesh
    defaultMaterial_24: THREE.Mesh
    defaultMaterial_25: THREE.Mesh
    defaultMaterial_26: THREE.Mesh
    defaultMaterial_27: THREE.Mesh
    defaultMaterial_28: THREE.Mesh
    defaultMaterial_29: THREE.Mesh
    defaultMaterial_30: THREE.Mesh
    defaultMaterial_31: THREE.Mesh
    defaultMaterial_32: THREE.Mesh
    defaultMaterial_33: THREE.Mesh
    defaultMaterial_34: THREE.Mesh
    defaultMaterial_35: THREE.Mesh
    defaultMaterial_36: THREE.Mesh
    defaultMaterial_37: THREE.Mesh
    defaultMaterial_38: THREE.Mesh
    defaultMaterial_39: THREE.Mesh
    defaultMaterial_40: THREE.Mesh
    defaultMaterial_41: THREE.Mesh
    defaultMaterial_42: THREE.Mesh
    defaultMaterial_43: THREE.Mesh
    defaultMaterial_44: THREE.Mesh
    defaultMaterial_45: THREE.Mesh
    defaultMaterial_46: THREE.Mesh
    defaultMaterial_47: THREE.Mesh
    defaultMaterial_48: THREE.Mesh
    defaultMaterial_49: THREE.Mesh
    defaultMaterial_50: THREE.Mesh
    defaultMaterial_51: THREE.Mesh
    defaultMaterial_52: THREE.Mesh
    defaultMaterial_53: THREE.Mesh
    defaultMaterial_54: THREE.Mesh
    defaultMaterial_55: THREE.Mesh
    defaultMaterial_56: THREE.Mesh
  }
  materials: {
    material_4: THREE.MeshStandardMaterial
    material_3: THREE.MeshStandardMaterial
    material_2: THREE.MeshStandardMaterial
    material_1: THREE.MeshStandardMaterial
    material: THREE.MeshStandardMaterial
  }
}

export function TowerModel(props: ThreeElements['group']) {
  const { nodes, materials } = useGLTF('/models/tower.opt.glb') as unknown as GLTFResult
  return (
    <group {...props} dispose={null}>
      <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
        <group name="Collada_visual_scene_group" rotation={[Math.PI / 2, 0, 0]}>
          <group name="Group006" position={[-0.752, 8.806, 5.543]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh
              name="defaultMaterial"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial.geometry}
              material={materials.material_4}
              position={[0.04, -5.189, -7.806]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_1"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_1.geometry}
              material={materials.material_4}
              position={[0.045, 0, -7.296]}
            />
            <mesh
              name="defaultMaterial_2"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_2.geometry}
              material={materials.material_4}
              position={[-7.758, 0, -8.806]}
              rotation={[0, 0, -Math.PI]}
            />
            <mesh
              name="defaultMaterial_3"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_3.geometry}
              material={materials.material_4}
              position={[7.729, 0, -8.806]}
            />
          </group>
          <group name="Group005" position={[-0.159, 9.222, 5.543]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh
              name="defaultMaterial_4"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_4.geometry}
              material={materials.material_3}
              position={[-0.571, 0, 8.39]}
            />
            <mesh
              name="defaultMaterial_5"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_5.geometry}
              material={materials.material_3}
              position={[-0.571, 0, 8.39]}
            />
            <mesh
              name="defaultMaterial_6"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_6.geometry}
              material={materials.material_3}
              position={[-0.571, 0, 8.39]}
            />
            <mesh
              name="defaultMaterial_7"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_7.geometry}
              material={materials.material_3}
              position={[8.972, 3.884, 7.274]}
              rotation={[-Math.PI, 1.535, -Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_8"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_8.geometry}
              material={materials.material_3}
              position={[8.61, 3.848, -5.626]}
              rotation={[-Math.PI, 1.539, -Math.PI / 2]}
            />
          </group>
          <group name="Group004" position={[-2.031, 9.31, 7.049]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh
              name="defaultMaterial_9"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_9.geometry}
              material={materials.material_2}
              position={[0, -0.532, -3.748]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_10"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_10.geometry}
              material={materials.material_2}
              position={[-1.797, 3.437, -0.618]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_11"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_11.geometry}
              material={materials.material_2}
              position={[-5.234, 2.765, 3.441]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_12"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_12.geometry}
              material={materials.material_2}
              position={[1.204, 2.765, -2.869]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_13"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_13.geometry}
              material={materials.material_2}
              position={[1.838, 2.886, 2.109]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_14"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_14.geometry}
              material={materials.material_2}
              position={[-1.996, 2.615, 5.157]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_15"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_15.geometry}
              material={materials.material_2}
              position={[-1.795, 2.831, 2.031]}
            />
            <mesh
              name="defaultMaterial_16"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_16.geometry}
              material={materials.material_2}
              position={[-2.499, 0.108, 3.176]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_17"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_17.geometry}
              material={materials.material_2}
              position={[-2.499, 0.532, 2.529]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_18"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_18.geometry}
              material={materials.material_2}
              position={[3.844, 2.127, 5.043]}
              rotation={[Math.PI / 2, -Math.PI / 2, 0]}
            />
            <mesh
              name="defaultMaterial_19"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_19.geometry}
              material={materials.material_2}
              position={[2.977, 0.999, 4.327]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_20"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_20.geometry}
              material={materials.material_2}
              position={[2.977, 0.999, 4.197]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_21"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_21.geometry}
              material={materials.material_2}
              position={[3.02, 0.999, 4.088]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_22"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_22.geometry}
              material={materials.material_2}
              position={[3.043, 0.999, 3.972]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_23"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_23.geometry}
              material={materials.material_2}
              position={[3.106, 0.999, 3.873]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_24"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_24.geometry}
              material={materials.material_2}
              position={[0.295, -2.965, -3.577]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_25"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_25.geometry}
              material={materials.material_2}
              position={[0.622, -3.337, -2.632]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_26"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_26.geometry}
              material={materials.material_2}
              position={[3.2, 3.019, 0.732]}
            />
            <mesh
              name="defaultMaterial_27"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_27.geometry}
              material={materials.material_2}
              position={[1.142, 2.886, 2.109]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_28"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_28.geometry}
              material={materials.material_2}
              position={[1.49, 2.886, 2.109]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_29"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_29.geometry}
              material={materials.material_2}
              position={[0.793, 2.886, 2.109]}
              rotation={[Math.PI / 2, 0, 0]}
            />
            <mesh
              name="defaultMaterial_30"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_30.geometry}
              material={materials.material_2}
              position={[0.622, -3.337, -2.733]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_31"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_31.geometry}
              material={materials.material_2}
              position={[0.516, -3.369, -2.632]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_32"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_32.geometry}
              material={materials.material_2}
              position={[0.516, -3.369, -2.733]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_33"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_33.geometry}
              material={materials.material_2}
              position={[0.415, -3.395, -2.632]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_34"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_34.geometry}
              material={materials.material_2}
              position={[0.415, -3.395, -2.733]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_35"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_35.geometry}
              material={materials.material_2}
              position={[0.697, -2.965, -3.577]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_36"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_36.geometry}
              material={materials.material_2}
              position={[1.025, -3.337, -2.632]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_37"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_37.geometry}
              material={materials.material_2}
              position={[1.025, -3.337, -2.733]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_38"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_38.geometry}
              material={materials.material_2}
              position={[0.919, -3.369, -2.632]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_39"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_39.geometry}
              material={materials.material_2}
              position={[0.919, -3.369, -2.733]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_40"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_40.geometry}
              material={materials.material_2}
              position={[0.818, -3.395, -2.632]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_41"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_41.geometry}
              material={materials.material_2}
              position={[0.818, -3.395, -2.733]}
              rotation={[Math.PI / 2, -1.222, 0]}
            />
            <mesh
              name="defaultMaterial_42"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_42.geometry}
              material={materials.material_2}
              position={[3.2, 3.019, 0.908]}
            />
            <mesh
              name="defaultMaterial_43"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_43.geometry}
              material={materials.material_2}
              position={[3.2, 3.019, 1.085]}
            />
          </group>
          <group name="Group003" position={[-0.453, 9.308, 6.769]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh
              name="defaultMaterial_44"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_44.geometry}
              material={materials.material_1}
              position={[5.472, 2.829, -5.312]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[1.087, 1.087, 1]}
            />
            <mesh
              name="defaultMaterial_45"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_45.geometry}
              material={materials.material_1}
              position={[0, -3.642, -8.172]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_46"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_46.geometry}
              material={materials.material_1}
              position={[0, -3.642, 8.146]}
              rotation={[-Math.PI, 0, -Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_47"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_47.geometry}
              material={materials.material_1}
              position={[-1.829, -0.442, 7.675]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_48"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_48.geometry}
              material={materials.material_1}
              position={[-4.289, -0.442, 6.673]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_49"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_49.geometry}
              material={materials.material_1}
              position={[-4.083, -0.648, 5.916]}
              rotation={[0, 0, Math.PI / 2]}
            />
            <mesh
              name="defaultMaterial_50"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_50.geometry}
              material={materials.material_1}
              position={[0.218, -0.853, -8.175]}
            />
            <mesh
              name="defaultMaterial_51"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_51.geometry}
              material={materials.material_1}
              position={[-4.745, -0.853, -8.175]}
            />
            <mesh
              name="defaultMaterial_52"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_52.geometry}
              material={materials.material_1}
              position={[2.112, 3.099, -8.039]}
            />
            <mesh
              name="defaultMaterial_53"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_53.geometry}
              material={materials.material_1}
              position={[1.921, 3.222, -8.039]}
            />
            <mesh
              name="defaultMaterial_54"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_54.geometry}
              material={materials.material_1}
              position={[-2.799, 3.099, -8.039]}
            />
            <mesh
              name="defaultMaterial_55"
              castShadow
              receiveShadow
              geometry={nodes.defaultMaterial_55.geometry}
              material={materials.material_1}
              position={[-2.99, 3.222, -8.039]}
            />
          </group>
          <mesh
            name="defaultMaterial_56"
            castShadow
            receiveShadow
            geometry={nodes.defaultMaterial_56.geometry}
            material={materials.material}
            position={[-0.735, 1, 10.732]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
          />
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/models/tower.opt.glb')
