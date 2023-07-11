import { FetchClient } from "@odata2ts/http-client-fetch";
import { CpiService } from "./generated/custom/CpiService";

const customClient = new FetchClient();
const baseUrl: string = `http://localhost:4004/v2/cpi/`;
const custom = new CpiService(customClient, baseUrl);

const response = await custom.deploy();
const uuid = response.data.d;
console.log(uuid);
console.log(response);
