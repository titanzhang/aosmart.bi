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

  // account: { site: ..., account: ... }
  countByDateAccount: async function({docType, dateStart, dateEnd, accounts}) {
    try {

      if (!docType) docType = 'aos';
      const client = getClient();
      const body = {
        size: 0,
        query: {
          bool: {
            must: [
              { term: { type: docType } },
              { range: { date: { gte: dateStart.getTime(), lt: dateEnd.getTime() }} }
            ]
          }
        },
        aggs: {
          sale_amount: {
            sum: {field: 'amount_paid'}
          },
          product_info: {
            nested: {path: 'products'},
            aggs: {
              sale_count: {sum: {field: 'products.quantity'}},
              sale_amount: {sum: {script: 'doc["products.quantity"].value * doc["products.price"].value'}}
            }
          }
        }
      };
      if (accounts && accounts.length > 0) {
        body.query.bool.must.push({ terms: { store_full: accounts.map( ({site, account}) => `${site}_${account}`)} });
      }
      // if (groupData) {
      //   body.aggs. group_by_site = {
      //     terms: { field: 'site' },
      //     aggs: {
      //       group_by_store: { terms: { field: 'store' } }
      //     }
      //   }
      // }

      const response = await client.search({
        index: config.index,
        body: body
      });

      if (response.errors) {
        return false;
      } else {
        // const data = { totalCount: response.hits.total, sites: [] };
        // for (const site of response.aggregations.group_by_site.buckets) {
        //   const siteInfo = { name: site.key, count: site.doc_count, stores: [] };
        //   for (const store of site.group_by_store.buckets) {
        //     const storeInfo = { name: store.key, count: store.doc_count };
        //     siteInfo.stores.push(storeInfo);
        //   }
        //   data.sites.push(siteInfo);
        // }
        const data = {
          orderCount: response.hits.total,
          saleCount: response.aggregations.product_info.sale_count.value,
          saleAmount: response.aggregations.sale_amount.value,
          saleAmount2: response.aggregations.product_info.sale_amount.value
        }
        return data;
      }

    } catch(e) {
      throw { message: `Order.countByDateAccount: ${e.message||e}` };
    }
  }
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

  product: function({sku, quantity, price}) {
    return {
      sku: sku,
      quantity: quantity,
      price: price
    };
  },

  cost: function({cot_type, amount}) {
    return {
      cot_type: cot_type,
      amount: amount
    };
  },

  order: function({type='aos', order_no, buyer, amount_paid, cost_of_trans, site, store, store_full, products, date}) {
    const dataObj = {};
    dataObj.type = type;
    dataObj.order_no = order_no;
    dataObj.amount_paid = amount_paid;
    dataObj.site = site;
    dataObj.store = store;
    dataObj.store_full = store_full || `${site}_${store}`;
    dataObj.date = date;
    if (buyer) dataObj.buyer = buyer;
    if (cost_of_trans) dataObj.cost_of_trans = cost_of_trans;
    if (products) dataObj.products = products;

    return dataObj;
  }
}

// Module exports
module.exports = {
  DAO: OrderDAO,
  DO: OrderDO
};
