const providers = {
  ebay: 'ebay',
  amazon: 'amazon',
  cog: 'cog',
  usps: 'usps',
  dhl: 'dhl'
};

const pool = 'http://localhost:3000';
const apis = {};
apis[providers.ebay] = `${pool}/etl/file/order/ebay`;
apis[providers.amazon] = `${pool}/etl/file/order/amazon`;
apis[providers.cog] = `${pool}/etl/file/cog`;
apis[providers.usps] = `${pool}/etl/file/shipping`;
apis[providers.dhl] = `${pool}/etl/file/shipping`;

export { providers, apis };
