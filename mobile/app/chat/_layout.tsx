import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack screenOptions={{ headerTintColor: 'blue' }}>
      {/* This Stack will wrap every page in the app */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
