export enum ErrorCode {
  MissingStops = "errors.missingStops",
  DataNotReady = "errors.dataNotReady",
  DataLoadFailed = "errors.dataLoadFailed",
  SearchFailed = "errors.searchFailed",
  Unknown = "errors.unknown",
}

export type ErrorTranslationKey = {
  [K in ErrorCode]: K extends `errors.${infer Rest}` ? Rest : never;
}[ErrorCode];
