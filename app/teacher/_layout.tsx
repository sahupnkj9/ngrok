import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="generate-qr" />
      <Stack.Screen name="attendance-reports" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}