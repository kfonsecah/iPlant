import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Easing, LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../theme/desingSystem';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const IdentificationAnimation = () => {
  const theme = useTheme();
  const [containerLayout, setContainerLayout] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT });
  
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const dataFlowAnim = useRef(new Animated.Value(0)).current;

  // Calculamos dimensiones del recuadro basadas en el contenedor real
  const FRAME_WIDTH = containerLayout.width * 0.75;
  const FRAME_HEIGHT = containerLayout.height * 0.5;
  const FRAME_TOP = (containerLayout.height - FRAME_HEIGHT) / 2;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(dataFlowAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: false, 
      })
    ).start();
  }, []);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerLayout({ width, height });
  };

  // La animación viaja desde el tope del recuadro hasta su base
  const translateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [FRAME_TOP, FRAME_TOP + FRAME_HEIGHT],
  });

  const scanLineOpacity = scanLineAnim.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, 1, 1, 0],
  });

  const cornerScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  return (
    <View style={styles.container} onLayout={onLayout}>
      {/* Overlay Oscurecido Perimetral */}
      <View style={styles.darkOverlay}>
          <View style={[styles.targetFrame, { width: FRAME_WIDTH, height: FRAME_HEIGHT, borderColor: 'rgba(255,255,255,0.2)' }]}>
            <Animated.View style={[styles.cornersContainer, { transform: [{ scale: cornerScale }] }]}>
                <View style={[styles.corner, styles.topLeft, { borderColor: theme.colors.primary }]} />
                <View style={[styles.corner, styles.topRight, { borderColor: theme.colors.primary }]} />
                <View style={[styles.corner, styles.bottomLeft, { borderColor: theme.colors.primary }]} />
                <View style={[styles.corner, styles.bottomRight, { borderColor: theme.colors.primary }]} />
            </Animated.View>
          </View>
      </View>

      {/* Línea de Escaneo (Confinada al Recuadro) */}
      <Animated.View 
        style={[
          styles.scanLineContainer, 
          { transform: [{ translateY }], opacity: scanLineOpacity }
        ]}
      >
        <View style={[styles.scanLine, { width: FRAME_WIDTH, backgroundColor: theme.colors.primary }]} />
        <View style={[styles.scanGlow, { width: FRAME_WIDTH, backgroundColor: theme.colors.primary, opacity: 0.3 }]} />
      </Animated.View>

      {/* UI OVERLAY / HUD */}
      <View style={styles.uiOverlay}>
        <View style={[styles.topInfo, { marginTop: containerLayout.height * 0.1 }]}>
            <BlurView intensity={30} tint="dark" style={styles.badge}>
                <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                <Text style={[styles.badgeText, { color: 'white', fontFamily: theme.typography.fontFamily.bold }]}>
                  ANALYZING SPECIES
                </Text>
            </BlurView>
        </View>

        <View style={[styles.bottomInfo, { marginBottom: containerLayout.height * 0.12 }]}>
            <View style={styles.dataRow}>
                <View style={styles.dataColumn}>
                    <Text style={styles.dataLabel}>STRUCTURAL_DNA</Text>
                    <View style={styles.progressBarBg}>
                        <Animated.View style={[styles.progressBarFill, { 
                            backgroundColor: theme.colors.primary,
                            width: dataFlowAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['10%', '98%']
                            })
                        }]} />
                    </View>
                </View>
                
                <View style={[styles.dataColumn, { alignItems: 'flex-end' }]}>
                    <Text style={styles.dataLabel}>MATCH_PROB</Text>
                    <Animated.Text style={[styles.dataValue, { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold }]}>
                        {dataFlowAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: ['0.00%', '45.21%', '92.48%']
                        })}
                    </Animated.Text>
                </View>
            </View>

            <View style={styles.dataRow}>
                <View style={styles.dataColumn}>
                    <Text style={styles.dataLabel}>STATUS</Text>
                    <Text style={[styles.dataValue, { color: 'white' }]}>SCANNING_DB...</Text>
                </View>
                <View style={[styles.dataColumn, { alignItems: 'flex-end' }]}>
                    <Text style={styles.dataLabel}>CHLOROPHYLL</Text>
                    <Text style={[styles.dataValue, { color: 'white' }]}>HIGH_VIBRANCY</Text>
                </View>
            </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetFrame: {
    borderWidth: 1,
    borderRadius: 24,
    position: 'relative',
  },
  cornersContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  corner: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderWidth: 4,
  },
  topLeft: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 18 },
  topRight: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 18 },
  bottomLeft: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 18 },
  bottomRight: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 18 },
  
  scanLineContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    zIndex: 11,
  },
  scanLine: {
    height: 2,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  scanGlow: {
    height: 30,
    marginTop: -15,
  },

  uiOverlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 25,
    justifyContent: 'space-between',
  },
  topInfo: {
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bottomInfo: {
    gap: 20,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dataColumn: {
    flex: 1,
    gap: 4,
  },
  dataLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  dataValue: {
    fontSize: 13,
    letterSpacing: 0.5,
    textShadowColor: 'black',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    width: '80%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default IdentificationAnimation;
