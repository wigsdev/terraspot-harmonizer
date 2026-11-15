/**
 * T-11 Deployment & Build Optimization Contracts
 * TerraSpot Harmonizer - NASA Space Apps Challenge 2026
 */

export interface DeploymentConfig {
  /** Production target provider */
  provider: 'vercel' | 'github-pages';
  /** Primary mission domain (GoDaddy Registry / Porkbun) */
  customDomain?: string;
  /** Edge fallback domain */
  fallbackDomain: string;
  /** HTTPS enabled without authentication */
  publicAccessEnforced: boolean;
  /** Security headers applied */
  securityHeaders: Record<string, string>;
}

export interface BuildMetricsReport {
  /** Maximum chunk size in kB */
  maxChunkSizeKB: number;
  /** Total bundle size in kB */
  totalBundleSizeKB: number;
  /** Number of generated assets */
  chunkCount: number;
  /** Zero build warnings achieved */
  hasZeroWarnings: boolean;
}
