export function formatConfidence(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  let confidence = Number(value);

  if (Number.isNaN(confidence)) {
    return "—";
  }

  // If backend sends 0.94, convert to 94
  if (confidence >= 0 && confidence <= 1) {
    confidence = confidence * 100;
  }

  // Keep value between 0 and 100
  confidence = Math.min(
    100,
    Math.max(0, confidence)
  );

  return `${confidence.toFixed(1)}%`;
}

export function getConfidenceLevel(value) {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "unknown";
  }

  let confidence = Number(value);

  if (confidence <= 1) {
    confidence *= 100;
  }

  if (confidence >= 80) {
    return "high";
  }

  if (confidence >= 50) {
    return "medium";
  }

  return "low";
}

export function getConfidenceClass(value) {
  const level = getConfidenceLevel(value);

  return `confidence-${level}`;
}