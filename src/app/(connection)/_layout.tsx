import { Stack } from "expo-router/stack";

export default function ConnectionLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="results" options={{ title: "Výsledky" }} />
      <Stack.Screen
        name="stop-picker"
        options={{
          presentation: "modal",
          title: "Vybrat zastávku",
          sheetGrabberVisible: true,
          headerTransparent: true,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          presentation: "modal",
          title: "",
          headerShown: false,
          sheetGrabberVisible: true,
          sheetAllowedDetents: [0.25, 0.5, 1.0],
          sheetLargestUndimmedDetentIndex: 1,
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    </Stack>
  );
}
