import firebase from "@react-native-firebase/app";

export function ensureFirebaseApp() {
  if (!firebase.apps.length) {
    throw new Error(
      "Firebase native app is not initialized. Check google-services.json / GoogleService-Info.plist and rebuild the app."
    );
  }

  return firebase.app();
}