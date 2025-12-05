import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AvailabilityErrorCardProps {
  message: string;
  onTryDifferentTime?: () => void;
  onTryDifferentLocation?: () => void;
  onDismiss?: () => void;
}

export default function AvailabilityErrorCard({
  message,
  onTryDifferentTime,
  onTryDifferentLocation,
  onDismiss,
}: AvailabilityErrorCardProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="location-outline" size={48} color="#FF6B6B" />
      </View>
      <Text style={styles.title}>No Detailers Available</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.actions}>
        {onTryDifferentTime && (
          <TouchableOpacity style={styles.button} onPress={onTryDifferentTime}>
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <Text style={styles.buttonText}>Try Different Time</Text>
          </TouchableOpacity>
        )}
        {onTryDifferentLocation && (
          <TouchableOpacity style={styles.button} onPress={onTryDifferentLocation}>
            <Ionicons name="location-outline" size={20} color="#007AFF" />
            <Text style={styles.buttonText}>Try Different Location</Text>
          </TouchableOpacity>
        )}
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dismissText: {
    color: '#999',
    fontSize: 14,
  },
});

