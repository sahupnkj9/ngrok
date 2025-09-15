import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f1f5f9', '#e2e8f0']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.spinner}>
            <View style={styles.spinnerInner} />
          </View>
          <Text style={styles.message}>{message}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  spinner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#e2e8f0',
    borderTopColor: '#4f46e5',
    marginBottom: 16,
  },
  spinnerInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  message: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});