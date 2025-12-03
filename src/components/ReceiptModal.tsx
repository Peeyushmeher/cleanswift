import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReceipt } from '../contexts/ReceiptContext';
import ReceiptRatingScreen from '../screens/booking/ReceiptRatingScreen';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ReceiptModal() {
  const { visible, bookingId, hideReceipt } = useReceipt();
  const insets = useSafeAreaInsets();

  if (!bookingId || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={hideReceipt}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalContainer, { maxHeight: SCREEN_HEIGHT - insets.top - insets.bottom - 32 }]}>
          <TouchableOpacity
            onPress={hideReceipt}
            style={styles.closeButton}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#C6CFD9" />
          </TouchableOpacity>
          <View style={styles.contentContainer}>
            <ReceiptRatingScreen
              bookingId={bookingId}
              onClose={hideReceipt}
              isModal={true}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 11, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: Math.min(SCREEN_WIDTH - 32, 500),
    height: '90%',
    maxHeight: 700,
    minHeight: 400,
    backgroundColor: '#030B18',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(198,207,217,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
});
