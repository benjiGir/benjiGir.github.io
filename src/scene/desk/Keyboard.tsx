import Editable from '@/editor/Editable'
import {KeyboardModel} from "@/scene/desk/KeyboardModel.tsx";

// ─── Keyboard ─────────────────────────────────────────────────────────────────

export function Keyboard() {
  return (
    <Editable
      id="keyboard"
      label="Clavier"
      position={[-0.05, 0.755, 0.16]}
      rotation={[-0.05, 0, 0]}
    >
     <KeyboardModel />
    </Editable>
  )
}
