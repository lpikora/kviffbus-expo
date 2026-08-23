import { z } from "zod";

import { appConfigSchema } from "./dataSchema";

export type AppConfigDto = z.infer<typeof appConfigSchema>;
