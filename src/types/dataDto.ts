import { AppConfigDto } from "./appConfigDto";
import { ConnectionDto } from "./connectionDto";
import { StopDto } from "./stopDto";
import { StopExceptionDto } from "./stopExceptionDto";

export interface DataDto {
  stops: StopDto[];
  connections: ConnectionDto[];
  appConfig: AppConfigDto;
  stopExceptions: StopExceptionDto[];
}
