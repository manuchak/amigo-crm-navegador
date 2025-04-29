
// This file serves as the main entry point for the driver behavior service
// It re-exports all functionality from the specialized service files

import { fetchDriverBehaviorData, fetchClientList } from './dataService';
import { importDriverBehaviorData } from './importService';

export {
  fetchDriverBehaviorData,
  fetchClientList,
  importDriverBehaviorData
};
