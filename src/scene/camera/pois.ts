import {
  CRT_POSITION,
  DESK_POSITION,
  GUITAR_POSITION,
  LEGO_POSITION,
  ROBOT_MAT_CENTER,
  WORKBENCH_POSITION,
} from '@/scene/roomLayout'

export type PoiId = 'overview' | 'screen' | 'guitar' | 'workbench' | 'crt' | 'legos' | 'robot'

type Point = readonly [number, number, number]

export interface PoiConfig {
  pos: Point
  target: Point
  minDist: number
  maxDist: number
}

function offset([x, y, z]: Point, dx: number, dy: number, dz: number): Point {
  return [x + dx, y + dy, z + dz]
}

// Centre de la dalle après la calibration du moniteur et la rotation du bureau.
const screen = offset(DESK_POSITION, 0.025, 1.005, 0.09)
const robotMat: Point = [ROBOT_MAT_CENTER[0], 0, ROBOT_MAT_CENTER[1]]

export const POIS: Record<PoiId, PoiConfig> = {
  overview: {
    pos: [0, 1.98, 3.5],
    target: [0, 1.16, -2.05],
    minDist: 4.5,
    maxDist: 5.62,
  },
  screen: {
    pos: offset(screen, 0.58, 0.12, 0),
    target: screen,
    minDist: 0.42,
    maxDist: 0.69,
  },
  guitar: {
    pos: offset(GUITAR_POSITION, -0.97, 1.25, 0.99),
    target: offset(GUITAR_POSITION, -0.2, 0.72, 0.02),
    minDist: 1.15,
    maxDist: 1.4,
  },
  workbench: {
    pos: offset(WORKBENCH_POSITION, 0.25, 1.42, 1.66),
    target: offset(WORKBENCH_POSITION, 0, 0.86, -0.03),
    minDist: 1.03,
    maxDist: 1.93,
  },
  crt: {
    pos: offset(CRT_POSITION, -0.37, 1.18, 1.32),
    target: offset(CRT_POSITION, -0.13, 0.75, 0.17),
    minDist: 0.9,
    maxDist: 1.65,
  },
  legos: {
    pos: offset(LEGO_POSITION, 0.37, 1.37, 1.12),
    target: offset(LEGO_POSITION, 0, 0.52, 0),
    minDist: 0.94,
    maxDist: 1.75,
  },
  robot: {
    pos: offset(robotMat, -0.27, 1.39, 1.54),
    target: offset(robotMat, 0, 0.27, 0),
    minDist: 1.35,
    maxDist: 2.12,
  },
}
