import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="auth" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="scan-qr" />
      <Stack.Screen name="attendance-report" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}