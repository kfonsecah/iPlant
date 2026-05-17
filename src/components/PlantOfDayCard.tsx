import React from "react";
import { Dimensions, Image, ImageSourcePropType, ImageStyle, StyleProp, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 30;

interface PlantOfDayCardProps {
  label?: string;
  name: string;
  description: string;
  buttonText?: string;
  image: ImageSourcePropType;
  imageStyle?: StyleProp<ImageStyle>;
  onPress?: () => void;
}

export default function PlantOfDayCard({
  label = "Planta del día",
  name,
  description,
  buttonText = "Ver más →",
  image,
  imageStyle,
  onPress,
}: PlantOfDayCardProps) {
  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View style={styles.leftSide}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>

      {/* RIGHT SIDE */}
      <View style={styles.rightSide}>
        <View style={styles.imageContainer}>
          <Image
            source={image}
            style={[styles.image, imageStyle]}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    width: CARD_WIDTH,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    height: 140,
    overflow: "visible",
    position: "relative",
  },
  leftSide: {
    padding: 16,
    flex: 1,
    zIndex: 10,
    justifyContent: 'center',
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#4ade80",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "300",
    color: "white",
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    marginTop: 4,
    maxWidth: "65%",
    lineHeight: 17,
  },
  button: {
    marginTop: 10,
  },
  buttonText: {
    fontSize: 11,
    color: "#4ade80",
  },
  rightSide: {
    position: "absolute",
    right: -15,
    top: -30,
    bottom: 0,
    width: 160,
    zIndex: 5,
  },
  imageContainer: {
    width: 160,
    height: 170, // 140 (card height) + 30 (top offset)
    overflow: "hidden",
  },
  image: {
    width: 160,
    height: 200,
  },
});
