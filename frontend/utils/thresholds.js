// Configuration file for Gas Sensor Thresholds

export const GAS_THRESHOLDS = {
  SAFE: {
    min: 0,
    max: 849,
    label: "SAFE",
    color: "safe"
  },
  WARNING: {
    min: 850,
    max: 949,
    label: "DANGER",
    color: "danger"
  },
  DANGER: {
    min: 950,
    max: 10000,
    label: "CRITICAL",
    color: "danger",
    buzzer: true
  }
};

/**
 * Returns the threshold object matching the given gas value.
 * @param {number} value - Raw MQ-2 sensor reading (not calibrated ppm)
 */
export function getStatusFromValue(value) {
  if (value <= GAS_THRESHOLDS.SAFE.max) {
    return GAS_THRESHOLDS.SAFE;
  } else if (value <= GAS_THRESHOLDS.WARNING.max) {
    return GAS_THRESHOLDS.WARNING;
  } else {
    return GAS_THRESHOLDS.DANGER;
  }
}
