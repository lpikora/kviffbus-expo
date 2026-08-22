import { clientStorage } from "@/services/storage";
import { ErrorCode } from "@/types/appError";
import { ConnectionResult } from "@/types/connectionResult";
import {
  DepartureDateTimeType,
  TypeOfDepartureDateTimeType,
} from "@/types/departureDateTimeType";
import { StopDto } from "@/types/stopDto";
import Constants from "expo-constants";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const APP_BUILD_NUMBER = Number(
  Constants.expoConfig?.android?.versionCode ??
    Constants.expoConfig?.ios?.buildNumber ??
    1,
);

export interface SearchStoreState {
  fromStop: StopDto | null;
  toStop: StopDto | null;
  departureDateTime: DepartureDateTimeType;
  results: ConnectionResult[];
  isLoading: boolean;
  error: ErrorCode | null;
}

export interface SearchStoreActions {
  setFromStop: (stop: StopDto | null) => void;
  setToStop: (stop: StopDto | null) => void;
  setDepartureDateTime: (
    departureDateTime: Partial<DepartureDateTimeType>,
  ) => void;
  setError: (error: ErrorCode | null) => void;
  swapStops: () => void;
  reset: () => void;
}

export type SearchStore = SearchStoreState & SearchStoreActions;

export const searchStoreDefaultValues: SearchStoreState = {
  fromStop: null,
  toStop: null,
  departureDateTime: {
    type: TypeOfDepartureDateTimeType.now,
    date: null,
  },
  results: [],
  isLoading: false,
  error: null,
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      ...searchStoreDefaultValues,
      setFromStop: (fromStop) => set({ fromStop }),
      setToStop: (toStop) => set({ toStop }),
      setDepartureDateTime: (departureDateTime) =>
        set((state) => ({
          departureDateTime: {
            ...state.departureDateTime,
            ...departureDateTime,
          },
        })),
      setError: (error) => set({ error }),
      swapStops: () =>
        set((state) => ({
          fromStop: state.toStop,
          toStop: state.fromStop,
        })),
      reset: () => set(searchStoreDefaultValues),
    }),
    {
      name: "kviffbus-search",
      version: APP_BUILD_NUMBER,
      storage: createJSONStorage(() => clientStorage),
      partialize: (state) => ({
        fromStop: state.fromStop,
        toStop: state.toStop,
      }),
    },
  ),
);
