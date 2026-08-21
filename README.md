# KVIFF Bus

Neoficiální Expo aplikace pro vyhledávání spojů festivalových autobusů (F1, F2, F3) na MFF Karlovy Vary.

## Požadavky

- Node.js 24+
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
npm run test:ci
npm run lint
```

## Architektura

Routing je v `src/app` (Expo Router). Hledání spojů žije v `ConnectionService`, UI ho jen spouští a zobrazuje výsledky.

Offline-first jízdní řády:

1. Bundled `assets/data/data.json` se načte po startu (a přepíše cache, když má novější `importVersion`).
2. Zustand persistuje zastávky, spoje a config do MMKV.
3. Na pozadí se stáhne remote JSON (`appConfig.dataUrl`), validuje se přes Zod a použije se jen při novější `importVersion`.

```
bundled data.json → MMKV persist → remote sync (importVersion)
```

## Preview build (EAS)

Jednorázově (vyžaduje Expo účet):

```bash
npx eas-cli@latest login
npx eas-cli@latest init
```

Pak:

```bash
npx eas-cli@latest build --profile preview --platform android
```
