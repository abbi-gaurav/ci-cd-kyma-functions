const { afterEach } = require('mocha');
const nock = require('nock');
const baseSite = process.env['BASE_SITE'];
const gatewayURL = process.env['SAP_COMMERCE_CLOUD_COMMERCE_WEBSERVICES_D2E07775_87FA_43B5_923D_189459F0C934_GATEWAY_URL'];
const rewiremock = require('rewiremock/node');
const mockResponses = require('./mock-reponses');

let fakeRedis = new Map();
const overrides = {
    redis: {
        createClient() {
            console.log('mocking create client');
            return fakeRedis;
        }
    }
};
const myFunction = rewiremock.proxy('../triggers/order-created/handler',overrides);

describe("Order created Trigger", () => {
    afterEach(nock.cleanAll);
    after(nock.restore);
    describe("handle event", () => {
        it("saves order data", async () => {
            nock(gatewayURL)
                .get(`/${baseSite}/orders/orderExists`)
                .reply(200,mockResponses.orderExists);
            const orderCode = 'orderExists';
            await myFunction.main({ "data": { "orderCode": orderCode } }, {});
        });
    });
});