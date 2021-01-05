const { afterEach } = require('mocha');
const redisMock = require("redis-mock");
//TODO: Use the mock redis instead of Map
const mockRedisClient = redisMock.createClient();
const fakeRedis = new Map();
const nock = require('nock');
const baseSite = process.env['BASE_SITE'];
const rewiremock = require('rewiremock/node');
const utils = require('./utils');
const { expect } = require('chai');

const overrides = {
    redis: {
        createClient() {
            console.log('create client');
            return fakeRedis;
        }
    }
};

const myFunction = rewiremock.proxy('../triggers/order-created/handler', overrides);
describe("Order created Trigger", () => {
    afterEach(nock.cleanAll);
    after(nock.restore);
    describe("handle event", () => {
        it("saves order data", async () => {
            const orderCode = 'orderExists';
            nock("https://any.url", {
                filteringScope: function (_scope) {
                    return true;
                }
            })
                .get(`/${baseSite}/orders/${orderCode}`)
                .reply(200, utils.orderDetails);
            const event = utils.createEvent(orderCode);
            await myFunction.main(event, {});
            expect(JSON.parse(fakeRedis.get(orderCode))).to.be.eql(utils.orderDetails);
            expect(event.extensions.response.statusCode).to.be.eql(200);
        });
        it('fails when oder data is not found', async () => {
            const orderCode = 'orderDoesNotExist';
            nock("https://any.url", {
                filteringScope: function (_scope) {
                    return true;
                }
            })
                .get(`/${baseSite}/orders/${orderCode}`)
                .reply(404);
            const event = utils.createEvent(orderCode);
            await myFunction.main(event, {})
            expect(event.extensions.response.statusCode).to.be.eql(500);
        })
    });
});