import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay, 
  withSequence,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');

// Configuración de partículas ambientales
const PARTICLE_COUNT = 60; 

/**
 * Gotas circulares que caen verticalmente
 */
const AmbientParticle = () => {
  const y = useSharedValue(-20);
  const x = useMemo(() => Math.random() * W, []);
  const duration = useMemo(() => Math.random() * 2000 + 2000, []); // 2-4s
  const delay = useMemo(() => Math.random() * 5000, []);
  const size = useMemo(() => Math.random() * 2 + 3, []); // 3-5px

  useEffect(() => {
    y.value = withDelay(delay, withRepeat(withTiming(H + 20, { 
      duration, 
      easing: Easing.linear 
    }), -1, false));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    left: x,
    width: size,
    height: size,
    opacity: interpolate(y.value, [0, H * 0.1, H * 0.9, H], [0, 0.18, 0.18, 0], Extrapolate.CLAMP),
  }));

  return <Animated.View style={[styles.particle, animatedStyle]} />;
};

const RainOnGlass = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {[...Array(PARTICLE_COUNT)].map((_, i) => <AmbientParticle key={`p-${i}`} />)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
    borderRadius: 10,
  },
});

export default RainOnGlass;
