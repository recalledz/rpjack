const fs = require('fs');

function saveCSV(dataArray, filename) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return;
  }
  const headers = Object.keys(dataArray[0]).join(',');
  const rows = dataArray.map(obj => Object.values(obj).join(','));
  const csv = [headers, ...rows].join('\n');
  fs.writeFileSync(filename, csv);
}

module.exports = { saveCSV };
