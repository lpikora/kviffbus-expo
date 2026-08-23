import { z } from "zod";

import { dataVersionDtoSchema } from "./dataSchema";

export type DataVersionDto = z.infer<typeof dataVersionDtoSchema>;
