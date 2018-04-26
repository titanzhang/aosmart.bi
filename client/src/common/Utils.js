const Utils = {
  formatDate: function(date, sep='/') {
    const year = date.getUTCFullYear(),
      month = date.getUTCMonth() + 1,
      day = date.getUTCDate();
    return `${month<10?'0':''}${month}${sep}${day<10?'0':''}${day}${sep}${year}`;
  },

  parseDate: function(str, sep='/') {
    const [month, date, year] = str.split(sep).map((v)=>parseInt(v));
    if (isNaN(month) || isNaN(date) || isNaN(year)) return;
    if ((month < 1|| month > 12) || (date < 1 || date > 31) || (year < 1970)) return;
    return new Date(year, month - 1, date);
  }

};

export default Utils;
