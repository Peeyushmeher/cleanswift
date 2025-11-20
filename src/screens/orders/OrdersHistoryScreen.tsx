import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OrdersHistoryScreenProps {
  onBack: () => void;
  onOrderDetails: (orderId: string) => void;
}

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

export default function OrdersHistoryScreen({ onBack, onOrderDetails }: OrdersHistoryScreenProps) {
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
    <View className="fixed inset-0 bg-gradient-to-b from-[#0A1A2F] to-[#050B12] flex flex-col">
      {/* Header */}
      <View className="px-6 pt-16 pb-6 flex items-center gap-4" style={{ flexDirection: 'row' }}>
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.7}
          className="text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors active:scale-95"
        >
          <Ionicons name="chevron-back" size={24} color="#C6CFD9" />
        </TouchableOpacity>
        <Text className="text-[#F5F7FA]" style={{ fontSize: 28, fontWeight: '600' }}>
          Your Bookings
        </Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView className="flex-1 px-6 pb-8" showsVerticalScrollIndicator={false}>
        {orders.length > 0 ? (
          <View className="space-y-4" style={{ gap: 16 }}>
            {orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                onPress={() => onOrderDetails(order.id)}
                activeOpacity={0.8}
                className="w-full bg-[#0A1A2F] rounded-2xl p-6 border border-white/5 transition-all duration-200 active:bg-[#050B12] hover:border-white/10"
                style={{
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.05)',
                }}
              >
                <View className="flex items-start gap-4" style={{ flexDirection: 'row' }}>
                  {/* Car Icon */}
                  <View
                    className="w-12 h-12 rounded-full bg-[#1DA4F3]/10 flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: 'rgba(29,164,243,0.1)',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons name="car-sport" size={24} color="#1DA4F3" />
                  </View>

                  {/* Order Info */}
                  <View className="flex-1">
                    <View className="flex items-start justify-between mb-2" style={{ flexDirection: 'row' }}>
                      <Text className="text-[#F5F7FA]" style={{ fontSize: 17, fontWeight: '600', flex: 1 }}>
                        {order.service}
                      </Text>
                      <Text className="text-[#F5F7FA]" style={{ fontSize: 16, fontWeight: '600', marginLeft: 8 }}>
                        {order.price}
                      </Text>
                    </View>

                    <Text className="text-[#C6CFD9] mb-2" style={{ fontSize: 14 }}>
                      {order.car} • {order.license}
                    </Text>

                    <View className="flex items-center justify-between" style={{ flexDirection: 'row' }}>
                      <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                        {order.date}
                      </Text>

                      <View className="flex items-center gap-2" style={{ flexDirection: 'row' }}>
                        <View
                          className={`w-2 h-2 rounded-full`}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: getStatusBgColor(order.status),
                          }}
                        />
                        <Text
                          className="capitalize"
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: getStatusColor(order.status),
                            textTransform: 'capitalize',
                          }}
                        >
                          {order.status}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Chevron */}
                  <Ionicons name="chevron-forward" size={20} color="#C6CFD9" style={{ marginTop: 4 }} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Empty State */
          <View className="flex flex-col items-center justify-center py-20" style={{ alignItems: 'center', paddingVertical: 80 }}>
            <Ionicons name="car-sport" size={64} color="#C6CFD9" style={{ marginBottom: 16 }} />
            <Text className="text-[#F5F7FA] mb-2" style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>
              No Bookings Yet
            </Text>
            <Text className="text-[#C6CFD9] text-center" style={{ fontSize: 15, textAlign: 'center' }}>
              Your past detailing sessions will appear here.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
