// Only for testing, remove this on production
require('dotenv').config();

const axios = require("axios");
const { flatten } = require("lodash");
const { convert_date } = require("./utils");

const BASE_URL = "https://calm-island-50193.herokuapp.com";

module.exports = class LMSApiService {

    constructor() {
        this.axios = axios.create({
            baseURL: BASE_URL,
            timeout: 6000000, // 10 minutos de request
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    search_lms() {
        return this.axios.get(`${BASE_URL}/start_exams_craw`);
    }

};
