import { useState } from 'react'
import { useProgress } from '@react-three/drei'
import RoomBlueprint from '@/components/RoomBlueprint'
import './sceneLoader.css'

export default function SceneLoader({ ready }: { ready: boolean }) {
  const [hidden, setHidden] = useState(false)

  if (hidden) return null

  return (
    <div
      className="scene-boot"
      data-ready={ready}
      aria-hidden={ready}
      onAnimationEnd={(event) => {
        if (ready && event.currentTarget === event.target) setHidden(true)
      }}
    >
      <section className="boot-window" aria-labelledby="boot-title">
        <header className="boot-window__bar">
          <span className="boot-window__lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span>Démarrage</span>
        </header>
        <div className="boot-window__body">
          <div className="boot-window__preview">
            <RoomBlueprint />
          </div>
          <h1 id="boot-title">Bureau OS</h1>
          <BootProgress ready={ready} />
        </div>
      </section>
    </div>
  )
}

function BootProgress({ ready }: { ready: boolean }) {
  const active = useProgress((state) => state.active)
  const loaded = useProgress((state) => state.loaded)
  const total = useProgress((state) => state.total)
  const downloading = active && loaded < total
  const rendering = total > 0 && !downloading
  const percent = ready
    ? 100
    : downloading
      ? Math.min(99, Math.floor((loaded / total) * 100))
      : undefined
  const stage = ready
    ? 'Chambre prête'
    : downloading
      ? 'Chargement des ressources'
      : rendering
        ? 'Premier rendu de la chambre'
        : 'Démarrage du moteur 3D'

  return (
    <div className="boot-progress">
      <div className="boot-progress__label">
        <span id="boot-stage" role="status">
          {stage}
        </span>
        <span className="boot-progress__value" aria-hidden="true">
          {percent === undefined ? 'En cours' : `${percent} %`}
        </span>
      </div>
      <div
        className="boot-progress__track"
        role="progressbar"
        aria-labelledby="boot-stage"
        aria-valuenow={percent}
        data-indeterminate={percent === undefined}
      >
        <span style={percent === undefined ? undefined : { width: `${percent}%` }} />
      </div>
      <ol className="boot-progress__steps" aria-hidden="true">
        <li data-step={ready || rendering ? 'done' : 'current'}>Ressources</li>
        <li data-step={ready ? 'done' : rendering ? 'current' : 'pending'}>Rendu 3D</li>
      </ol>
    </div>
  )
}
