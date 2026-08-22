import { z } from "zod";

import { stopExceptionSchema } from "./dataSchema";

export type StopExceptionDto = z.infer<typeof stopExceptionSchema>;
