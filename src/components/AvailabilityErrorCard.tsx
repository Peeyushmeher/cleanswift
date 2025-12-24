import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

interface AvailabilityErrorCardProps {
  message: string;
  visible: boolean;
  onTryDifferentTime?: () => void;
  onTryDifferentLocation?: () => void;
  onDismiss?: () => void;
}

export default function AvailabilityErrorCard({
  message,
  visible,
  onTryDifferentTime,
  onTryDifferentLocation,
  onDismiss,
}: AvailabilityErrorCardProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={56} color={COLORS.accent.mint} />
            </View>
            <Text style={styles.title}>No Detailers Available</Text>
            <Text style={styles.message}>{message}</Text>
            <View style={styles.actions}>
              {onTryDifferentTime && (
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={onTryDifferentTime}
                  activeOpacity={0.8}
                >
                  <Ionicons name="time-outline" size={20} color={COLORS.accent.blue} />
                  <Text style={styles.buttonText}>Try Different Time</Text>
                </TouchableOpacity>
              )}
              {onTryDifferentLocation && (
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={onTryDifferentLocation}
                  activeOpacity={0.8}
                >
                  <Ionicons name="location-outline" size={20} color={COLORS.accent.blue} />
                  <Text style={styles.buttonText}>Try Different Location</Text>
                </TouchableOpacity>
              )}
            </View>
            {onDismiss && (
              <TouchableOpacity 
                style={styles.dismissButton} 
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.dismissText}>Dismiss</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  content: {
    backgroundColor: COLORS.bg.surface,
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.border.subtle,
    shadowColor: COLORS.shadow.default,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accentBg.blue10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border.accentBlue,
  },
  buttonText: {
    color: COLORS.accent.blue,
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dismissText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

