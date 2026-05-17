import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme, Colors } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { CustomersScreen } from '../screens/CustomersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LayoutDashboard, Users, Settings as SettingsIcon } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppTabs = () => {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: '대시보드',
          tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />
        }} 
      />
      <Tab.Screen 
        name="Customers" 
        component={CustomersScreen} 
        options={{ 
          title: '고객 관리',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />
        }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ 
          title: '설정',
          tabBarIcon: ({ color, size }) => <SettingsIcon size={size} color={color} />
        }} 
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const colors = Colors[theme];

  const MyTheme = {
    ...(theme === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={AppTabs} />
        ) : (
          <Stack.Screen name="Auth" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
