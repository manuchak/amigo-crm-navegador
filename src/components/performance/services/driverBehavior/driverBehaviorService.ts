
// This file serves as the main entry point for the driver behavior service
// It re-exports all functionality from the specialized service files

import { fetchDriverBehaviorData, fetchClientList } from './dataService';
import { importDriverBehaviorData } from './importService';
import { 
  fetchDriverGroups, 
  fetchDriversByClient, 
  createDriverGroup, 
  updateDriverGroup, 
  deleteDriverGroup 
} from './driverGroupsService';

export {
  fetchDriverBehaviorData,
  fetchClientList,
  importDriverBehaviorData,
  // Driver groups
  fetchDriverGroups,
  fetchDriversByClient,
  createDriverGroup,
  updateDriverGroup,
  deleteDriverGroup
};
