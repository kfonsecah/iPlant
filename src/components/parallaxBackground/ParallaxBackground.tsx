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
  { source: require('../../../assets/images/layer2.png'), factor: 0.5 },
  { source: require('../../../assets/images/layer3.png'), factor: 1.5 },
];

interface ParallaxLayerProps {
  source: any;
  factor: number;
  rotation: { x: SharedValue<number>; y: SharedValue<number> };
  isBottomLayer?: boolean;
  zIndex?: number;
}

const ParallaxLayer = ({
  source,
  factor,
  rotation,
  isBottomLayer,
  zIndex
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
        { translateY: ty },
      ],
    };
  });

  return (
    <Animated.View
      style={[isBottomLayer ? styles.layerBottom : styles.layer, animatedStyle, { zIndex }]}
      pointerEvents="none"
    >
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
  foregroundChildren,
  ambientChildren,
  behindForeground
}: {
  children: React.ReactNode;
  foregroundChildren?: React.ReactNode;
  ambientChildren?: React.ReactNode;
  behindForeground?: React.ReactNode;
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

        // Intervalo más conservador (32ms = ~30fps) para evitar saturar el JS thread
        DeviceMotion.setUpdateInterval(32);

        subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
          if (data.rotation) {
            const { beta, gamma } = data.rotation;
            // damping: 25 para un movimiento más suave y menos costoso
            rotationX.value = withSpring(gamma, { damping: 25, stiffness: 80 });
            const adjustedBeta = Platform.OS === 'ios' ? beta - 1.1 : beta - 0.5;
            rotationY.value = withSpring(adjustedBeta, { damping: 25, stiffness: 80 });
          }
        });
      } catch (error) {
        console.log('[DeviceMotion] Error:', error);
      }
    };

    startMotion();

    return () => {
      subscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Layer 1: Fondo (El más profundo) */}
      <ParallaxLayer
        source={LAYERS[0].source}
        factor={LAYERS[0].factor}
        rotation={{ x: rotationX, y: rotationY }}
        zIndex={1}
      />

      {/* AMBIENT CONTENT (Partículas/Lluvia entre capa 1 y 2) */}
      <View style={[StyleSheet.absoluteFill, { zIndex: 2 }]} pointerEvents="none">
        {ambientChildren}
      </View>

      {/* BEHIND FOREGROUND */}
      {behindForeground && (
        <View style={styles.behindForegroundOverlay} pointerEvents="box-none">
          {behindForeground}
        </View>
      )}

      {/* Layer 2: Siluetas (Sobre la animación) */}
      <ParallaxLayer
        source={LAYERS[1].source}
        factor={LAYERS[1].factor}
        rotation={{ x: rotationX, y: rotationY }}
        zIndex={3}
      />

      {/* CONTENIDO INTERMEDIO (UI) */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>

      {/* Layer 3: Hojas primer plano (Al frente) */}
      <ParallaxLayer
        source={LAYERS[2].source}
        factor={LAYERS[2].factor}
        rotation={{ x: rotationX, y: rotationY }}
        isBottomLayer
        zIndex={15}
      />

      {/* CONTENIDO SUPERIOR */}
      {foregroundChildren && (
        <View style={styles.contentOverlay} pointerEvents="box-none">
          {foregroundChildren}
        </View>
      )}
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
    zIndex: 1, // Base layers at the bottom
    elevation: 0,
  },
  layerBottom: {
    position: 'absolute',
    bottom: -MAX_OFFSET,
    left: -W * 0.99,
    width: BOTTOM_LAYER_WIDTH,
    height: BOTTOM_LAYER_HEIGHT,
    zIndex: 15, // Foreground leaves above background and UI
    elevation: 15, // High elevation for Android to stay on top
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4, // UI above background layers but below foreground leaves
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20, // Toasts and status bar on top of everything
    elevation: 20, // Ensure it stays on top on Android too
  },
  behindForegroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
    justifyContent: 'center',
  },
});

