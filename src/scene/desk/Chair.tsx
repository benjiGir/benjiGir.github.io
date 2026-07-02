import Editable from "@/editor/Editable.tsx";
import {ChairModel} from "@/scene/desk/ChairModel.tsx";

export function Chair() {
  return <Editable
    id="chair"
    label="Chaise"
    position={[0, 0, 0]}
    rotation={[0, 0, 0]}>
    <ChairModel />
  </Editable>
}