import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: string;
  trim?: string;
  license_plate: string;
  color?: string;
}

interface EditCarCardProps {
  car: Car | null;
  visible: boolean;
  onClose: () => void;
  onSave: (car: Car) => void;
  onDelete: (carId: string) => void;
}

export function EditCarCard({
  car,
  visible,
  onClose,
  onSave,
  onDelete,
}: EditCarCardProps) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    license_plate: '',
    color: '',
  });

  // Update form data when car changes
  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make || '',
        model: car.model || '',
        year: car.year || '',
        trim: car.trim || '',
        license_plate: car.license_plate || '',
        color: car.color || '',
      });
    }
  }, [car]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!car) return;
    
    if (!formData.make || !formData.model || !formData.year || !formData.license_plate) {
      Alert.alert('Validation Error', 'Please fill in all required fields (Make, Model, Year, License Plate)');
      return;
    }

    onSave({
      ...car,
      ...formData,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!car) return;

    Alert.alert(
      'Delete Car',
      'Are you sure you want to delete this car? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(car.id);
            onClose();
          },
        },
      ]
    );
  };

  if (!car) return null;

  const carDisplayName = `${formData.year || car.year} ${formData.make || car.make} ${formData.model || car.model}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color="#C6CFD9" />
          </TouchableOpacity>

          {/* Car Icon and Title */}
          <View style={styles.headerContainer}>
            <View style={styles.carIconContainer}>
              <Ionicons name="car-sport" size={56} color="#1DA4F3" />
            </View>
            <Text style={styles.carTitle}>{carDisplayName}</Text>
            {formData.trim && (
              <Text style={styles.carSubtitle}>{formData.trim}</Text>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Make</Text>
              <TextInput
                placeholder="e.g., BMW"
                value={formData.make}
                onChangeText={(value) => updateField('make', value)}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                placeholder="e.g., M4"
                value={formData.model}
                onChangeText={(value) => updateField('model', value)}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Year</Text>
              <TextInput
                placeholder="e.g., 2022"
                value={formData.year}
                onChangeText={(value) => updateField('year', value)}
                keyboardType="numeric"
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Trim <Text style={styles.optionalLabel}>(Optional)</Text>
              </Text>
              <TextInput
                placeholder="e.g., Competition Package"
                value={formData.trim}
                onChangeText={(value) => updateField('trim', value)}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>License Plate</Text>
              <TextInput
                placeholder="e.g., ABC-123"
                value={formData.license_plate}
                onChangeText={(value) => updateField('license_plate', value)}
                autoCapitalize="characters"
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>
                Color <Text style={styles.optionalLabel}>(Optional)</Text>
              </Text>
              <TextInput
                placeholder="e.g., Black Sapphire Metallic"
                value={formData.color}
                onChangeText={(value) => updateField('color', value)}
                placeholderTextColor="rgba(198,207,217,0.5)"
                style={styles.input}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.ctaGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.85}
              onPress={handleSave}
            >
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              activeOpacity={0.85}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              <Text style={styles.deleteButtonText}>Delete Car</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
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
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    maxHeight: '90%',
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
    zIndex: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  carIconContainer: {
    marginBottom: 16,
  },
  carTitle: {
    color: '#F5F7FA',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  carSubtitle: {
    color: '#C6CFD9',
    fontSize: 15,
    textAlign: 'center',
  },
  formSection: {
    gap: 16,
    marginBottom: 24,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    color: '#C6CFD9',
    fontSize: 14,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  optionalLabel: {
    color: 'rgba(198,207,217,0.5)',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(5,11,18,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(198,207,217,0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#F5F7FA',
    fontSize: 16,
  },
  ctaGroup: {
    marginTop: 8,
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#1DA4F3',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,107,107,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.3)',
    gap: 8,
  },
  deleteButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#C6CFD9',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default EditCarCard;

