import { Redirect } from 'expo-router';

export default function Index() {
  // The _layout.tsx handles the actual authentication check and routing.
  // This file simply provides a default index route for Expo Router to match against
  // so it doesn't throw a "Page could not be found" error on startup.
  return <Redirect href="/(auth)/login" />;
}
