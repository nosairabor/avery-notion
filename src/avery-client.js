const axios = require("axios");
const storage = require("./storage");

class AveryClient {
  constructor() {
    this.baseUrl = process.env.AVERY_BASE_URL || "https://app.averyapp.ai";
  }

  getUserToken() {
    return storage.getUserToken();
  }

  async request(method, path, data = null, headers = {}) {
    // Auth is via authkey header + email in path, not userToken
    const url = `${this.baseUrl}${path}`;

    const config = {
      method,
      url,
      headers: {
        "Content-Type": "application/json",
        authkey:
          "AQ5PFMtahUrQcWUkJT14vJcX53aj0ARihbmGzZNGBnoCbfxan0VRMyRfngb0A3Np81c=",
        ...headers,
      },
    };

    // Only include data for POST/PUT/PATCH requests
    if (data && method.toLowerCase() !== "get") {
      config.data = data;
    }

    try {
      const response = await axios(config);

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Avery API error ${error.response.status}: ${JSON.stringify(
            error.response.data
          )}`
        );
      }
      throw error;
    }
  }

  async listUserTransactionsWithinPeriod(email, fromDate, toDate) {
    return this.request(
      "get",
      `/transactions/user/${encodeURIComponent(
        email
      )}?fromDate=${fromDate}&toDate=${toDate}`
    );
  }

  async listAccountsForEmail(email) {
    return this.request("get", `/accounts/user/${encodeURIComponent(email)}`);
  }

  async applyPromoCode(email, code) {
    return this.request("post", "/promotion/oncely", {
      code,
      email,
    });
  }

  async trackEvent(email, event, data = {}) {
    return this.request("post", "/plugin/track", {
      email,
      event,
      data,
      openBankingProviderName: "gocardless",
    });
  }

  async checkForExpiredConsent(email) {
    return this.request("get", `/consent/expired/${encodeURIComponent(email)}`);
  }

  async aiSuggestCategories(transactionDescriptions, categories) {
    return this.request("post", "/ai/categorize", {
      transactions: transactionDescriptions,
      categories: categories,
    });
  }

  async createUser(email) {
    // Create/get user by email - returns user object with token
    // Note: This endpoint doesn't require a userToken yet, so we use axios directly
    // but we still need the authkey header
    const url = `${this.baseUrl}/user/`;
    try {
      const response = await axios({
        method: "post",
        url,
        data: { email },
        headers: {
          "Content-Type": "application/json",
          authkey:
            "AQ5PFMtahUrQcWUkJT14vJcX53aj0ARihbmGzZNGBnoCbfxan0VRMyRfngb0A3Np81c=",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(
          `Avery API error ${error.response.status}: ${JSON.stringify(
            error.response.data
          )}`
        );
      }
      throw error;
    }
  }
}

module.exports = AveryClient;
