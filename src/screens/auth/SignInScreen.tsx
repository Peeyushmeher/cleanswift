import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

// Complete the OAuth session when the browser closes
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      // Use the deep link directly - Supabase should handle it
      // Make sure 'cleanswift://auth/callback' is added to Supabase Dashboard
      // Authentication → URL Configuration → Redirect URLs
      const redirectUrl = 'cleanswift://auth/callback';

      // Get the OAuth URL from Supabase
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // We'll handle the browser ourselves
        },
      });

      if (error) {
        Alert.alert('OAuth Error', error.message);
        setLoading(false);
        return;
      }

      if (!data?.url) {
        Alert.alert('Error', 'Failed to get OAuth URL');
        setLoading(false);
        return;
      }

      console.log('Opening OAuth URL:', data.url);
      console.log('Expected redirect to:', redirectUrl);

      // Use openAuthSessionAsync for proper deep link handling
      // This ensures the redirect goes to the app, not localhost
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        'cleanswift://auth/callback'
      );

      console.log('OAuth session result:', result.type, result.url);

      // Handle the callback URL directly if we get it back
      if (result.type === 'success' && result.url) {
        console.log('OAuth callback URL received:', result.url);
        
        // Supabase returns tokens in hash fragment, not code in query params
        // Format: cleanswift://auth/callback#access_token=...&refresh_token=...
        const hashMatch = result.url.match(/#(.+)/);
        if (hashMatch) {
          // Parse hash fragment manually (URLSearchParams might not work with hash in RN)
          const hashString = hashMatch[1];
          const params: Record<string, string> = {};
          hashString.split('&').forEach((param) => {
            const [key, value] = param.split('=');
            if (key && value) {
              params[decodeURIComponent(key)] = decodeURIComponent(value);
            }
          });
          
          const accessToken = params['access_token'];
          const refreshToken = params['refresh_token'];
          
          if (accessToken && refreshToken) {
            try {
              // Set the session directly with the tokens
              const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (sessionError) {
                console.error('Session error:', sessionError);
                Alert.alert('Authentication Error', sessionError.message);
              } else {
                console.log('OAuth authentication successful');
                
                // Ensure profile exists for OAuth users
                if (data?.user) {
                  try {
                    const { error: profileError } = await supabase
                      .from('profiles')
                      .upsert({
                        id: data.user.id,
                        email: data.user.email || '',
                        full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || '',
                        phone: data.user.phone || '',
                        role: 'user',
                      }, {
                        onConflict: 'id',
                      });
                    
                    if (profileError) {
                      console.warn('Profile creation/update warning:', profileError);
                    }
                  } catch (error) {
                    console.warn('Profile creation error:', error);
                  }
                }
                
                // Auth state change listener will handle navigation
              }
            } catch (error) {
              console.error('OAuth error:', error);
              Alert.alert('Error', 'Failed to complete authentication');
            }
          } else {
            // Fallback: try to extract code if present
            let code: string | null = null;
            try {
              const urlObj = new URL(result.url);
              code = urlObj.searchParams.get('code');
            } catch (e) {
              const match = result.url.match(/[?&]code=([^&]+)/);
              code = match ? decodeURIComponent(match[1]) : null;
            }
            
            if (code) {
              try {
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                if (exchangeError) {
                  Alert.alert('Authentication Error', exchangeError.message);
                }
              } catch (error) {
                Alert.alert('Error', 'Failed to complete authentication');
              }
            } else {
              console.warn('No access_token or code found in callback URL');
            }
          }
        }
      } else if (result.type === 'cancel') {
        console.log('OAuth cancelled by user');
      } else if (result.type === 'dismiss') {
        console.log('OAuth session dismissed');
      }
      
      // Note: The callback will also be handled by the global deep link listener in App.tsx
    } catch (error) {
      console.error('OAuth error:', error);
      Alert.alert('Error', 'Failed to initiate OAuth sign in. Please try again.');
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
