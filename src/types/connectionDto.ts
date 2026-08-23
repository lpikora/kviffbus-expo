import { z } from "zod";

import { connectionSchema } from "./dataSchema";

export type ConnectionDto = z.infer<typeof connectionSchema>;
export type ConnectionsMap = Record<string, ConnectionDto[]>;
