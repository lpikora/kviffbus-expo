import { AppStorage } from "@/types/appStorage";

export function createMemoryStorage(): AppStorage & {
  store: Map<string, string>;
} {
  const store = new Map<string, string>();

  return {
    store,
    getItem: (name: string) => store.get(name) ?? null,
    setItem: (name: string, value: string) => {
      store.set(name, value);
    },
    removeItem: (name: string) => {
      store.delete(name);
    },
  };
}

export async function flushPersistWrites() {
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
}
