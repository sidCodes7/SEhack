import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS } from '../../constants/typography';

interface AvatarProps {
  url?: string;
  name: string;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ url, name, size = 40 }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {url ? (
        <Image source={{ uri: url }} style={[styles.image, containerStyle]} />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.4 }]}>{initials}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.bold,
  },
});
