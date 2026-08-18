import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

// TODO: Integrovat mapovou komponentu (např. react-native-maps nebo expo-maps)
export default function MapScreen() {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.placeholder}>
        🗺️ Mapa — připravuje se
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholder: {
    fontSize: 18,
    opacity: 0.5,
  },
});
