export enum RiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical',
  }
  
  export enum RiskDecision {
    ALLOW = 'allow',
    CHALLENGE = 'challenge',
    STEP_UP = 'step_up',
    DENY = 'deny',
  }
  
  export interface RiskContext {
    userExists: boolean;
    fingerprintKnown: boolean;
    ipVelocity: number;
    failedAttempts: number;
    tokenAnomaly?: boolean;
    sessionAnomaly?: boolean;
  }
  
  export interface RiskResult {
    level: RiskLevel;
    decision: RiskDecision;
    requiredMethods: string[];
  }