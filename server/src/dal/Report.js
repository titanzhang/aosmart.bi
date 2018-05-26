const ElasticSearch = require('elasticsearch');

// Report DAO
const config = {
  name: 'report',
  index: 'report',
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

const ReportDAO = {
  bulkUpdate: async function({list}) {
    if (list.length === 0) {
        return { statue: true, fail: [], success: [] };
    }

    const client = getClient();
    const body = [];
    for (const data of list) {
      const action = {
        update: { _index: config.index, _type: config.type, _id: `${data.order.order_no}_${data.product.sku}` }
      };
      const doc = {
        doc: data,
        doc_as_upsert: true
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

};

// Report DO
const ReportDO = {
  report: function({type='aos', order, product}) {
      const dataObj = { type: type };
      if (order) dataObj.order = Object.assign({}, order);
      if (product) dataObj.product = Object.assign({}, product);
      return dataObj;
  },

  product: function({sku, quantity, price, cog}) {
    const dataObj = { sku: sku };
    if (quantity !== undefined) dataObj.quantity = quantity;
    if (price !== undefined) dataObj.price = price;
    if (cog !== undefined) dataObj.cog = cog;
    return dataObj;
  },

  order: function({order_no, site, store, amount_paid, cot_shipping, date}) {
    const dataObj = {
      order_no: order_no
    };
    if (site !== undefined) dataObj.site = site;
    if (store !== undefined) dataObj.store = store;
    if (amount_paid !== undefined) dataObj.amount_paid = amount_paid;
    if (cot_shipping !== undefined) dataObj.cot_shipping = cot_shipping;
    if (date !== undefined) dataObj.date = (new Date(date)).getTime();

    return dataObj;
  }
}

// Module exports
module.exports = {
  DAO: ReportDAO,
  DO: ReportDO
};
