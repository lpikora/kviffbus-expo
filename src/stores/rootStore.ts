import { toErrorCode } from "@/errors/appError";
import { ConnectionService } from "@/services/connectionService";
import { DataService } from "@/services/dataService";
import { clientStorage } from "@/services/storage";
import { AppConfigDto } from "@/types/appConfigDto";
import { ErrorCode } from "@/types/appError";
import { ConnectionDto } from "@/types/connectionDto";
import {
  DepartureDateTimeType,
  TypeOfDepartureDateTimeType,
} from "@/types/departureDateTimeType";
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

export interface StopsStoreState {
  fromStop: StopDto | null;
  toStop: StopDto | null;
  stops: StopDto[];
  connections: ConnectionDto[];
  stopExceptions: StopExceptionDto[];
  departureDateTime: DepartureDateTimeType;
  results: ConnectionDto[];
  appConfig: AppConfigDto | null;
  searchCount: number;
  isLoading: boolean;
  error: ErrorCode | null;
}

export interface StopsStoreActions {
  setFromStop: (stop: StopDto | null) => void;
  setToStop: (stop: StopDto | null) => void;
  setStops: (stops: StopDto[]) => void;
  setConnections: (connections: ConnectionDto[]) => void;
  setStopExceptions: (stopExceptions: StopExceptionDto[]) => void;
  setDepartureDateTime: (
    departureDateTime: Partial<DepartureDateTimeType>,
  ) => void;
  setResults: (results: any[]) => void;
  setAppConfig: (appConfig: any) => void;
  incrementSearchCount: () => void;
  swapStops: () => void;
  syncWithApi: () => Promise<void>;
  initData: () => Promise<void>;
  searchConnections: () => void;
  reset: () => void;
}
export type StopsStore = StopsStoreState & StopsStoreActions;
export const stopsStoreDefaultValues: StopsStoreState = {
  fromStop: null,
  toStop: null,
  stops: [],
  connections: [],
  stopExceptions: [],
  departureDateTime: {
    type: TypeOfDepartureDateTimeType.now,
    date: null,
  },
  results: [],
  appConfig: null,
  searchCount: 0,
  isLoading: false,
  error: null,
};
export const useRootStore = create<StopsStore>()(
  persist(
    (set, get) => ({
      ...stopsStoreDefaultValues,
      setFromStop: (fromStop) => set({ fromStop }),
      setToStop: (toStop) => set({ toStop }),
      setStops: (stops) => set({ stops }),
      setConnections: (connections) => set({ connections }),
      setStopExceptions: (stopExceptions) => set({ stopExceptions }),
      setDepartureDateTime: (departureDateTime) =>
        set((state) => ({
          departureDateTime: {
            ...state.departureDateTime,
            ...departureDateTime,
          },
        })),
      setResults: (results) => set({ results }),
      setAppConfig: (appConfig) => set({ appConfig }),
      incrementSearchCount: () =>
        set((state) => ({ searchCount: state.searchCount + 1 })),
      swapStops: () =>
        set((state) => ({
          fromStop: state.toStop,
          toStop: state.fromStop,
        })),
      syncWithApi: async () => {
        if (__DEV__) {
          console.log("Sync with API skipped because __DEV__ is true");
          return;
        }
        try {
          const remoteData = await DataService.getRemoteData();
          const { appConfig: currentAppConfig } = get();

          if (
            currentAppConfig !== null &&
            remoteData.appConfig.importVersion <= currentAppConfig.importVersion
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
        const { connections } = get();
        if (connections.length > 0) {
          return;
        }
        set({ error: null });
        try {
          const localData = await DataService.getLocalData();

          set({
            stops: localData.stops,
            connections: localData.connections,
            stopExceptions: localData.stopExceptions,
            appConfig: localData.appConfig,
          });
        } catch (error) {
          set({ error: toErrorCode(error) });
          console.warn("Offline/Data load failed", error);
        }
      },
      searchConnections: () => {
        const {
          fromStop,
          toStop,
          departureDateTime,
          connections,
          stops,
          stopExceptions,
          appConfig,
        } = get();

        set({ isLoading: true, error: null });
        try {
          const results = ConnectionService.searchConnections(
            connections,
            stops,
            stopExceptions,
            appConfig,
            {
              fromStop,
              toStop,
              departureDateTime,
            },
          );

          set({ results });
        } catch (error) {
          set({ results: [], error: toErrorCode(error) });
          console.warn("Error in searchConnections", error);
        } finally {
          set({ isLoading: false });
        }
      },
      reset: () => set(stopsStoreDefaultValues),
    }),
    {
      name: "kviffbus-store",
      version: APP_BUILD_NUMBER,
      storage: createJSONStorage(() => clientStorage),
      partialize: (state) => {
        return {
          stops: state.stops,
          connections: state.connections,
          stopExceptions: state.stopExceptions,
          appConfig: state.appConfig,
          fromStop: state.fromStop,
          toStop: state.toStop,
        };
      },
    },
  ),
);
