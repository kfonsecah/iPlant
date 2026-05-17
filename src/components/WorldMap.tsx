import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Svg, { Path, G } from "react-native-svg";

interface WorldMapProps {
  countryCodes: string[];
}

export default function WorldMap({ countryCodes = [] }: WorldMapProps) {
  // Normalize highlighted country codes to lowercase
  const highlighted = countryCodes.map((code) => code.toLowerCase());

  // Function to determine styling based on country code
  const getCountryStyle = (id: string) => {
    const isHighlighted = highlighted.includes(id.toLowerCase());
    return {
      fill: isHighlighted ? "rgba(74, 222, 128, 0.4)" : "rgba(255, 255, 255, 0.06)",
      stroke: isHighlighted ? "#4ade80" : "rgba(255, 255, 255, 0.12)",
      strokeWidth: isHighlighted ? 1.0 : 0.5,
    };
  };

  return (
    <View style={styles.container}>
      <Svg viewBox="0 0 1000 500" width="100%" height={220}>
        <G>
          {/* NORTH AMERICA (Canada & USA) */}
          <Path
            id="north_america"
            d="M 120 80 L 160 60 L 220 50 L 320 40 L 380 50 L 400 90 L 340 140 L 300 130 L 280 160 L 290 190 L 260 200 L 240 230 L 220 220 L 210 240 L 195 240 L 180 200 L 130 190 L 110 150 L 80 120 Z"
            {...getCountryStyle("na_rest")}
          />

          {/* MEXICO (mx) */}
          <Path
            id="mx"
            d="M 180 200 L 195 240 L 210 245 L 220 235 L 240 245 L 255 260 L 262 265 L 264 278 L 250 285 L 235 275 L 210 260 L 190 230 L 175 220 Z"
            {...getCountryStyle("mx")}
          />

          {/* GUATEMALA (gt) */}
          <Path
            id="gt"
            d="M 264 278 L 273 283 L 270 290 L 262 290 L 258 285 Z"
            {...getCountryStyle("gt")}
          />

          {/* REST OF CENTRAL AMERICA */}
          <Path
            id="ca_rest"
            d="M 273 283 L 285 290 L 295 292 L 300 300 L 295 305 L 285 300 L 270 290 Z"
            {...getCountryStyle("ca_rest")}
          />

          {/* GREENLAND */}
          <Path
            id="greenland"
            d="M 380 30 L 450 20 L 490 30 L 480 60 L 420 90 L 370 70 Z"
            {...getCountryStyle("gl")}
          />

          {/* SOUTH AMERICA */}
          {/* Colombia (co) */}
          <Path
            id="co"
            d="M 300 300 L 315 305 L 322 312 L 330 320 L 318 335 L 305 330 L 295 315 L 298 305 Z"
            {...getCountryStyle("co")}
          />

          {/* Ecuador (ec) */}
          <Path
            id="ec"
            d="M 295 315 L 305 330 L 298 340 L 288 332 L 292 320 Z"
            {...getCountryStyle("ec")}
          />

          {/* Peru (pe) */}
          <Path
            id="pe"
            d="M 298 340 L 305 330 L 318 335 L 328 350 L 340 370 L 335 385 L 312 375 L 295 355 Z"
            {...getCountryStyle("pe")}
          />

          {/* Bolivia (bo) */}
          <Path
            id="bo"
            d="M 328 350 L 358 355 L 372 370 L 368 395 L 335 385 L 340 370 Z"
            {...getCountryStyle("bo")}
          />

          {/* Rest of South America (Brazil, Argentina, Chile, Venezuela, etc.) */}
          <Path
            id="sa_rest"
            d="M 315 305 L 338 298 L 360 305 L 390 320 L 420 345 L 430 370 L 410 400 L 390 430 L 370 470 L 360 480 L 350 480 L 352 440 L 335 385 L 368 395 L 372 370 L 358 355 L 328 350 L 318 335 L 330 320 L 322 312 Z"
            {...getCountryStyle("sa_rest")}
          />

          {/* EUROPE */}
          <Path
            id="europe"
            d="M 460 160 L 480 130 L 490 100 L 515 90 L 530 110 L 560 90 L 570 120 L 550 150 L 560 170 L 535 180 L 500 185 L 485 180 Z"
            {...getCountryStyle("eu_rest")}
          />

          {/* AFRICA */}
          {/* Liberia (lr) */}
          <Path
            id="lr"
            d="M 470 278 L 482 282 L 480 288 L 472 285 Z"
            {...getCountryStyle("lr")}
          />

          {/* Nigeria (ng) */}
          <Path
            id="ng"
            d="M 502 268 L 522 268 L 522 282 L 506 282 L 502 276 Z"
            {...getCountryStyle("ng")}
          />

          {/* Cameroon (cm) */}
          <Path
            id="cm"
            d="M 522 268 L 532 268 L 535 285 L 522 285 Z"
            {...getCountryStyle("cm")}
          />

          {/* Gabon (ga) */}
          <Path
            id="ga"
            d="M 522 285 L 535 285 L 535 298 L 522 298 Z"
            {...getCountryStyle("ga")}
          />

          {/* South Africa (za) */}
          <Path
            id="za"
            d="M 545 390 L 575 390 L 585 410 L 580 430 L 565 440 L 550 430 Z"
            {...getCountryStyle("za")}
          />

          {/* Rest of Africa (North, East, Central, Madagascar) */}
          <Path
            id="africa_rest"
            d="M 485 180 L 500 185 L 535 180 L 565 200 L 610 220 L 620 250 L 610 280 L 595 320 L 580 350 L 545 390 L 550 430 L 535 425 L 525 395 L 515 350 L 522 298 M 535 298 L 535 285 L 532 268 M 522 268 L 502 276 L 502 268 M 506 282 L 482 282 M 470 278 L 455 260 L 452 230 L 470 200 Z"
            {...getCountryStyle("af_rest")}
          />
          {/* Madagascar */}
          <Path
            id="madagascar"
            d="M 618 350 L 630 365 L 625 390 L 612 385 Z"
            {...getCountryStyle("mg")}
          />

          {/* ASIA & EURASIA REST */}
          <Path
            id="asia"
            d="M 570 120 L 650 90 L 720 70 L 800 65 L 880 75 L 920 90 L 930 140 L 910 180 L 890 220 L 840 250 L 800 240 L 760 260 L 710 270 L 680 250 L 640 240 L 625 210 L 600 210 L 565 200 Z"
            {...getCountryStyle("as_rest")}
          />

          {/* JAPAN & KOREA ISLANDS */}
          <Path
            id="japan"
            d="M 910 110 L 930 120 L 925 150 L 915 140 Z"
            {...getCountryStyle("jp")}
          />

          {/* SOUTHEAST ASIA ISLANDS (Indonesia, Philippines, etc.) */}
          <Path
            id="southeast_asia"
            d="M 780 280 L 820 285 L 850 310 L 830 330 L 770 310 Z"
            {...getCountryStyle("sea_rest")}
          />

          {/* AUSTRALIA */}
          <Path
            id="australia"
            d="M 820 370 L 880 360 L 915 375 L 925 410 L 905 435 L 840 430 L 815 400 Z"
            {...getCountryStyle("au")}
          />
          {/* New Zealand */}
          <Path
            id="new_zealand"
            d="M 940 440 L 955 455 L 945 470 Z"
            {...getCountryStyle("nz")}
          />
        </G>
      </Svg>

      {/* Map Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>Hábitat natural</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
    alignItems: "center",
    marginTop: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    alignSelf: "flex-start",
  },
  legendDot: {
    width: 10,
    height: 10,
    backgroundColor: "rgba(74, 222, 128, 0.4)",
    borderColor: "#4ade80",
    borderWidth: 1,
    borderRadius: 2,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.4)",
  },
});
