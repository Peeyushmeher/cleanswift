import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { EditCarCard, type Car } from '../../components/EditCarCard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ProfileStackParamList } from '../../navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'SelectCar'>;

export default function SelectCarScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [savedCars, setSavedCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Fetch cars from database
  useEffect(() => {
    const fetchCars = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data: cars, error } = await supabase
          .from('cars')
          .select('*')
          .eq('user_id', user.id)
          .order('is_primary', { ascending: false })
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching cars:', error);
          Alert.alert('Error', 'Failed to load cars');
          return;
        }

        const mappedCars: Car[] = (cars || []).map(car => ({
          id: car.id,
          make: car.make,
          model: car.model,
          year: car.year,
          trim: car.trim || undefined,
          license_plate: car.license_plate,
          color: car.color || undefined,
        }));

        setSavedCars(mappedCars);
        if (mappedCars.length > 0 && !selectedCar) {
          setSelectedCar(mappedCars[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch cars:', error);
        Alert.alert('Error', 'Failed to load cars');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCars();
  }, [user]);

  const handleEditCar = (carId: string) => {
    const car = savedCars.find(c => c.id === carId);
    if (car) {
      setEditingCar(car);
      setIsEditModalVisible(true);
    }
  };

  const handleSaveCar = async (updatedCar: Car) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cars')
        .update({
          make: updatedCar.make,
          model: updatedCar.model,
          year: updatedCar.year,
          trim: updatedCar.trim || null,
          license_plate: updatedCar.license_plate,
          color: updatedCar.color || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', updatedCar.id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setSavedCars(prev => prev.map(c => c.id === updatedCar.id ? updatedCar : c));
      Alert.alert('Success', 'Car updated successfully');
    } catch (error) {
      console.error('Error updating car:', error);
      Alert.alert('Error', 'Failed to update car');
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setSavedCars(prev => {
        const updated = prev.filter(c => c.id !== carId);
        // Update selected car if the deleted one was selected
        if (selectedCar === carId) {
          setSelectedCar(updated.length > 0 ? updated[0].id : null);
        }
        return updated;
      });
      Alert.alert('Success', 'Car deleted successfully');
    } catch (error) {
      console.error('Error deleting car:', error);
      Alert.alert('Error', 'Failed to delete car');
    }
  };

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
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading cars...</Text>
              </View>
            ) : savedCars.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No cars added yet</Text>
              </View>
            ) : (
              savedCars.map((car) => {
                const isSelected = selectedCar === car.id;
                const carDisplayName = `${car.year} ${car.make} ${car.model}`;

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

                    {/* Edit Button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleEditCar(car.id);
                      }}
                      activeOpacity={0.7}
                      style={styles.cardEditButton}
                    >
                      <Ionicons name="create-outline" size={20} color="#6FF0C4" />
                    </TouchableOpacity>

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
                      <Text style={styles.carModel}>{carDisplayName}</Text>
                      <View style={styles.carDetailsContainer}>
                        {car.trim && <Text style={styles.carDetail}>{car.trim}</Text>}
                        <Text style={styles.carDetail}>License: {car.license_plate}</Text>
                        {car.color && <Text style={styles.carDetail}>{car.color}</Text>}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
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
        <View style={[styles.bottomCTA, { bottom: Math.max(insets.bottom, 8) + 68 }]}>
          <View style={styles.buttonSafeArea}>
            <TouchableOpacity
              onPress={handleContinue}
              activeOpacity={0.8}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Edit Car Modal */}
        <EditCarCard
          car={editingCar}
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setEditingCar(null);
          }}
          onSave={handleSaveCar}
          onDelete={handleDeleteCar}
        />
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
    flex: 1,
    color: '#F5F7FA',
    fontSize: 28,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#C6CFD9',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#C6CFD9',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120,
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
    left: 24,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#6FF0C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEditButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(111,240,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  buttonSafeArea: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
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
