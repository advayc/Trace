export interface HealthPermissions {
  readSteps: boolean;
  writeWorkouts: boolean;
}

export interface HealthStepSummary {
  date: string;
  steps: number;
}
