import CSV from 'csvtojson';

const Fields = {
  orderNo: 'orderNo',
  cost: 'cost'
};

const DataParser = {
  amount: (v) => {
    const result = parseFloat(v.replace(/[$]/gi, ''));
    return isNaN(result)? 0: result;
  }
};

const dataMapping = [
  { name: Fields.orderNo, index: 2 },
  { name: Fields.cost, index: 9, parser: DataParser.amount }
];

const Parser = function() {
  return {
    parse: function({text, noHeader}) {
      return new Promise( (resolve, reject) => {
        try {
          const result = [];
          const csv = CSV({noheader: noHeader});
          csv.fromString(text)
          .on('csv', (csvrow) => {
            const row = {};
            for (const field of dataMapping) {
              const data = csvrow[field.index].trim();
              if (data.length === 0) return;
              row[field.name] = field.parser? field.parser(data): data;
            }
            result.push(row);
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

export default Parser;
