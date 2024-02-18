import { request } from "../functions/request.js";

export class RequestHandler {
  requests = new Map();
  responses = new Map();
  executed = false;

  constructor() {}

  prepareRequest(name, { method, url, data = null }) {
    if (this.requests.has(name) || this.executed) return false;
    this.requests.set(name, { method, url, data });
    return true;
  }

  makeRequest() {
    this.executed = true;
    return new Promise(async (resolve) => {
      const pendingRequests = [];
      for (const requestObj of this.requests.values()) {
        pendingRequests.push(request(requestObj.method, requestObj.url, requestObj.data));
      }
      const resolvedRequests = await Promise.all(pendingRequests);
      for (const name of this.requests.keys()) {
        this.responses.set(name, resolvedRequests.shift());
      }
      resolve();
    });
  }

  checkStatusAll(statusCode) {
    for (const response of this.responses.values()) {
      if (response?.status != statusCode) return false;
    }
    return true;
  }

  getResponse(name) {
    if (!this.responses.has(name) || !this.executed) return null;
    return this.responses.get(name);
  }

  getStatus(name) {
    if (!this.responses.has(name) || !this.executed) return null;
    return this.responses.get(name)?.status;
  }

  getData(name) {
    if (!this.responses.has(name) || !this.executed) return null;
    return this.responses.get(name)?.data;
  }
}
