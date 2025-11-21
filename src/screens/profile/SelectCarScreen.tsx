import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SelectCar'>;

const savedCars = [
  {
    id: '1',
    model: '2022 BMW M4',
    details: 'Competition Package',
    license: 'ABC-123',
    color: 'Black Sapphire Metallic',
  },
  {
    id: '2',
    model: '2021 Tesla Model 3',
    details: 'Performance',
    license: 'XYZ-789',
    color: 'Pearl White Multi-Coat',
  },
  {
    id: '3',
    model: '2023 Porsche 911',
    details: 'Carrera S',
    license: 'POR-911',
    color: 'GT Silver Metallic',
  },
];

export default function SelectCarScreen({ navigation }: Props) {
  const [selectedCar, setSelectedCar] = useState<string>('1');

  const handleContinue = () => {
    // TODO: Pass selected car to next screen
    console.log('Selected car:', selectedCar);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Your Car</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Vehicle Cards */}
          <View style={styles.cardsContainer}>
            {savedCars.map((car) => {
              const isSelected = selectedCar === car.id;

              return (
                <TouchableOpacity
                  key={car.id}
                  onPress={() => setSelectedCar(car.id)}
                  activeOpacity={isSelected ? 1 : 0.8}
                  style={[
                    styles.carCard,
                    isSelected && styles.carCardSelected,
                  ]}
                >
                  {/* Selection Checkmark */}
                  {isSelected && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark" size={16} color="#050B12" />
                    </View>
                  )}

                  {/* Car Icon */}
                  <View style={styles.carIconContainer}>
                    <Ionicons
                      name="car-sport"
                      size={56}
                      color={isSelected ? '#6FF0C4' : '#1DA4F3'}
                    />
                  </View>

                  {/* Car Info */}
                  <View>
                    <Text style={styles.carModel}>{car.model}</Text>
                    <View style={styles.carDetailsContainer}>
                      <Text style={styles.carDetail}>{car.details}</Text>
                      <Text style={styles.carDetail}>License: {car.license}</Text>
                      <Text style={styles.carDetail}>{car.color}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add Car Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddCar')}
            activeOpacity={0.8}
            style={styles.addCarCard}
          >
            <View style={styles.addCarContent}>
              <View style={styles.addCarIconContainer}>
                <Ionicons name="add" size={32} color="#6FF0C4" />
              </View>
              <Text style={styles.addCarText}>Add a Car</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomCTA}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.8}
            style={styles.continueButton}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B12',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  carCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  carCardSelected: {
    borderWidth: 2,
    borderColor: '#6FF0C4',
    shadowColor: '#6FF0C4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6FF0C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carIconContainer: {
    marginBottom: 24,
  },
  carModel: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  carDetailsContainer: {
    gap: 6,
  },
  carDetail: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  addCarCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.3)',
    borderStyle: 'dashed',
  },
  addCarContent: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  addCarIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(111,240,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCarText: {
    color: '#6FF0C4',
    fontSize: 17,
    fontWeight: '600',
  },
  bottomCTA: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#050B12',
  },
  continueButton: {
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1DA4F3',
    borderRadius: 28,
    shadowColor: '#1DA4F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
