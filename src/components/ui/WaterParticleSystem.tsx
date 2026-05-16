import React, { forwardRef } from 'react';
import { View } from 'react-native';

export interface WaterParticleSystemHandle {
  spawn: (x: number, y: number) => void;
}

const WaterParticleSystem = forwardRef<WaterParticleSystemHandle>((props, ref) => {
  return null;
});

export default WaterParticleSystem;
