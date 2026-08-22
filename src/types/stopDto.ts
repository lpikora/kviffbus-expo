import { z } from "zod";

import { stopSchema } from "./dataSchema";

export type StopDto = z.infer<typeof stopSchema>;

export type TypeOfStopType = "from" | "to";
