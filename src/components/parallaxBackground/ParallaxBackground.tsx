import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Image, Platform } from 'react-native';
import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');
const MAX_OFFSET = 35;

const LAYERS = [
  { source: require('../../../assets/images/layer1.jpeg'), factor: 0.06 },
  { source: require('../../../assets/images/layer2.png'), factor: 0.18 },
  { source: require('../../../assets/images/layer3.png'), factor: 0.55 },
];

interface ParallaxLayerProps {
  source: any;
  factor: number;
  rotation: { x: SharedValue<number>; y: SharedValue<number> };
}

const ParallaxLayer = ({ source, factor, rotation }: ParallaxLayerProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: rotation.x.value * MAX_OFFSET * factor * 3.5 },
        { translateY: rotation.y.value * MAX_OFFSET * factor * 3.5 },
      ],
    };
  });

  return (
    <Animated.View style={[styles.layer, animatedStyle]}>
      <Image source={source} style={styles.image} resizeMode="cover" />
    </Animated.View>
  );
};

export default function ParallaxBackground({ 
  children, 
  foregroundChildren 
}: { 
  children: React.ReactNode;
  foregroundChildren?: React.ReactNode;
}) {
  const rotationX = useSharedValue(0);
  const rotationY = useSharedValue(0);

  useEffect(() => {
    let subscription: any;

    const startMotion = async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        if (!available) return;

        if (Platform.OS === 'ios') {
          const { status } = await DeviceMotion.requestPermissionsAsync();
          if (status !== 'granted') return;
        }

        DeviceMotion.setUpdateInterval(16);
        DeviceMotion.removeAllListeners();
        
        subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
          if (data.rotation) {
            const { beta, gamma } = data.rotation;
            rotationX.value = withSpring(gamma, { damping: 20, stiffness: 90 });
            const adjustedBeta = Platform.OS === 'ios' ? beta - 1.1 : beta - 0.5;
            rotationY.value = withSpring(adjustedBeta, { damping: 20, stiffness: 90 });
          }
        });
      } catch (error) {
        console.error('[DeviceMotion] Error starting motion:', error);
      }
    };

    startMotion();

    return () => {
      if (subscription) subscription.remove();
      DeviceMotion.removeAllListeners();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Layer 1: Fondo (Cielo) */}
      <ParallaxLayer
        source={LAYERS[0].source}
        factor={LAYERS[0].factor}
        rotation={{ x: rotationX, y: rotationY }}
      />

      {/* CONTENIDO INTERMEDIO (Detrás de siluetas y hojas) */}
      <View style={styles.content}>{children}</View>

      {/* Layer 2: Siluetas de plantas */}
      <ParallaxLayer
        source={LAYERS[1].source}
        factor={LAYERS[1].factor}
        rotation={{ x: rotationX, y: rotationY }}
      />

      {/* Layer 3: Hojas primer plano */}
      <ParallaxLayer
        source={LAYERS[2].source}
        factor={LAYERS[2].factor}
        rotation={{ x: rotationX, y: rotationY }}
      />

      {/* CONTENIDO SUPERIOR (Encima de todo) */}
      {foregroundChildren && <View style={styles.content}>{foregroundChildren}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  layer: {
    position: 'absolute',
    top: -MAX_OFFSET,
    left: -MAX_OFFSET,
    width: W + MAX_OFFSET * 2,
    height: H + MAX_OFFSET * 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
