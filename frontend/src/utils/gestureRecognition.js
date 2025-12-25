/**
 * Gesture Recognition Utilities for ASL Alphabet
 * Uses simple geometry and finger positions to recognize hand gestures
 */

// Helper function to calculate Euclidean distance
const getDistance = (point1, point2) => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  const dz = (point1.z || 0) - (point2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

// Check if a finger is extended based on landmarks
const isFingerExtended = (landmarks, fingerTip, fingerDip, fingerPip, fingerMcp, wrist) => {
  const tipToWrist = getDistance(landmarks[fingerTip], landmarks[wrist]);
  const mcpToWrist = getDistance(landmarks[fingerMcp], landmarks[wrist]);
  return tipToWrist > mcpToWrist * 1.1;
};

// Check if thumb is extended
const isThumbExtended = (landmarks) => {
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];
  const indexMcp = landmarks[5];
  
  const tipToIndex = getDistance(thumbTip, indexMcp);
  const mcpToIndex = getDistance(thumbMcp, indexMcp);
  
  return tipToIndex > mcpToIndex * 1.2;
};

// Get finger states
const getFingerStates = (landmarks) => {
  return {
    thumb: isThumbExtended(landmarks),
    index: isFingerExtended(landmarks, 8, 7, 6, 5, 0),
    middle: isFingerExtended(landmarks, 12, 11, 10, 9, 0),
    ring: isFingerExtended(landmarks, 16, 15, 14, 13, 0),
    pinky: isFingerExtended(landmarks, 20, 19, 18, 17, 0)
  };
};

// Count extended fingers
const countExtendedFingers = (fingerStates) => {
  return Object.values(fingerStates).filter(Boolean).length;
};

// Calculate hand orientation
const getHandOrientation = (landmarks) => {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  
  const dx = middleMcp.x - wrist.x;
  const dy = middleMcp.y - wrist.y;
  
  return Math.atan2(dy, dx) * (180 / Math.PI);
};

// Recognize ASL gesture based on hand landmarks
export const recognizeGesture = (landmarks) => {
  if (!landmarks || landmarks.length < 21) {
    return { gesture: 'none', confidence: 0 };
  }

  const fingerStates = getFingerStates(landmarks);
  const extendedCount = countExtendedFingers(fingerStates);
  const orientation = getHandOrientation(landmarks);
  
  // Check if hand is in a fist (all fingers closed)
  if (extendedCount === 0) {
    return { gesture: 'A', confidence: 0.85, description: 'Closed fist' };
  }
  
  // Check for specific letter patterns
  
  // Letter B - All fingers extended together except thumb
  if (!fingerStates.thumb && fingerStates.index && fingerStates.middle && 
      fingerStates.ring && fingerStates.pinky) {
    const fingersTogether = checkFingersTogether(landmarks, [8, 12, 16, 20]);
    if (fingersTogether) {
      return { gesture: 'B', confidence: 0.90, description: 'Flat hand, thumb tucked' };
    }
  }
  
  // Letter C - Curved hand shape
  if (extendedCount === 5) {
    const curvature = checkHandCurvature(landmarks);
    if (curvature > 0.3 && curvature < 0.7) {
      return { gesture: 'C', confidence: 0.80, description: 'Curved hand' };
    }
  }
  
  // Letter D - Index finger up, thumb and other fingers form O
  if (fingerStates.index && !fingerStates.middle && !fingerStates.ring && !fingerStates.pinky) {
    const thumbToIndex = getDistance(landmarks[4], landmarks[8]);
    if (thumbToIndex < 0.1) {
      return { gesture: 'D', confidence: 0.85, description: 'Index up, others form O' };
    }
  }
  
  // Letter F - Index and thumb form O, other fingers extended
  if (fingerStates.middle && fingerStates.ring && fingerStates.pinky) {
    const thumbToIndex = getDistance(landmarks[4], landmarks[8]);
    if (thumbToIndex < 0.08) {
      return { gesture: 'F', confidence: 0.88, description: 'OK sign with three fingers up' };
    }
  }
  
  // Letter I - Only pinky extended
  if (!fingerStates.thumb && !fingerStates.index && !fingerStates.middle && 
      !fingerStates.ring && fingerStates.pinky) {
    return { gesture: 'I', confidence: 0.90, description: 'Pinky up' };
  }
  
  // Letter L - Thumb and index extended at 90 degrees
  if (fingerStates.thumb && fingerStates.index && !fingerStates.middle && 
      !fingerStates.ring && !fingerStates.pinky) {
    const angle = calculateAngleBetweenFingers(landmarks, 4, 8);
    if (angle > 70 && angle < 110) {
      return { gesture: 'L', confidence: 0.92, description: 'L shape' };
    }
  }
  
  // Letter O - All fingers form a circle
  if (extendedCount >= 4) {
    const thumbToIndex = getDistance(landmarks[4], landmarks[8]);
    if (thumbToIndex < 0.06) {
      return { gesture: 'O', confidence: 0.85, description: 'Circle shape' };
    }
  }
  
  // Letter V - Index and middle extended, others closed
  if (fingerStates.index && fingerStates.middle && !fingerStates.ring && !fingerStates.pinky) {
    const separation = getDistance(landmarks[8], landmarks[12]);
    if (separation > 0.08) {
      return { gesture: 'V', confidence: 0.90, description: 'Peace sign' };
    }
  }
  
  // Letter Y - Thumb and pinky extended
  if (fingerStates.thumb && !fingerStates.index && !fingerStates.middle && 
      !fingerStates.ring && fingerStates.pinky) {
    return { gesture: 'Y', confidence: 0.88, description: 'Shaka sign' };
  }
  
  // Number signs
  if (extendedCount === 1 && fingerStates.index) {
    return { gesture: '1', confidence: 0.85, description: 'One finger' };
  }
  
  if (extendedCount === 2 && fingerStates.index && fingerStates.middle) {
    return { gesture: '2', confidence: 0.85, description: 'Two fingers' };
  }
  
  if (extendedCount === 3 && fingerStates.thumb && fingerStates.index && fingerStates.middle) {
    return { gesture: '3', confidence: 0.85, description: 'Three fingers' };
  }
  
  if (extendedCount === 4 && !fingerStates.thumb) {
    return { gesture: '4', confidence: 0.85, description: 'Four fingers' };
  }
  
  if (extendedCount === 5) {
    return { gesture: '5', confidence: 0.85, description: 'Open hand' };
  }
  
  // Default - unknown gesture
  return { 
    gesture: 'unknown', 
    confidence: 0.3, 
    description: `${extendedCount} fingers extended` 
  };
};

// Helper: Check if fingers are close together
const checkFingersTogether = (landmarks, fingerTips) => {
  for (let i = 0; i < fingerTips.length - 1; i++) {
    const distance = getDistance(landmarks[fingerTips[i]], landmarks[fingerTips[i + 1]]);
    if (distance > 0.08) return false;
  }
  return true;
};

// Helper: Calculate hand curvature
const checkHandCurvature = (landmarks) => {
  const wrist = landmarks[0];
  const middleMcp = landmarks[9];
  const middleTip = landmarks[12];
  
  const baseLength = getDistance(wrist, middleMcp);
  const tipDistance = getDistance(middleMcp, middleTip);
  const directDistance = getDistance(wrist, middleTip);
  
  const totalPath = baseLength + tipDistance;
  return 1 - (directDistance / totalPath);
};

// Helper: Calculate angle between two fingers
const calculateAngleBetweenFingers = (landmarks, tip1, tip2) => {
  const wrist = landmarks[0];
  const finger1 = landmarks[tip1];
  const finger2 = landmarks[tip2];
  
  const v1x = finger1.x - wrist.x;
  const v1y = finger1.y - wrist.y;
  const v2x = finger2.x - wrist.x;
  const v2y = finger2.y - wrist.y;
  
  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
  
  const cosAngle = dot / (mag1 * mag2);
  return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
};

// Smooth gesture predictions over time to reduce jitter
export class GestureSmoother {
  constructor(windowSize = 5, confidenceThreshold = 0.7) {
    this.windowSize = windowSize;
    this.confidenceThreshold = confidenceThreshold;
    this.history = [];
  }

  addPrediction(prediction) {
    this.history.push(prediction);
    if (this.history.length > this.windowSize) {
      this.history.shift();
    }
  }

  getStableGesture() {
    if (this.history.length < 3) {
      return { gesture: 'none', confidence: 0 };
    }

    // Count occurrences of each gesture
    const gestureCounts = {};
    let totalConfidence = {};

    this.history.forEach(pred => {
      if (pred.confidence >= this.confidenceThreshold) {
        gestureCounts[pred.gesture] = (gestureCounts[pred.gesture] || 0) + 1;
        totalConfidence[pred.gesture] = (totalConfidence[pred.gesture] || 0) + pred.confidence;
      }
    });

    // Find most common gesture
    let maxCount = 0;
    let stableGesture = 'none';
    let avgConfidence = 0;

    Object.entries(gestureCounts).forEach(([gesture, count]) => {
      if (count > maxCount) {
        maxCount = count;
        stableGesture = gesture;
        avgConfidence = totalConfidence[gesture] / count;
      }
    });

    // Require at least 60% of recent predictions to agree
    if (maxCount >= Math.ceil(this.history.length * 0.6)) {
      return { 
        gesture: stableGesture, 
        confidence: avgConfidence,
        stability: maxCount / this.history.length
      };
    }

    return { gesture: 'none', confidence: 0, stability: 0 };
  }

  reset() {
    this.history = [];
  }
}
