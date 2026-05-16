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
const MAX_OFFSET = 60;
const BOTTOM_LAYER_WIDTH = (W + MAX_OFFSET * 2) * 3; 
const BOTTOM_LAYER_HEIGHT = BOTTOM_LAYER_WIDTH * (9 / 16);

const LAYERS = [
  { source: require('../../../assets/images/layer1.jpeg'), factor: 0.05 },
  { source: require('../../../assets/images/layer2.png'), factor: 0.8 },
  { source: require('../../../assets/images/layer3.png'), factor: 3.2 },
];

interface ParallaxLayerProps {
  source: any;
  factor: number;
  rotation: { x: SharedValue<number>; y: SharedValue<number> };
  isBottomLayer?: boolean;
}

const ParallaxLayer = ({ 
  source, 
  factor, 
  rotation, 
  isBottomLayer
}: ParallaxLayerProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    let tx = rotation.x.value * MAX_OFFSET * factor;
    let ty = rotation.y.value * MAX_OFFSET * factor;

    // We no longer need restrictive clamping for Layer 3 as its size covers the motion

    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
      ],
    };
  });

  return (
    <Animated.View 
      style={[isBottomLayer ? styles.layerBottom : styles.layer, animatedStyle]}
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

        // Intervalo de 16ms (~60fps) para máxima fluidez
        DeviceMotion.setUpdateInterval(16);
        
        subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
          if (data.rotation) {
            const { beta, gamma } = data.rotation;
            // Configuración de resorte más reactiva: mayor stiffness, menor damping
            rotationX.value = withSpring(gamma, { damping: 18, stiffness: 150 });
            const adjustedBeta = Platform.OS === 'ios' ? beta - 1.1 : beta - 0.5;
            rotationY.value = withSpring(adjustedBeta, { damping: 18, stiffness: 150 });
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
      {/* Layer 1: Fondo */}
      <ParallaxLayer
        source={LAYERS[0].source}
        factor={LAYERS[0].factor}
        rotation={{ x: rotationX, y: rotationY }}
      />

      {/* Layer 2: Siluetas */}
      <ParallaxLayer
        source={LAYERS[1].source}
        factor={LAYERS[1].factor}
        rotation={{ x: rotationX, y: rotationY }}
      />

      {/* CONTENIDO INTERMEDIO (UI) */}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>

      {/* Layer 3: Hojas primer plano */}
      <ParallaxLayer
        source={LAYERS[2].source}
        factor={LAYERS[2].factor}
        rotation={{ x: rotationX, y: rotationY }}
        isBottomLayer
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
    top: -MAX_OFFSET * 1.5,
    left: -MAX_OFFSET * 1.5,
    width: W + MAX_OFFSET * 3,
    height: H + MAX_OFFSET * 3,
    zIndex: 1, // Base layers at the bottom
  },
  layerBottom: {
    position: 'absolute',
    bottom: -MAX_OFFSET,
    left: -W * 0.99,
    width: BOTTOM_LAYER_WIDTH,
    height: BOTTOM_LAYER_HEIGHT,
    zIndex: 5, // Foreground leaves above background but below UI
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10, // UI above background and foreground leaves
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20, // Toasts and status bar on top of everything
  },
});

