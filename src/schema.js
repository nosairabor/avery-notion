function getNotionTransactionsDbSchema() {
  return {
    Name: { title: {} },
    Date: { date: {} },
    Amount: { number: {} },
    Category: { select: { options: [] } },
    Account: { select: { options: [] } },
    Merchant: { rich_text: {} },
    Status: { select: { options: [{ name: "posted" }, { name: "pending" }] } },
    "Transaction ID": { rich_text: {} },
    Notes: { rich_text: {} },
  };
}

module.exports = {
  getNotionTransactionsDbSchema,
};

