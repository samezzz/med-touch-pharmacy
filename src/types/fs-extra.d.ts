declare module "fs-extra" {
  import * as fs from "fs";
  export * from "fs";
  const fsExtra: typeof fs & Record<string, unknown>;
  export default fsExtra;
}


