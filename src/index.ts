import { FastApi } from "./lib/index";
const fastApi = new FastApi({
  Authorization: "APS-lO49y1ymqVR3nAk9pqB94qBCdyizOwKW",
  projectId: "5090530",
  configOptions: {
    scope: {
      type: "ALL",
    },
  },
  output: {
    modalDir: "/debug/modals",
  },
});

fastApi.requestApi();
