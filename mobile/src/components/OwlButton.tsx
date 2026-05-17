import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme, Colors } from '../context/ThemeContext';

interface OwlButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const OwlButton: React.FC<OwlButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon
}) => {
  const { theme, isDark } = useTheme();
  const colors = Colors[theme];

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: colors.primary };
      case 'secondary':
        return { backgroundColor: colors.accent };
      case 'outline':
        return { backgroundColor: 'transparent', borderWhidth: 1, borderColor: colors.border };
      case 'danger':
        return { backgroundColor: colors.error };
      default:
        return { backgroundColor: colors.primary };
    }
  };

  const getTextColor = () => {
    if (variant === 'outline') return colors.text;
    if (variant === 'secondary') return '#1E3A8A'; // Dark blue for contrast on yellow
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.disabled,
        style
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text style={[
            styles.text, 
            { color: getTextColor() },
            icon ? { marginLeft: 8 } : {},
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
