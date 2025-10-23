function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rateLimitWait() {
  await sleep(350);
}

async function withBackoff(fn) {
  const maxRetries = 3;
  let delay = 500;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (e) {
      const status = e && e.status;
      if (
        (status === 429 || (status >= 500 && status < 600)) &&
        attempt < maxRetries
      ) {
        await sleep(delay);
        delay *= 2;
        continue;
      }
      throw e;
    }
  }
}

module.exports = {
  sleep,
  rateLimitWait,
  withBackoff,
};

