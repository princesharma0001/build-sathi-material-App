import { GoogleSignin } from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId:
    "330213964583-6k5h3al6akor36ceu7dmn0aoibu2cs6p.apps.googleusercontent.com",
  offlineAccess: false,
});

export default GoogleSignin;

export const GOOGLE_WEB_CLIENT_ID =
  "330213964583-6k5h3al6akor36ceu7dmn0aoibu2cs6p.apps.googleusercontent.com";
