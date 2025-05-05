
export interface UserManagementHookProps {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  refreshUserData: () => Promise<void>;
}
