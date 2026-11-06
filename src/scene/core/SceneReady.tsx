import { useLayoutEffect, useRef } from 'react'
import { addAfterEffect, useFrame } from '@react-three/fiber'

export default function SceneReady({ onReady }: { onReady: () => void }) {
  const frameStarted = useRef(false)
  const ready = useRef(false)

  useFrame(() => {
    if (!ready.current) frameStarted.current = true
  })

  useLayoutEffect(() => {
    if (ready.current) return

    // R3F exécute les after-effects après le compositeur (priorité 1).
    const unsubscribe = addAfterEffect(() => {
      if (!frameStarted.current) return

      frameStarted.current = false
      ready.current = true
      unsubscribe()
      onReady()
    })

    return () => {
      frameStarted.current = false
      unsubscribe()
    }
  }, [onReady])

  return null
}
