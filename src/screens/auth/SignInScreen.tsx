import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../theme/colors';

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('test@cleanswift.com');
  const [password, setPassword] = useState('test123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    }
    // On success, auth listener will automatically navigate to MainTabs
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success', 'Account created! Please check your email to verify your account.');
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: 'cleanswift://auth/callback',
          skipBrowserRedirect: false,
        },
      });

      if (error) {
        Alert.alert('OAuth Error', error.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate OAuth sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Enter Email', 'Please enter your email address first');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'cleanswift://auth/reset-password',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Password reset link sent! Check your email.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.bg.primary }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ minHeight: '100%', flexDirection: 'column', paddingHorizontal: 24, paddingVertical: 48 }}>
        {/* Header */}
        <View style={{ marginBottom: 48, paddingTop: 32 }}>
          <Text
            style={{ color: COLORS.text.primary, fontSize: 32, fontWeight: '700', letterSpacing: 0.5 }}
          >
            Sign In
          </Text>
        </View>

        {/* Form */}
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <View style={{ gap: 20 }}>
            {/* Email Field */}
            <View>
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
                placeholderTextColor={COLORS.text.secondary}
                style={{
                  width: '100%',
                  backgroundColor: COLORS.bg.surface,
                  borderWidth: 1,
                  borderColor: COLORS.border.emphasis,
                  borderRadius: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  color: COLORS.text.primary,
                  fontSize: 16,
                  minHeight: 56,
                  opacity: loading ? 0.5 : 1
                }}
              />
            </View>

            {/* Password Field */}
            <View style={{ position: 'relative' }}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
                placeholderTextColor={COLORS.text.secondary}
                style={{
                  width: '100%',
                  backgroundColor: COLORS.bg.surface,
                  borderWidth: 1,
                  borderColor: COLORS.border.emphasis,
                  borderRadius: 16,
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                  paddingRight: 56,
                  color: COLORS.text.primary,
                  fontSize: 16,
                  minHeight: 56,
                  opacity: loading ? 0.5 : 1
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                activeOpacity={0.7}
                style={{
                  position: 'absolute',
                  right: 20,
                  top: 18,
                }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.text.secondary}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <View style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={loading}
                activeOpacity={0.7}
              >
                <Text style={{ color: COLORS.text.secondary, fontSize: 14 }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleEmailSignIn}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                width: '100%',
                backgroundColor: COLORS.accent.blue,
                paddingVertical: 16,
                borderRadius: 9999,
                shadowColor: COLORS.shadow.blue,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
                marginTop: 8,
                minHeight: 56,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.text.inverse} />
              ) : (
                <Text style={{ color: COLORS.text.inverse, fontSize: 17, fontWeight: '600' }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginVertical: 40 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border.emphasis }} />
            <Text style={{ color: COLORS.text.secondary, fontSize: 14 }}>OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: COLORS.border.emphasis }} />
          </View>

          {/* Social Sign In */}
          <View style={{ gap: 16 }}>
            {/* Apple Sign In */}
            <TouchableOpacity
              onPress={() => handleOAuthSignIn('apple')}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                width: '100%',
                backgroundColor: 'black',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                paddingVertical: 16,
                borderRadius: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                minHeight: 56,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Ionicons name="logo-apple" size={20} color="white" />
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '500' }}>
                Continue with Apple
              </Text>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity
              onPress={() => handleOAuthSignIn('google')}
              disabled={loading}
              activeOpacity={0.8}
              style={{
                width: '100%',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: COLORS.border.emphasis,
                paddingVertical: 16,
                borderRadius: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                minHeight: 56,
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Ionicons name="logo-google" size={20} color="black" />
              <Text style={{ color: 'black', fontSize: 16, fontWeight: '500' }}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Create Account Link */}
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={{ color: COLORS.accent.mint, fontSize: 16, fontWeight: '500' }}>
                Create an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
