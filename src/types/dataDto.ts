import { AppConfigDto } from "./appConfigDto";
import { ConnectionsMap } from "./connectionDto";
import { StopDto } from "./stopDto";
import { StopExceptionDto } from "./stopExceptionDto";

export interface DataDto {
  stops: StopDto[];
  connections: ConnectionsMap;
  appConfig: AppConfigDto;
  stopExceptions: StopExceptionDto[];
}
