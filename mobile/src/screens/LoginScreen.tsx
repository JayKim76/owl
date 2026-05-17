import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  Image,
  Alert
} from 'react-native';
import { useTheme, Colors } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { OwlButton } from '../components/OwlButton';
import { CONFIG } from '../constants/Config';
import axios from 'axios';
import { Lock, Eye, EyeOff } from 'lucide-react-native';

export const LoginScreen = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { theme, isDark } = useTheme();
  const { login } = useAuth();
  const colors = Colors[theme];

  const handleLogin = async () => {
    if (!password) {
      Alert.alert('오류', '비밀번호를 입력해 주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${CONFIG.API_BASE_URL}/api/auth/login`, {
        password: password
      });

      if (response.data.success && response.data.token) {
        await login(response.data.token);
      } else {
        Alert.alert('로그인 실패', response.data.error || '비밀번호가 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert(
        '연결 오류', 
        '서버와 통신할 수 없습니다. 서버 상태를 확인해 주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center px-8">
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={[styles.logoIcon, { backgroundColor: colors.surface }]}>
               <Image 
                source={require('../../assets/icon.png')} // Temporarily use icon.png
                style={{ width: 60, height: 60 }}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Owl Leak</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              관리자 모드로 로그인합니다
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Lock size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="관리자 비밀번호"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableWithoutFeedback onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} color={colors.textSecondary} /> : <Eye size={20} color={colors.textSecondary} />}
              </TouchableWithoutFeedback>
            </View>

            <OwlButton 
              title="로그인" 
              onPress={handleLogin} 
              loading={loading}
              style={{ marginTop: 20 }}
            />
          </View>

          <Text style={[styles.footer, { color: colors.textSecondary }]}>
            © 2026 Owl Leak Lab. All rights reserved.
          </Text>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 12,
  }
});
