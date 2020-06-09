

const BASE_URL = "https://api.pipefy.com/graphql";
const HEADERS = new Headers({
  "Authorization": `Bearer ${process.env.PIPEFY_TOKEN}`,
  "Content-Type": "application/json"
});


export default class PipefyApi {
  
  constructor() {
    
    console.log("Entrou constructor");
    console.log(HEADERS);
    console.log(`Bearer ${process.env.SECRET}`);

    var myInit = { method: 'POST',
                   headers: HEADERS,
                   mode: 'cors',
                   cache: 'default' };
  }
  
  
}
