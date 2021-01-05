const axios = require("axios");
const BASE_SITE = process.env['BASE_SITE'];
const OCC_API_URL = process.env['SAP_COMMERCE_CLOUD_COMMERCE_WEBSERVICES_D2E07775_87FA_43B5_923D_189459F0C934_GATEWAY_URL'];
var redis = require("redis"),
    redisClient = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

module.exports = {
    main : async function (event, context) {
        console.log(JSON.stringify(event.data));
        const orderCode = event.data.orderCode;
        try{
            const orderData = await getOrder(orderCode,BASE_SITE);
            redisClient.set(orderCode, JSON.stringify(orderData));
            event.extensions.response.status(200).send();
        }catch(error) {
            console.log(error);
            event.extensions.response.status(500).send("Error");
        }
    }
}

async function getOrder(code, site) {
    const ordersUrl = `${OCC_API_URL}/${site}/orders/${code}`;
    console.log("orderUrl: %s", ordersUrl);
    const response = await axios.get(ordersUrl);
    return response.data;
}