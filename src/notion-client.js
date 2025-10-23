const axios = require("axios");
const storage = require("./storage");
const { rateLimitWait } = require("./utils");

class NotionClient {
  constructor() {
    this.baseUrl = "https://api.notion.com/v1";
    this.notionVersion = "2022-06-28";
  }

  async getAccessToken() {
    // Get token directly from storage (no Avery API needed)
    return storage.getNotionAccessToken();
  }

  async request(method, path, payload = null) {
    const token = await this.getAccessToken();
    if (!token) {
      throw new Error("Notion access token unavailable");
    }

    const url = `${this.baseUrl}${path}`;

    try {
      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": this.notionVersion,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const err = new Error(
          `Notion API error ${error.response.status}: ${JSON.stringify(
            error.response.data
          )}`
        );
        err.status = error.response.status;
        throw err;
      }
      throw error;
    }
  }

  async searchPages(query, startCursor) {
    await rateLimitWait();
    return this.request("post", "/search", {
      query: query || "",
      page_size: 25,
      start_cursor: startCursor,
    });
  }

  async createDatabase(params) {
    await rateLimitWait();
    return this.request("post", "/databases", {
      parent: { page_id: params.parentPageId },
      title: [
        {
          type: "text",
          text: { content: params.title || "Avery Transactions" },
        },
      ],
      properties: params.properties,
    });
  }

  async queryDatabase(params) {
    await rateLimitWait();
    return this.request("post", `/databases/${params.databaseId}/query`, {
      filter: params.filter,
      sorts: params.sorts,
      page_size: params.page_size || 25,
      start_cursor: params.start_cursor,
    });
  }

  async createPage(params) {
    await rateLimitWait();
    return this.request("post", "/pages", {
      parent: { database_id: params.databaseId },
      properties: params.properties,
    });
  }

  async updatePage(params) {
    await rateLimitWait();
    return this.request("patch", `/pages/${params.pageId}`, {
      properties: params.properties,
    });
  }

  async getDatabase(databaseId) {
    await rateLimitWait();
    return this.request("get", `/databases/${databaseId}`);
  }
}

module.exports = NotionClient;
