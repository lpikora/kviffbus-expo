import { Stack } from "expo-router/stack";
import { useTranslation } from "react-i18next";

export default function ConnectionLayout() {
  const { t } = useTranslation();
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="results"
        options={{
          title: t("HomeScreen.connections"),
          headerBackButtonDisplayMode: "minimal",
        }}
      />
      <Stack.Screen
        name="stop-picker"
        options={({ route }) => {
          const params = route.params as { field?: "from" | "to" };
          return {
            presentation: "modal",
            title:
              params?.field === "from"
                ? t("StopTextInput.from")
                : t("StopTextInput.to"),
            sheetGrabberVisible: true,
            contentStyle: { backgroundColor: "transparent" },
          };
        }}
      />
    </Stack>
  );
}
