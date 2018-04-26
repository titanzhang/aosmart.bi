import CSV from 'csvtojson';
import Utils from './Utils';

const Fields = {
  sku: 'sku',
  fob: 'fob'
};

const DataParser = {
  amount: (v) => {
    const result = parseFloat(v.replace(/[$]/gi, ''));
    return isNaN(result)? 0: result;
  }
};

const dataMapping = [
  { name: Fields.sku, index: 0 },
  { name: Fields.fob, index: 1, parser: DataParser.amount }
];

const Parser = function() {
  return {
    parse: function({text, noHeader, effectiveDate}) {
      return new Promise( (resolve, reject) => {
        try {
          const result = [];
          const csv = CSV({noheader: noHeader});
          csv.fromString(text)
          .on('csv', (csvrow) => {
            const row = { effectiveDate: effectiveDate.getTime() };
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
