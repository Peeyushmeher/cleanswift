import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OrdersStackParamList } from '../../navigation/OrdersStack';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrdersHistory'>;

const orders = [
  {
    id: '1',
    service: 'Full Exterior Detail',
    car: '2022 BMW M4',
    license: 'ABC-123',
    date: 'Nov 16, 2:42 PM',
    price: '$213.57',
    status: 'completed',
  },
  {
    id: '2',
    service: 'Quick Wash',
    car: '2022 BMW M4',
    license: 'ABC-123',
    date: 'Nov 10, 11:30 AM',
    price: '$45.00',
    status: 'completed',
  },
  {
    id: '3',
    service: 'Interior Detail',
    car: '2021 Tesla Model 3',
    license: 'XYZ-789',
    date: 'Nov 3, 4:15 PM',
    price: '$120.00',
    status: 'completed',
  },
  {
    id: '4',
    service: 'Full Detail',
    car: '2023 Porsche 911',
    license: 'POR-911',
    date: 'Oct 28, 1:00 PM',
    price: '$285.00',
    status: 'completed',
  },
  {
    id: '5',
    service: 'Exterior Wash',
    car: '2022 BMW M4',
    license: 'ABC-123',
    date: 'Oct 15, 9:45 AM',
    price: '$65.00',
    status: 'canceled',
  },
];

export default function OrdersHistoryScreen({ navigation }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#6FF0C4';
      case 'scheduled':
        return '#1DA4F3';
      case 'in-progress':
        return '#6FF0C4';
      case 'canceled':
        return '#C6CFD9';
      default:
        return '#C6CFD9';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#6FF0C4';
      case 'scheduled':
        return '#1DA4F3';
      case 'in-progress':
        return '#6FF0C4';
      case 'canceled':
        return '#C6CFD9';
      default:
        return '#C6CFD9';
    }
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
          <Text style={styles.headerTitle}>Your Bookings</Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {orders.length > 0 ? (
          <View style={styles.ordersContainer}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => navigation.navigate('OrderDetails', { orderId: order.id })}
                activeOpacity={0.8}
                style={styles.orderCard}
              >
                <View style={styles.orderContent}>
                  {/* Car Icon */}
                  <View style={styles.carIconContainer}>
                    <Ionicons name="car-sport" size={24} color="#1DA4F3" />
                  </View>

                  {/* Order Info */}
                  <View style={styles.orderInfo}>
                    <View style={styles.orderHeader}>
                      <Text style={styles.serviceName}>{order.service}</Text>
                      <Text style={styles.price}>{order.price}</Text>
                    </View>

                    <Text style={styles.carDetails}>
                      {order.car} • {order.license}
                    </Text>

                    <View style={styles.orderFooter}>
                      <Text style={styles.date}>{order.date}</Text>

                      <View style={styles.statusContainer}>
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusBgColor(order.status) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(order.status) },
                          ]}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Chevron */}
                  <Ionicons name="chevron-forward" size={20} color="#C6CFD9" style={styles.chevron} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyState}>
            <Ionicons name="car-sport" size={64} color="#C6CFD9" style={styles.emptyIcon} />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your past detailing sessions will appear here.
            </Text>
          </View>
        )}
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
  ordersContainer: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#0A1A2F',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  orderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  carIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(29,164,243,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderInfo: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceName: {
    color: '#F5F7FA',
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  price: {
    color: '#F5F7FA',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  carDetails: {
    color: '#C6CFD9',
    fontSize: 14,
    marginBottom: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    color: '#C6CFD9',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  chevron: {
    marginTop: 4,
  },
  emptyState: {
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
});
