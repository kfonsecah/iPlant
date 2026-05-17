import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function PlantOfDayCard() {
  return (
    <View style={styles.container}>
      {/* LEFT SIDE */}
      <View style={styles.leftSide}>
        <Text style={styles.label}>Planta del día</Text>
        <Text style={styles.title}>Monstera Deliciosa</Text>
        <Text style={styles.description}>
          Perfecta para interiores con poca luz. Purifica el aire.
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver más →</Text>
        </TouchableOpacity>
      </View>

      {/* RIGHT SIDE */}
      <View style={styles.rightSide}>
        <View style={styles.imageContainer}>
          <Image 
            source={require("../../assets/images/monstera.png")} 
            style={styles.image} 
            resizeMode="contain" 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 24,
    height: 140,
    overflow: "visible",
    position: "relative",
  },
  leftSide: {
    padding: 20,
    flex: 1,
    zIndex: 10,
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
    maxWidth: "58%",
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
    right: -10,
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
