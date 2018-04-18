function clearTime(date) {
  if (!date) date = new Date();
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function tomorrow(date) {
  if (!date) date = new Date();
  const tmr = new Date(date.getTime() + 24 * 3600 * 1000);
  return clearTime(tmr);
}

function parseDate(str) {
  const year = parseInt(str.substr(4, 4)),
    month = parseInt(str.substr(0, 2)) - 1,
    date = parseInt(str.substr(2, 2));
  return new Date(year, month, date);
}

module.exports = {
  clearTime: clearTime,
  tomorrow: tomorrow,
  parseDate: parseDate
};
