import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../features/auth/screens/LoginScreen";
import RegisterScreen from "../features/auth/screens/RegisterScreen";
import OTPScreen from "../features/auth/screens/OTPScreen";
import SelectRoleScreen from "../features/auth/screens/SelectRoleScreen";

import { AuthStackParamList } from "./types";
import SplashScreen from "../features/auth/screens/SplashScreen";
import ForgotPasswordScreen from "../features/auth/screens/ForgotPasswordScreen";
import VerifyForgotPasswordOtpScreen from "../features/auth/screens/VerifyForgotPasswordOtpScreen";
import ResetPasswordScreen from "../features/auth/screens/ResetPasswordScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OTP" component={OTPScreen} />
      <Stack.Screen name="SelectRole" component={SelectRoleScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

      <Stack.Screen
        name="VerifyForgotPasswordOtp"
        component={VerifyForgotPasswordOtpScreen}
      />

      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
