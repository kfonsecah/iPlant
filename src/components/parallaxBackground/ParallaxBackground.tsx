import { DeviceMotion, DeviceMotionMeasurement } from 'expo-sensors';
import React, { useEffect } from 'react';
import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width: W, height: H } = Dimensions.get('window');
const MAX_OFFSET = 35;
const BOTTOM_LAYER_WIDTH = (W + MAX_OFFSET * 2) * 2.5; 
const BOTTOM_LAYER_HEIGHT = BOTTOM_LAYER_WIDTH * (9 / 16);

const LAYERS = [
  { source: require('../../../assets/images/layer1.jpeg'), factor: 0.06 },
  { source: require('../../../assets/images/layer2.png'), factor: 0.5 }, // Aumentado para acercarla
  { source: require('../../../assets/images/layer3.png'), factor: 1.5 },
];

interface ParallaxLayerProps {
  source: any;
  factor: number;
  rotation: { x: SharedValue<number>; y: SharedValue<number> };
  isBottomLayer?: boolean;
  baseScale?: number;
  baseTranslateY?: number;
}

const ParallaxLayer = ({ 
  source, 
  factor, 
  rotation, 
  isBottomLayer, 
  baseScale = 1,
  baseTranslateY = 0 
}: ParallaxLayerProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    let tx = rotation.x.value * MAX_OFFSET * factor * 0.5;
    let ty = rotation.y.value * MAX_OFFSET * factor * 0.5;

    if (isBottomLayer) {
      tx = Math.max(Math.min(tx, 50), -150);
      ty = Math.max(Math.min(ty, 30), -30);
    }

    return {
      transform: [
        { translateX: tx },
        { translateY: ty + baseTranslateY },
        { scale: baseScale },
      ],
    };
  });

  return (
    <Animated.View style={[isBottomLayer ? styles.layerBottom : styles.layer, animatedStyle]}>
      <Image
        source={source}
        style={styles.image}
        resizeMode="cover"
      />
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

      {/* Layer 2: Siluetas (Plano intermedio) */}
      <ParallaxLayer
        source={LAYERS[1].source}
        factor={LAYERS[1].factor}
        rotation={{ x: rotationX, y: rotationY }}
        baseScale={1.0}
        baseTranslateY={0}
      />

      {/* CONTENIDO INTERMEDIO (UI) */}
      <View style={styles.content}>{children}</View>

      {/* Layer 3: Hojas primer plano */}
      <ParallaxLayer
        source={LAYERS[2].source}
        factor={LAYERS[2].factor}
        rotation={{ x: rotationX, y: rotationY }}
        isBottomLayer
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
  layerBottom: {
    position: 'absolute',
    bottom: -MAX_OFFSET,
    left: -W * 0.99,
    width: BOTTOM_LAYER_WIDTH,
    height: BOTTOM_LAYER_HEIGHT,
    zIndex: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50, 
  },
});
