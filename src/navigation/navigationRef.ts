import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef =
  createNavigationContainerRef<any>();

export const navigateToLogin = () => {
  if (!navigationRef.isReady()) {
    return;
  }

  navigationRef.reset({
    index: 0,
    routes: [
      {
        name: 'Login',
      },
    ],
  });
};