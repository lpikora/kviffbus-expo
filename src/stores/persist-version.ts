import * as Application from "expo-application";

export const APP_BUILD_NUMBER = Number(Application.nativeBuildVersion ?? 1);

export function discardPersistedOnVersionBump<T>(fresh: T) {
  return {
    version: APP_BUILD_NUMBER,
    migrate: () => fresh,
  };
}
