const providers = {
  ebay: 'ebay',
  amazon: 'amazon'
};

const pool = 'http://localhost:3000';
const apis = {};
apis[providers.ebay] = `${pool}/etl/file/order/ebay`;
apis[providers.amazon] = `${pool}/etl/file/amazon`;

export { providers, apis };
