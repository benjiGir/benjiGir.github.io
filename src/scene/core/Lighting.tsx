import { Environment } from '@react-three/drei'

export default function Lighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      {/* Key — principal, haut-droite */}
      <directionalLight
        position={[3, 5, 4]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      {/* Fill — gauche, doux */}
      <directionalLight position={[-4, 3, 2]} intensity={0.5} />
      {/* Rim — derrière, teinte froide */}
      <directionalLight position={[0, 2, -5]} intensity={0.4} color="#99aaff" />
      <Environment preset="apartment" />
    </>
  )
}
