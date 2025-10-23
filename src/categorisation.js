const storage = require("./storage");

function applyCategoryRulesToTx(tx) {
  const rules = storage.listCategoryRules();
  const desc = (tx.description || tx.merchant || tx.memo || "").toLowerCase();

  for (const rule of rules) {
    if (desc.includes(rule.match)) {
      tx.avery_category = rule.category;
      break;
    }
  }

  return tx;
}

module.exports = {
  applyCategoryRulesToTx,
};

