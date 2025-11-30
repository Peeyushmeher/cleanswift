import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserAddresses, type UserAddress } from '../../hooks/useUserAddresses';
import { ProfileStackParamList } from '../../navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ManageAddresses'>;

const formatAddress = (address: UserAddress): string => {
  const parts = [
    address.address_line1,
    address.address_line2,
    `${address.city}, ${address.province} ${address.postal_code}`,
  ].filter(Boolean);
  return parts.join(', ');
};

export default function ManageAddressesScreen({ navigation }: Props) {
  const { addresses, loading, error, deleteAddress, setDefaultAddress, fetchAddresses } = useUserAddresses();

  const handleDelete = async (address: UserAddress) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete "${address.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddress(address.id);
              Alert.alert('Success', 'Address deleted successfully');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (address: UserAddress) => {
    if (address.is_default) return;

    try {
      await setDefaultAddress(address.id);
      Alert.alert('Success', `"${address.name}" is now your default address`);
    } catch (err) {
      Alert.alert('Error', 'Failed to set default address');
    }
  };

  const handleEdit = (address: UserAddress) => {
    navigation.navigate('AddEditAddress', { addressId: address.id });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Addresses</Text>
          </View>
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#6FF0C4" />
            <Text style={styles.loadingText}>Loading addresses...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage Addresses</Text>
          </View>
          <View style={styles.centerState}>
            <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Something went wrong</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {error.message?.includes('table not found') || error.message?.includes('does not exist') ? (
              <View style={styles.migrationHint}>
                <Text style={styles.migrationHintText}>
                  The address table hasn't been created yet.{'\n'}
                  Please run the database migration:{'\n'}
                  <Text style={styles.migrationFileName}>20250125000002_create_user_addresses.sql</Text>
                </Text>
              </View>
            ) : null}
            <TouchableOpacity onPress={fetchAddresses} activeOpacity={0.85} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Manage Addresses</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Address Cards */}
          <View style={styles.cardsContainer}>
            {addresses.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="location-outline" size={64} color="#C6CFD9" style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No Addresses Yet</Text>
                <Text style={styles.emptySubtitle}>Add your first address to get started</Text>
              </View>
            ) : (
              addresses.map((address) => (
                <View key={address.id} style={styles.addressCard}>
                  {/* Edit Button */}
                  <TouchableOpacity
                    onPress={() => handleEdit(address)}
                    activeOpacity={0.7}
                    style={styles.cardEditButton}
                  >
                    <Ionicons name="create-outline" size={20} color="#6FF0C4" />
                  </TouchableOpacity>

                  {/* Address Icon with Default Badge */}
                  <View style={styles.addressIconContainer}>
                    <View style={styles.addressIconWrapper}>
                      <Ionicons name="location" size={32} color="#1DA4F3" />
                      {address.is_default && (
                        <View style={styles.defaultBadge}>
                          <Ionicons name="star" size={12} color="#050B12" />
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Address Info */}
                  <View style={styles.addressInfo}>
                    <Text style={styles.addressName}>{address.name}</Text>
                    <Text style={styles.addressText}>{formatAddress(address)}</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsContainer}>
                    {!address.is_default && (
                      <TouchableOpacity
                        onPress={() => handleSetDefault(address)}
                        activeOpacity={0.7}
                        style={styles.actionButton}
                      >
                        <Ionicons name="star-outline" size={18} color="#6FF0C4" />
                        <Text style={styles.actionButtonText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => handleDelete(address)}
                      activeOpacity={0.7}
                      style={[styles.actionButton, styles.deleteButton]}
                    >
                      <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
                      <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Add Address Card */}
          <TouchableOpacity
            onPress={() => navigation.navigate('AddEditAddress')}
            activeOpacity={0.8}
            style={styles.addAddressCard}
          >
            <View style={styles.addAddressContent}>
              <View style={styles.addAddressIconContainer}>
                <Ionicons name="add" size={32} color="#6FF0C4" />
              </View>
              <Text style={styles.addAddressText}>Add New Address</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  loadingText: {
    color: '#C6CFD9',
    fontSize: 15,
  },
  errorTitle: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
  },
  errorMessage: {
    color: '#C6CFD9',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1DA4F3',
  },
  retryButtonText: {
    color: '#1DA4F3',
    fontWeight: '600',
  },
  migrationHint: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(255,165,0,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,165,0,0.3)',
    maxWidth: '90%',
  },
  migrationHintText: {
    color: '#C6CFD9',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  migrationFileName: {
    fontFamily: 'monospace',
    color: '#FFA500',
    fontWeight: '600',
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  addressCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    position: 'relative',
  },
  addressIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6FF0C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    color: '#050B12',
    fontSize: 11,
    fontWeight: '600',
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
  addressIconContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  addressInfo: {
    marginBottom: 16,
  },
  addressName: {
    color: '#F5F7FA',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressText: {
    color: '#C6CFD9',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(111,240,196,0.1)',
  },
  actionButtonText: {
    color: '#6FF0C4',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: 'rgba(255,107,107,0.1)',
  },
  deleteButtonText: {
    color: '#FF6B6B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#F5F7FA',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#C6CFD9',
    fontSize: 15,
    textAlign: 'center',
  },
  addAddressCard: {
    width: '100%',
    backgroundColor: '#0A1A2F',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: 'rgba(111,240,196,0.3)',
    borderStyle: 'dashed',
  },
  addAddressContent: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 16,
  },
  addAddressIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(111,240,196,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addAddressText: {
    color: '#6FF0C4',
    fontSize: 17,
    fontWeight: '600',
  },
});

