import axios from "axios";
import { createType, detailType, getUserListType } from "./userType.ts";
import { UserCreateReqBody } from "@/src/services/UserCreateReqBody";
import { UserDetailInfo } from "@/src/services/UserDetailInfo";

const config = {
    postCreate: function(data: UserCreateReqBody | createType) {
        return axios({
            method: 'post',
            url: '/user/create',
            data: data
        })
    },
    postDetail: function(data: detailType) {
        return axios({
            method: 'post',
            url: '/user/detail',
            data: data
        })
    },
    getGetUserList: function(data: getUserListType) {
        return axios({
            method: 'get',
            url: '/user/getUserList',
            params: data
        })
    },
};
