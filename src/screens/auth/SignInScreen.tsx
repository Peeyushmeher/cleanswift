import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

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
    <ScrollView style={{ flex: 1, backgroundColor: '#050B12' }} contentContainerStyle={{ flexGrow: 1 }}>
      <View className="min-h-full flex flex-col px-6 py-12" style={{ minHeight: '100%' }}>
        {/* Header */}
        <View className="mb-12 pt-8">
          <Text
            className="text-[#F5F7FA] tracking-wide"
            style={{ fontSize: 32, fontWeight: '700' }}
          >
            Sign In
          </Text>
        </View>

        {/* Form */}
        <View className="flex-1 flex flex-col">
          <View className="space-y-5">
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
                placeholderTextColor="#C6CFD9"
                className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-6 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9] focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all"
                style={{ fontSize: 16, minHeight: 56, opacity: loading ? 0.5 : 1 }}
              />
            </View>

            {/* Password Field */}
            <View className="relative">
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!loading}
                placeholderTextColor="#C6CFD9"
                className="w-full bg-[#0A1A2F] border border-[#C6CFD9]/20 rounded-2xl px-6 py-4 text-[#F5F7FA] placeholder:text-[#C6CFD9] focus:border-[#1DA4F3] focus:outline-none focus:ring-1 focus:ring-[#1DA4F3]/50 transition-all pr-14"
                style={{ fontSize: 16, minHeight: 56, opacity: loading ? 0.5 : 1 }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}
                activeOpacity={0.7}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors active:scale-95"
                style={{ transform: [{ translateY: -10 }] }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#C6CFD9"
                />
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <View className="flex justify-end" style={{ alignItems: 'flex-end' }}>
              <TouchableOpacity
                onPress={handleForgotPassword}
                disabled={loading}
                activeOpacity={0.7}
                className="text-[#C6CFD9] hover:text-[#6FF0C4] transition-colors active:scale-95"
              >
                <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleEmailSignIn}
              disabled={loading}
              activeOpacity={0.8}
              className="w-full bg-[#1DA4F3] text-white py-4 rounded-full transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[#1DA4F3]/20 mt-2"
              style={{
                minHeight: 56,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white" style={{ fontSize: 17, fontWeight: '600' }}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex items-center gap-4 my-10" style={{ flexDirection: 'row' }}>
            <View className="flex-1 h-px bg-[#C6CFD9]/20" style={{ height: 1 }} />
            <Text className="text-[#C6CFD9]" style={{ fontSize: 14 }}>OR</Text>
            <View className="flex-1 h-px bg-[#C6CFD9]/20" style={{ height: 1 }} />
          </View>

          {/* Social Sign In */}
          <View className="space-y-4">
            {/* Apple Sign In */}
            <TouchableOpacity
              onPress={() => handleOAuthSignIn('apple')}
              disabled={loading}
              activeOpacity={0.8}
              className="w-full bg-black border border-white/10 text-white py-4 rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
              style={{
                minHeight: 56,
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Ionicons name="logo-apple" size={20} color="white" />
              <Text className="text-white" style={{ fontSize: 16, fontWeight: '500' }}>
                Continue with Apple
              </Text>
            </TouchableOpacity>

            {/* Google Sign In */}
            <TouchableOpacity
              onPress={() => handleOAuthSignIn('google')}
              disabled={loading}
              activeOpacity={0.8}
              className="w-full bg-white text-black py-4 rounded-full transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 border border-[#C6CFD9]/20"
              style={{
                minHeight: 56,
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: 'rgba(198,207,217,0.2)',
                opacity: loading ? 0.5 : 1,
              }}
            >
              <Ionicons name="logo-google" size={20} color="black" />
              <Text className="text-black" style={{ fontSize: 16, fontWeight: '500' }}>
                Continue with Google
              </Text>
            </TouchableOpacity>
          </View>

          {/* Create Account Link */}
          <View className="text-center mt-10" style={{ alignItems: 'center' }}>
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading}
              activeOpacity={0.7}
              className="text-[#6FF0C4] hover:text-[#6FF0C4]/80 transition-colors active:scale-95"
            >
              <Text className="text-[#6FF0C4]" style={{ fontSize: 16, fontWeight: '500' }}>
                Create an account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
