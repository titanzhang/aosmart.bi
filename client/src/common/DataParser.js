import CSV from 'csvtojson';

const CountryCode = {
  default: 'Other',
  us: 'US'
};
const CountryMapping = {
  'United States': CountryCode.us
};

const orderFields = {
  orderNo: 'orderNo',
  totalPrice: 'totalPrice',
  product: 'product',
  sku: 'sku',
  price: 'price',
  quantity: 'quantity',
  buyer: 'buyer',
  buyerName: 'buyerName',
  buyerStreet1: 'buyerStreet1',
  buyerStreet2: 'buyerStreet2',
  buyerCity: 'buyerCity',
  buyerState: 'buyerState',
  buyerPostalCode: 'buyerPostalCode',
  buyerCountry: 'buyerCountry',
  paidDate: 'paidDate',
  orderID: 'orderID',
  itemID: 'itemID',
  shipHandleFee: 'shFee'
};

const Parser = {
  price: (v) => {
    return parseFloat(v.replace(/[$]/gi, ''));
  },
  quantity: parseInt,
  date: (v) => {
    return (new Date(v)).getTime();
  },
  country: (v) => {
    return CountryMapping[v] || v;
  }
};

const dataMapping = [
  { name: orderFields.orderNo, index: 0 },
  { name: orderFields.totalPrice, index: 20, parser: Parser.price }, // total amount of the order
  { name: orderFields.sku, index: 31 }, // Per item
  { name: orderFields.price, index: 16, parser: Parser.price }, // Per item
  { name: orderFields.shipHandleFee, index: 17, parser: Parser.price},
  { name: orderFields.quantity, index: 15, parser: Parser.quantity }, // Per item
  { name: orderFields.buyerName, index: 2 },
  { name: orderFields.buyerStreet1, index: 5 },
  { name: orderFields.buyerStreet2, index: 6 },
  { name: orderFields.buyerCity, index: 7 },
  { name: orderFields.buyerState, index: 8} ,
  { name: orderFields.buyerPostalCode, index: 9 },
  { name: orderFields.buyerCountry, index: 10 , parser: Parser.country },
  { name: orderFields.paidDate, index: 25, parser: Parser.date },
  { name: orderFields.orderID, index: 11 } // eBay orderID, will be set if the order consists of multiple items
];

const DataParser = function() {
  function copyFieldInfos(source, target, fields) {
    for (const field of fields) {
      target[field] = source[field];
    }
  }

  function parseBuyerInfo(row, info) {
    const buyInfo = {};
    copyFieldInfos(row, buyInfo, [
      orderFields.buyerName,
      orderFields.buyerStreet1,
      orderFields.buyerStreet2,
      orderFields.buyerCity,
      orderFields.buyerState,
      orderFields.buyerPostalCode,
      orderFields.buyerCountry
    ]);

    if (info) {
      info[orderFields.buyer] = buyInfo;
    }
    return buyInfo;
  }

  function parseItemInfo(row, info) {
    const itemInfo = {};
    copyFieldInfos(row, itemInfo, [
      orderFields.sku,
      orderFields.price,
      orderFields.quantity
    ]);

    if (info) {
      if (!info[orderFields.product]) info[orderFields.product] = [];
      info[orderFields.product].push(itemInfo);
    }
    return itemInfo;
  }

  function parseOrderInfo(row, info) {
    if (!info) info = {};
    copyFieldInfos(row, info, [
      orderFields.totalPrice,
      orderFields.paidDate
    ]);
    info[orderFields.totalPrice] += row[orderFields.shipHandleFee];
    return info;
  }

  function addRow(result, row) {
    const orderNo = row[orderFields.orderNo];
    const orderInfo = result[orderNo] || {};

    orderInfo[orderFields.orderNo] = orderNo;
    if (!orderInfo[orderFields.product]) orderInfo[orderFields.product] = [];

    if (row[orderFields.orderID].length > 0) {
      // multi-item order - parent order
      parseOrderInfo(row, orderInfo);
      parseBuyerInfo(row, orderInfo);
    } else {
      if (!isNaN(row[orderFields.totalPrice])) {
        // single item order
        parseOrderInfo(row, orderInfo);
        parseBuyerInfo(row, orderInfo);
        parseItemInfo(row, orderInfo);
      } else {
        // multi-item order - sub order
        parseItemInfo(row, orderInfo);
      }
    }

    result[orderNo] = orderInfo;
  }

  return {
    parse: function({text, noHeader}) {
      return new Promise( (resolve, reject) => {
        try {
          const result = {}; // {orderNo: data}
          const csv = CSV({noheader: noHeader});
          csv.fromString(text)
          .on('csv', (csvrow) => {
            const row = {};
            for (const field of dataMapping) {
              const data = csvrow[field.index].trim();
              row[field.name] = field.parser? field.parser(data): data;
            }
            addRow(result, row);
          })
          .on('done', (error) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    }
  };
}

export default DataParser;
