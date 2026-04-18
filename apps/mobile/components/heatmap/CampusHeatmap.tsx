import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface HeatmapDot {
  id: string;
  x: number; // 0-1 relative
  y: number; // 0-1 relative
  category: string;
  count: number;
}

interface CampusHeatmapProps {
  dots: HeatmapDot[];
  categoryColors: Record<string, string>;
  width?: number;
  height?: number;
}

export const CampusHeatmap: React.FC<CampusHeatmapProps> = ({
  dots,
  categoryColors,
  width = SCREEN_WIDTH - 48,
  height = 400,
}) => {
  return (
    <View style={[styles.container, { width, height }]}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pos) => (
        <React.Fragment key={pos}>
          <View style={[styles.gridH, { top: `${pos * 100}%` }]} />
          <View style={[styles.gridV, { left: `${pos * 100}%` }]} />
        </React.Fragment>
      ))}

      {/* Issue dots */}
      {dots.map((dot) => {
        const size = 16 + dot.count * 3;
        return (
          <View
            key={dot.id}
            style={[
              styles.dot,
              {
                left: dot.x * width - size / 2,
                top: dot.y * height - size / 2,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: categoryColors[dot.category] || '#A7A9BE',
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEEEE9',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(26,26,26,0.06)',
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(26,26,26,0.06)',
  },
  dot: {
    position: 'absolute',
    opacity: 0.65,
  },
});
