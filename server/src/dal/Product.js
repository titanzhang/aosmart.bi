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
  getCostList: async function({type='aos'}) {
    try {
      const client = getClient();
      const body = {
        _source: ['sku'],
        script_fields: {
          cogs: {
            script: {
              source: "def r = params['_source']['cog']; r.sort( (a,b)->(int)(b.effective_date-a.effective_date) ); return r;",
              lang: 'painless'
            }
          }
        },
        query: {
          "term": { "type": type }
        }
      }

      const scrollTime = '5s', pageSize = 100;
      let resp = await client.search({index: config.index, scroll: scrollTime, size: pageSize, body: body});
      if (resp.errors) throw resp.errors;

      let result = [];
      while (resp.hits.hits.length > 0) {
        result = result.concat(
          resp.hits.hits.map( (data) => {
                const cog = data.fields.cogs.map( ({amount, effective_date}) => (
                  ProductDO.cost({ amount: amount, effective_date: effective_date })
                ));
                return ProductDO.product({
                  sku: [].concat(data._source.sku),
                  cog: cog
                });
              })
            );
        resp = await client.scroll({scrollId: resp._scroll_id, scroll: scrollTime});
        if (resp.errors) throw resp.errors;
      }

      return result;
    } catch(e) {
      throw { message: `Product.getCostList: ${e.message||e}` };
    }
  },

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
  product: function({sku, cog}) {
    return {
      sku: sku,
      cog: cog
    }
  },

  cost: function({amount, effective_date}) {
    return {
      amount: amount,
      effective_date: (new Date(effective_date)).getTime()
    };
  }
};

// Module exports
module.exports = {
  DAO: ProductDAO,
  DO: ProductDO
};
