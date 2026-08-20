import { DataService } from "@/services/dataService";
import { StopDto } from "@/types/stopDto";
import { create } from "zustand";
export enum TypeOfDepartureDateTimeType {
  now,
  dateTime,
}
export interface DepartureDateTimeType {
  type: TypeOfDepartureDateTimeType;
  date: Date | null;
}
export interface StopsStoreState {
  fromStop: StopDto | null;
  toStop: StopDto | null;
  stops: StopDto[];
  departureDateTime: DepartureDateTimeType;
  results: any[];
  appConfig: any | null;
  searchCount: number;
}

export interface StopsStoreActions {
  setFromStop: (stop: StopDto | null) => void;
  setToStop: (stop: StopDto | null) => void;
  setStops: (stops: StopDto[]) => void;
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
  departureDateTime: {
    type: TypeOfDepartureDateTimeType.now,
    date: null,
  },
  results: [],
  appConfig: DataService.getLocalData().appConfig,
  searchCount: 0,
};
export const useRootStore = create<StopsStore>((set, get) => ({
  ...stopsStoreDefaultValues,
  setFromStop: (fromStop) => set({ fromStop }),
  setToStop: (toStop) => set({ toStop }),
  setStops: (stops) => set({ stops }),
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

      if (stopsChanged || configChanged) {
        set({
          ...(stopsChanged && { stops: remoteData.stops }),
          ...(configChanged && { appConfig: remoteData.appConfig }),
        });
      }
    } catch (error) {
      console.warn("API offline / chyba. Ponechána data z data.json", error);
    }
  },
  reset: () => set(stopsStoreDefaultValues),
}));
