import { FastApi } from "./lib/index";
// APS-lO49y1ymqVR3nAk9pqB94qBCdyizOwKW
const fastApi = new FastApi({
  Authorization: "APS-lO49y1ymqVR3nAk9pqB94qBCdyizOwKW",
  configOptions: {
    scope: {
      type: "ALL",
    },
  },
});

fastApi.requestApi();
