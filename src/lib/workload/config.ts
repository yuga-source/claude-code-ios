// Centralized, tunable workload parameters.
// Adjust caps / weights / thresholds here without touching scoring logic.
export const WORKLOAD_CONFIG = {
  // Only consider open tasks due within this window (or undated).
  windowDays: 14,

  // Reference caps used to normalize each raw metric to 0..1.
  caps: {
    count: 10, // open tasks
    effort: 40, // estimated hours
    deadline: 12, // sum of deadline weights
  },

  // Blend weights for the four metrics (should sum to 1).
  weights: {
    count: 0.3,
    effort: 0.3,
    deadline: 0.2,
    subjective: 0.2,
  },

  // Score (0..1) cutoffs between load levels.
  thresholds: {
    relaxed: 0.3, // < relaxed       -> RELAXED
    normal: 0.55, // < normal        -> NORMAL
    high: 0.8, // < high / >= normal -> HIGH ; >= high -> OVERLOADED
  },
} as const;
