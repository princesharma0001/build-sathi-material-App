import AsyncStorage from '@react-native-async-storage/async-storage';

export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
};

export const clearAuthSession2 = async () => {
  try {
    await AsyncStorage.multiRemove([
      '@buildsathi_token',
      '@buildsathi_user',
    ]);

    console.log('Auth session cleared successfully');
  } catch (error) {
    console.log('Error clearing auth session:', error);
    throw error;
  }
};