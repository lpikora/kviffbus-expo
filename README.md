# KVIFF Bus

Neoficiální Expo aplikace pro vyhledávání spojů festivalových autobusů (F1, F2, F3) na MFF Karlovy Vary.

## Požadavky

- Node.js 20+
- Expo CLI přes `npx`

## Spuštění

```bash
npm install
npx expo start
```

- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## Testy a kontrola

```bash
npm run type-check
npm test -- --watchAll=false
npm run lint
```

## Struktura

Routing je v `src/app` (Expo Router). Jízdní řády jsou zabalené v `assets/data/data.json`.
