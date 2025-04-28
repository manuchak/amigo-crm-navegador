
import { ChartConfig } from "./types";

/**
 * Gets the configuration for a specific payload item from the chart config
 */
export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: any,
  key: string
) {
  let itemConfig: undefined | ChartConfig[keyof ChartConfig];

  // Try to find the config using the given key
  itemConfig = config[key as keyof typeof config] || 
               config[payload.dataKey || ""] || 
               config[payload.name || ""];

  // If still not found, try to match against all available keys in config
  if (!itemConfig) {
    const configKey = Object.keys(config).find(
      (k) => k === key || k === payload.dataKey || k === payload.name
    );
    if (configKey) {
      itemConfig = config[configKey];
    }
  }

  return itemConfig;
}

/**
 * Helper to format chart data
 */
export function formatChartValue(value: any): string {
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  return String(value || '');
}
