import { AppStorage } from "@/types/appStorage";
import { createMMKV } from "react-native-mmkv";

const storage = createMMKV({ id: "kviff-bus-storage" });

export const clientStorage: AppStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.remove(name),
};
