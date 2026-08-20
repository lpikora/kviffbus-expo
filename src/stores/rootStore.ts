import { DataService } from "@/services/dataService";
import { clientStorage } from "@/services/storage";
import { ConnectionDto } from "@/types/connectionDto";
import {
  DepartureDateTimeType,
  TypeOfDepartureDateTimeType,
} from "@/types/departureDateTimeType";
import { StopDto } from "@/types/stopDto";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface StopsStoreState {
  fromStop: StopDto | null;
  toStop: StopDto | null;
  stops: StopDto[];
  connections: ConnectionDto[];
  departureDateTime: DepartureDateTimeType;
  results: any[];
  appConfig: any | null;
  searchCount: number;
}

export interface StopsStoreActions {
  setFromStop: (stop: StopDto | null) => void;
  setToStop: (stop: StopDto | null) => void;
  setStops: (stops: StopDto[]) => void;
  setConnections: (connections: ConnectionDto[]) => void;
  setDepartureDateTime: (
    departureDateTime: Partial<DepartureDateTimeType>,
  ) => void;
  setResults: (results: any[]) => void;
  setAppConfig: (appConfig: any) => void;
  incrementSearchCount: () => void;
  swapStops: () => void;
  syncWithApi: () => Promise<void>;
  reset: () => void;
}
export type StopsStore = StopsStoreState & StopsStoreActions;
export const stopsStoreDefaultValues: StopsStoreState = {
  fromStop: null,
  toStop: null,
  stops: DataService.getLocalData().stops,
  connections: DataService.getLocalData().connections,
  departureDateTime: {
    type: TypeOfDepartureDateTimeType.now,
    date: null,
  },
  results: [],
  appConfig: DataService.getLocalData().appConfig,
  searchCount: 0,
};
export const useRootStore = create<StopsStore>()(
  persist(
    (set, get) => ({
      ...stopsStoreDefaultValues,
      setFromStop: (fromStop) => set({ fromStop }),
      setToStop: (toStop) => set({ toStop }),
      setStops: (stops) => set({ stops }),
      setConnections: (connections) => set({ connections }),
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
        try {
          const remoteData = await DataService.fetchLatestData();
          const current = get();

          // TODO check only version
          const stopsChanged =
            JSON.stringify(current.stops) !== JSON.stringify(remoteData.stops);
          const configChanged =
            JSON.stringify(current.appConfig) !==
            JSON.stringify(remoteData.appConfig);
          const connectionsChanged =
            JSON.stringify(current.connections) !==
            JSON.stringify(remoteData.connections);

          if (stopsChanged || configChanged || connectionsChanged) {
            set({
              ...(stopsChanged && { stops: remoteData.stops }),
              ...(configChanged && { appConfig: remoteData.appConfig }),
              ...(connectionsChanged && {
                connections: remoteData.connections,
              }),
            });
          }
        } catch (error) {
          console.warn(
            "API offline / chyba. Ponechána data z data.json",
            error,
          );
        }
      },
      reset: () => set(stopsStoreDefaultValues),
    }),
    {
      name: "kviffbus-store",
      storage: createJSONStorage(() => clientStorage),
      partialize: (state) => ({
        stops: state.stops,
        connections: state.connections,
        appConfig: state.appConfig,
        fromStop: state.fromStop,
        toStop: state.toStop,
        // departureDateTime NENÍ -> při startu aplikace bude vždy defaultní
        // results i searchCount NENÍ -> po restartu začnou znova
      }),
    },
  ),
);
