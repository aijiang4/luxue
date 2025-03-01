import { useRef } from 'react';
import { useUserStoreShallow } from '@refly-packages/ai-workspace-common/stores/user';
import { safeParseJSON } from '@refly-packages/ai-workspace-common/utils/parse';

export const useIsLogin = () => {
  const isLoggedRef = useRef<boolean>(false);
  const userStore = useUserStoreShallow((state) => ({
    userProfile: state.userProfile,
  }));

  // Get storage user profile
  const storageUserProfile = safeParseJSON(localStorage.getItem('refly-user-profile'));
  isLoggedRef.current = storageUserProfile?.uid || userStore?.userProfile?.uid;

  return {
    isLoggedRef,
  };
};
