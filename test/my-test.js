const chai = require('chai');
const myFunction = require('../triggers/order-created/handler');

describe("Order created Trigger",() => {
    it("should handle event", () => {
        myFunction.main({},{});
    })
});