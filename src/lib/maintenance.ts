import maintenanceData from '../data/maintenance.json';

export type MaintenanceMode = 'off' | 'soft' | 'full';

export interface MaintenanceConfig {
  mode: MaintenanceMode;
  softMessage: string;
  fullTitle: string;
  fullMessage: string;
  fullSubtext?: string;
  estimatedTime?: string;
  discordUrl?: string;
  githubUrl?: string;
}

export function getMaintenanceConfig(): MaintenanceConfig {
  const envMode = (
    (typeof process !== 'undefined' && (process.env.PUBLIC_MAINTENANCE_MODE || process.env.MAINTENANCE_MODE)) ||
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_MAINTENANCE_MODE)
  ) as MaintenanceMode | undefined;

  const rawMode = envMode || maintenanceData.mode;
  const mode: MaintenanceMode = (rawMode === 'full' || rawMode === 'soft') ? rawMode : 'off';

  return {
    ...maintenanceData,
    mode
  };
}
