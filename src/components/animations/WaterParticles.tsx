import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GRAVITY = 1500; // px/s^2
const COLORS = [
  'rgba(255, 255, 255, 0.8)',
  'rgba(180, 230, 255, 0.7)',
  'rgba(140, 210, 255, 0.6)',
];

interface ParticleData {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  sizeW: number;
  sizeH: number;
  color: string;
  lifetime: number;
  isRound: boolean;
}

interface ParticleProps {
  data: ParticleData;
  onComplete: (id: string) => void;
}

const Particle = ({ data, onComplete }: ParticleProps) => {
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(1, { duration: data.lifetime }, () => {
      runOnJS(onComplete)(data.id);
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const t = (progress.value * data.lifetime) / 1000; // seg
    
    // Physics: s = v0*t + 0.5*a*t^2
    const tx = data.vx * t;
    const ty = data.vy * t + 0.5 * GRAVITY * t * t;

    // Rotate to follow the trajectory
    const angle = Math.atan2(data.vy + GRAVITY * t, data.vx) + Math.PI / 2;

    return {
      position: 'absolute',
      left: data.x,
      top: data.y,
      width: data.sizeW,
      height: data.sizeH,
      backgroundColor: data.color,
      borderRadius: data.isRound ? data.sizeW / 2 : data.sizeW / 1.5,
      opacity: interpolate(progress.value, [0, 0.8, 1], [1, 0.8, 0], Extrapolate.CLAMP),
      transform: [
        { translateX: tx },
        { translateY: ty },
        { rotate: `${angle}rad` },
        { scale: interpolate(progress.value, [0, 1], [1, 0.5], Extrapolate.CLAMP) }
      ],
    };
  });

  return <Animated.View style={[animatedStyle, styles.blur]} />;
};

export interface WaterParticlesRef {
  triggerTyping: (x: number, y: number) => void;
  triggerPress: (x: number, y: number) => void;
}

const WaterParticles = forwardRef<WaterParticlesRef>((_, ref) => {
  const [particles, setParticles] = useState<ParticleData[]>([]);

  const removeParticle = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const spawnParticles = (x: number, y: number, count: number, type: 'typing' | 'press') => {
    const newParticles: ParticleData[] = [];
    
    for (let i = 0; i < count; i++) {
      const isTyping = type === 'typing';
      
      // Random physics
      const angle = isTyping 
        ? (Math.random() * Math.PI - Math.PI) // Upwards burst (-180 to 0 deg)
        : (Math.random() * Math.PI * 2);      // All directions

      const speed = isTyping 
        ? (Math.random() * 200 + 100) 
        : (Math.random() * 500 + 200);

      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const sizeW = Math.random() * 5 + 3;
      const sizeH = isTyping ? sizeW : Math.random() * 8 + 6;
      
      newParticles.push({
        id: Math.random().toString(36).substring(7),
        x,
        y,
        vx,
        vy,
        sizeW,
        sizeH,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        lifetime: Math.random() * 200 + 400, // 400-600ms
        isRound: Math.random() > 0.6,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);
  };

  useImperativeHandle(ref, () => ({
    triggerTyping: (x, y) => spawnParticles(x, y, Math.floor(Math.random() * 2 + 2), 'typing'),
    triggerPress: (x, y) => spawnParticles(x, y, Math.floor(Math.random() * 5 + 8), 'press'),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map(p => (
        <Particle key={p.id} data={p} onComplete={removeParticle} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  blur: {
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  }
});

export default WaterParticles;
