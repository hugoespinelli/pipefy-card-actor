

function convert_date(date) {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  
  return `${year}-${month + 1}-${day}`;
}

module.exports = { convert_date }