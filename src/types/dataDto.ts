import { z } from "zod";

import { dataDtoSchema } from "./dataSchema";

export type DataDto = z.infer<typeof dataDtoSchema>;
