import Editable from '@/editor/Editable'
import {DeskLampModel} from "@/scene/desk/DeskLampModel.tsx";

export function DeskLamp() {

  return (
    <Editable id="desk-lamp" label="Lampe" position={[-0.55, 0.75, -0.27]}>
      <DeskLampModel />
    </Editable>
  )
}
