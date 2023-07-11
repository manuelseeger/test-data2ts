import { ConfigFileOptions, EmitModes, Modes } from "@odata2ts/odata2ts";

const config: ConfigFileOptions = {
  allowRenaming: true,
  prettier: true,
  mode: Modes.service,
  emitMode: EmitModes.ts,
  converters: ["@odata2ts/converter-luxon", "@odata2ts/converter-v2-to-v4"],
  services: {
    custom: {
      source: "assets/custom.xml",
      output: "src/generated/custom",
    },
  },
};

export default config;
