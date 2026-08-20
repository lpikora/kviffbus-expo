import { AppStorage } from "@/types/appStorage";

export const clientStorage: AppStorage = {
  getItem: (name: string) => localStorage.getItem(name) ?? null,
  setItem: (name: string, value: string) => localStorage.setItem(name, value),
  removeItem: (name: string) => localStorage.removeItem(name),
};
