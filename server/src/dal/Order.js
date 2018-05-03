const ElasticSearch = require('elasticsearch');

// Order DAO
const config = {
  name: 'order',
  index: 'order',
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

function buildQuery({docType, dateStart, dateEnd, accounts}) {
  const terms = [];
  if (docType) terms.push({term: {type: docType}});
  if (dateStart && dateEnd) terms.push({range: {date: {gte: dateStart.getTime(), lte: dateEnd.getTime()}}});
  if (accounts && accounts.length > 0) terms.push({ terms: { store_full: accounts.map( ({site, account}) => `${site}_${account}`)}});

  return {bool: {must: terms}};
}

function buildSaleAggregations() {
  return {
    cot: {
      sum: {field: 'cot.shipping'}
    },
    sale_amount: {
      sum: {field: 'amount_paid'}
    },
    product_info: {
      nested: {path: 'products'},
      aggs: {
        sale_count: {sum: {field: 'products.quantity'}},
        cog: {sum: {script: 'doc["products.quantity"].value * doc["products.cog"].value'}}
        // sale_amount: {sum: {script: 'doc["products.quantity"].value * doc["products.price"].value'}}
      }
    }
  };
}

const OrderDAO = {
  insertBulk: async function({list}) {
    const client = getClient();
    const body = [];
    for (const doc of list) {
      const action = {
        create: { _index: config.index, _type: config.type, _id: doc.order_no }
      };
      body.push(action);
      body.push(doc);
    }

    const response = await client.bulk({body: body});
    const failIDs = [], successIDs = [];
    for (const item of response.items) {
      const data = item.create;
      if (data.error) {
        failIDs.push(data._id);
      } else {
        successIDs.push(data._id);
      }
    }
    return { status: !response.errors, fail: failIDs, success: successIDs };
  },

  bulkUpdateCot: async function({orders}) {
    const client = getClient();
    const body = [];
    for (const {order_no, cot} of orders) {
      const action = {
        update: { _index: config.index, _type: config.type, _id: order_no }
      };
      const doc = {
        doc: {
          cot: cot
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
  },

  sumByDateAccountDaily: async function({docType, dateStart, dateEnd, accounts}) {
    try {
      const client = getClient();
      const body = {
        size: 0,
        query: buildQuery({docType: docType, dateStart: dateStart, dateEnd: dateEnd, accounts: accounts}),
        aggs: {
          group_by_day: {
            date_histogram: {field: 'date', interval: 'day'},
            aggs: buildSaleAggregations()
          }
        }
      };

      const resp = await client.search({index: config.index, body: body});
      if (resp.errors) throw resp.errors;

      return resp.aggregations.group_by_day.buckets.map( (data) => {
        return {
          date: new Date(data.key),
          orderCount: data.doc_count,
          saleCount: data.product_info.sale_count.value,
          saleAmount: data.sale_amount.value,
          cogAmount: data.product_info.cog.value,
          cotAmount: data.cot.value
        }
      });

    } catch(e) {
      throw { message: `Order.statByDateAccountDaily: ${e.message||e}` };
    }
  },

  // account: { site: ..., account: ... }
  sumByDateAccount: async function({docType='aos', dateStart, dateEnd, accounts}) {
    try {
      const client = getClient();
      const body = {
        size: 0,
        query: buildQuery({docType: docType, dateStart: dateStart, dateEnd: dateEnd, accounts: accounts}),
        aggs: buildSaleAggregations()
      };

      const response = await client.search({
        index: config.index,
        body: body
      });

      if (response.errors) {
        throw response.errors;
      }

      return {
        orderCount: response.hits.total,
        saleCount: response.aggregations.product_info.sale_count.value,
        saleAmount: response.aggregations.sale_amount.value,
        cogAmount: response.aggregations.product_info.cog.value,
        cotAmount: response.aggregations.cot.value
      };

    } catch(e) {
      throw { message: `Order.countByDateAccount: ${e.message||e}` };
    }
  },

};

// Order DO
const OrderDO = {
  buyer: function({name, street1, street2, city, state, country, postal_code}) {
    return {
      name: name,
      street1: street1,
      street2: street2,
      city: city,
      state: state,
      country: country,
      postal_code: postal_code
    };
  },

  product: function({sku, quantity, price, cog = 0}) {
    return {
      sku: sku,
      quantity: quantity,
      price: price,
      cog: cog
    };
  },

  cot: function({shipping}) {
    const dataObj = {};
    if (shipping) dataObj.shipping = shipping;

    return dataObj;
  },

  order: function({type='aos', order_no, buyer, amount_paid, cot, site, store, store_full, products, date}) {
    const dataObj = {};
    dataObj.type = type;
    dataObj.order_no = order_no;
    dataObj.amount_paid = amount_paid;
    dataObj.site = site;
    dataObj.store = store;
    dataObj.store_full = store_full || `${site}_${store}`;
    dataObj.date = date;
    if (buyer) dataObj.buyer = buyer;
    if (cot) dataObj.cot = cot;
    if (products) dataObj.products = products;

    return dataObj;
  }
}

// Module exports
module.exports = {
  DAO: OrderDAO,
  DO: OrderDO
};
