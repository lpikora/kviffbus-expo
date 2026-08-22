import { getLocalData, getRemoteData } from "@/services/data-service";
import { clientStorage } from "@/services/storage";
import { isNewerImportVersion } from "@/utils/import-version";
import { AppConfigDto } from "@/types/appConfigDto";
import { ConnectionsMap } from "@/types/connectionDto";
import { StopDto } from "@/types/stopDto";
import { StopExceptionDto } from "@/types/stopExceptionDto";
import Constants from "expo-constants";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const APP_BUILD_NUMBER = Number(
  Constants.expoConfig?.android?.versionCode ??
    Constants.expoConfig?.ios?.buildNumber ??
    1,
);

export interface DataStoreState {
  stops: StopDto[];
  connections: ConnectionsMap;
  stopExceptions: StopExceptionDto[];
  appConfig: AppConfigDto | null;
}

export interface DataStoreActions {
  syncWithApi: () => Promise<void>;
  initData: () => Promise<void>;
  reset: () => void;
}

export type DataStore = DataStoreState & DataStoreActions;

export const dataStoreDefaultValues: DataStoreState = {
  stops: [],
  connections: {},
  stopExceptions: [],
  appConfig: null,
};

export const useDataStore = create<DataStore>()(
  persist(
    (set, get) => ({
      ...dataStoreDefaultValues,
      syncWithApi: async () => {
        try {
          const { appConfig: currentAppConfig } = get();
          const remoteData = await getRemoteData(currentAppConfig?.dataUrl);

          if (
            currentAppConfig !== null &&
            !isNewerImportVersion(
              remoteData.appConfig.importVersion,
              currentAppConfig.importVersion,
            )
          ) {
            return;
          }

          set({
            stops: remoteData.stops,
            connections: remoteData.connections,
            stopExceptions: remoteData.stopExceptions,
            appConfig: remoteData.appConfig,
          });
        } catch (error) {
          console.warn(
            "API offline / chyba. Ponechána data z data.json",
            error,
          );
        }
      },
      initData: async () => {
        try {
          const localData = await getLocalData();
          const { connections, appConfig } = get();
          const persistedIsCurrent =
            Object.keys(connections).length > 0 &&
            appConfig !== null &&
            !isNewerImportVersion(
              localData.appConfig.importVersion,
              appConfig.importVersion,
            );

          if (persistedIsCurrent) {
            return;
          }

          set({
            stops: localData.stops,
            connections: localData.connections,
            stopExceptions: localData.stopExceptions,
            appConfig: localData.appConfig,
          });
        } catch (error) {
          console.warn("Offline/Data load failed", error);
          throw error;
        }
      },
      reset: () => set(dataStoreDefaultValues),
    }),
    {
      name: "kviffbus-store",
      version: APP_BUILD_NUMBER,
      storage: createJSONStorage(() => clientStorage),
      partialize: (state) => ({
        stops: state.stops,
        connections: state.connections,
        stopExceptions: state.stopExceptions,
        appConfig: state.appConfig,
      }),
    },
  ),
);
