import Editable from '@/editor/Editable'
import {MouseModel} from "@/scene/desk/MouseModel.tsx";

// ─── Mouse ────────────────────────────────────────────────────────────────────

export function Mouse() {
  return (
    <Editable
      id="mouse"
      label="Souris"
      position={[0.18, 0.7605, 0.18]}
      rotation={[0, 0.3, 0]}
    >
     <MouseModel />
    </Editable>
  )
}
