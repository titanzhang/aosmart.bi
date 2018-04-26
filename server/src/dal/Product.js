const ElasticSearch = require('elasticsearch');

// Order DAO
const config = {
  name: 'product',
  index: 'product',
  type: 'doc'
};

let client = null;

function getClient() {
  const cfg = require('../entry/config.elasticsearch')[config.name];
  if (!client) {
    client = new ElasticSearch.Client({
      host: cfg.host,
      apiVersion: cfg.version
    });
  }
  return client;
}

const ProductDAO = {
  // list: [ {sku, cost}]
  // sku: string; cost: ProductDO.cost
  bulkAddCog: async function({list, type='aos'}) {
    const client = getClient();
    const body = [];
    for (const data of list) {
      const action = {
        update: { _index: config.index, _type: config.type, _id: data.sku }
      };
      const doc = {
        script: {
          lang: 'painless',
          source: 'ctx._source.cog.add(params.cog)',
          params: { cog: data.cost }
        },
        upsert: {
          type: type,
          sku: [ data.sku ],
          cog: [ data.cost ]
        }
      };

      body.push(action);
      body.push(doc);
    }

    const response = await client.bulk({body: body});
    const failIDs = [], successIDs = [];
    for (const item of response.items) {
      const data = item.update;
      if (data.error) {
        failIDs.push(data._id);
      } else {
        successIDs.push(data._id);
      }
    }
    return { status: !response.errors, fail: failIDs, success: successIDs };
  }
};

// Product DO
const ProductDO = {

  cost: function({amount, effective_date}) {
    return {
      amount: amount,
      effective_date: effective_date
    };
  }
};

// Module exports
module.exports = {
  DAO: ProductDAO,
  DO: ProductDO
};
