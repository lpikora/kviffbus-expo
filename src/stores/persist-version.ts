import Constants from "expo-constants";

export const APP_BUILD_NUMBER = Number(
  Constants.expoConfig?.android?.versionCode ??
    Constants.expoConfig?.ios?.buildNumber ??
    1,
);

export function discardPersistedOnVersionBump<T>(fresh: T) {
  return {
    version: APP_BUILD_NUMBER,
    migrate: () => fresh,
  };
}
