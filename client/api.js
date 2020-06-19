import axios from 'axios';

const BASE_URL = "https://calm-island-50193.herokuapp.com";
const TIMEOUT = 1000;  // time in miliseconds

export default class PipefyApi {
  
  constructor() {
  
    this.api = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
    
  }
  
  get_instance() {
    return this.api;
  }
  
}
