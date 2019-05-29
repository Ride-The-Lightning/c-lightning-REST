var Request = require("request");

describe("Server", () => {
    var server;    

    beforeAll(() => {
        server = require("../cl-rest");
    });

    afterAll(() => {
        server.closeServer();
    });
    
    it("GetInfo", () => {
        var data = {};
        Request.get("http://localhost:3001/api/getinfo", (error, response, body) => {
            data.status = response.statusCode;
            data.body = body;
            expect(data.status).toBe(200);
            done();
        });
        
    });

    it("GetInfo Custom", () => {
        var data = {};
        Request.get("http://localhost:3001/api/getinfo/custom", (error, response, body) => {
            data.status = response.statusCode;
            data.body = body;
            expect(data.status).toBe(200);
            done();
        });
    });

    it("NewAddr", () => {
        var data = {};
        Request.get("http://localhost:3001/api/newaddr", (error, response, body) => {
            data.status = response.statusCode;
            data.body = body;
            expect(data.status).toBe(200);
            done();
        });
    });
   
    it("RemoteBal", () => {
        var data = {};
        Request.get("http://localhost:3001/api/localremotebal", (error, response, body) => {
            data.status = response.statusCode;
            data.body = body;
            expect(data.status).toBe(200);
            done();
        });
    });
});