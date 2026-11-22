export type SkyViewBox = {
  width: number
  height: number
  /** Y of the horizon line. */
  horizonY: number
  /** Left/right inset for the day span. */
  paddingX: number
  /**
   * Keep sun disc/glow inside the viewBox.
   * Should be >= rendered sun glow radius.
   */
  safeInset: number
  /** Altitude (°) that maps to the top of the drawable sky. */
  maxAltitudeDegrees: number
}

export type SkyPoint = {
  x: number
  y: number
  belowHorizon: boolean
}

export type ProjectSunInput = {
  altitudeDegrees: number
  /** 0 = local midnight, 1 = next local midnight. */
  dayProgress: number
  view?: Partial<SkyViewBox>
}
