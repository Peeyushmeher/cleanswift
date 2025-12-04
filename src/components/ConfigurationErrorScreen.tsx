import { Ionicons } from '@expo/vector-icons';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isSupabaseConfigured } from '../lib/supabase';

export default function ConfigurationErrorScreen() {
  const supabaseConfigured = isSupabaseConfigured();
  const stripeKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  const missingVars: string[] = [];
  if (!supabaseConfigured) {
    missingVars.push('EXPO_PUBLIC_SUPABASE_URL');
    missingVars.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  if (!stripeKey) {
    missingVars.push('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  }
  if (!googleMapsKey) {
    missingVars.push('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
  }

  const openEASDocs = () => {
    Linking.openURL('https://docs.expo.dev/build-reference/variables/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Ionicons name="alert-circle" size={64} color="#FF6B6B" />
        <Text style={styles.title}>Configuration Error</Text>
        <Text style={styles.subtitle}>
          The app is missing required environment variables
        </Text>

        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Missing Variables:</Text>
          {missingVars.map((varName) => (
            <Text key={varName} style={styles.errorItem}>
              • {varName}
            </Text>
          ))}
        </View>

        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>How to Fix:</Text>
          <Text style={styles.instruction}>
            1. Install EAS CLI: npm install -g eas-cli
          </Text>
          <Text style={styles.instruction}>
            2. Login: eas login
          </Text>
          <Text style={styles.instruction}>
            3. Set secrets for your build profile:
          </Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>
              eas env:create --name EXPO_PUBLIC_SUPABASE_URL --value YOUR_URL --scope project
            </Text>
            <Text style={styles.code}>
              eas env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_KEY --scope project
            </Text>
          </View>
          <Text style={styles.instruction}>
            4. Rebuild your app: eas build --platform ios --profile production
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={openEASDocs}>
          <Text style={styles.buttonText}>View EAS Documentation</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: This error only appears in production builds. Development builds use .env files.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050B12',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5F7FA',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#C6CFD9',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 14,
    color: '#F5F7FA',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  instructionsBox: {
    backgroundColor: 'rgba(29, 164, 243, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(29, 164, 243, 0.3)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1DA4F3',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: '#C6CFD9',
    marginBottom: 8,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  code: {
    fontSize: 12,
    color: '#6FF0C4',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#1DA4F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
