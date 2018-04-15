const providers = {
  ebay: 'ebay',
  amazon: 'amazon'
};

const apis = {};
apis[providers.ebay] = 'http://localhost:3000/etl/file/ebay';
apis[providers.amazon] = 'http://localhost:3000/etl/file/amazon';

export { providers, apis };
