import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useTheme, Colors } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, LogOut, ChevronRight, Bell, Shield, Info } from 'lucide-react-native';

export const SettingsScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const colors = Colors[theme];

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '로그아웃', style: 'destructive', onPress: logout }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, isSwitch = false }: any) => (
    <TouchableOpacity 
      style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      disabled={isSwitch}
    >
      <View style={styles.itemLeft}>
        <View style={[styles.iconBg, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
          <Icon size={20} color={colors.primary} />
        </View>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: '#D1D5DB', true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <ChevronRight size={18} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>디스플레이</Text>
        <SettingItem 
          icon={isDark ? Moon : Sun} 
          label="다크 모드" 
          isSwitch 
          value={isDark} 
          onPress={toggleTheme} 
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>일반 설정</Text>
        <SettingItem icon={Bell} label="알림 설정" />
        <SettingItem icon={Shield} label="보안 및 개인정보" />
        <SettingItem icon={Info} label="앱 정보" />
      </View>

      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: colors.error }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.version, { color: colors.textSecondary }]}>Version 1.0.0 (Alpha)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 'auto',
    marginBottom: 20,
  }
});
