import * as Application from "expo-application";

const parsedBuildNumber = Number(Application.nativeBuildVersion ?? 1);

export const APP_BUILD_NUMBER = Number.isFinite(parsedBuildNumber)
  ? parsedBuildNumber
  : 1;

export function discardPersistedOnVersionBump<T>(fresh: T) {
  return {
    version: APP_BUILD_NUMBER,
    migrate: () => fresh,
  };
}
