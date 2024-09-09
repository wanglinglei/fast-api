import axios from "axios";
import { CreateType } from "./groupType.ts";

const config = {
    getCreate: function(data: CreateType) {
        return axios({
            method: 'get',
            url: '/group/Create',
            params: data
        })
    },
};
