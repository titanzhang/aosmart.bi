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

  order: function({type='aos', order_no, buyer, amount_paid, cost_of_trans, site, store, products, date}) {
    const dataObj = {};
    dataObj.type = type;
    dataObj.order_no = order_no;
    dataObj.amount_paid = amount_paid;
    dataObj.site = site;
    dataObj.store = store;
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
