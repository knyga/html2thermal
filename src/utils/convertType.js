module.exports = function(value) {
  if(value === "true") {
    return true;
  }

  if(value === "false") {
    return false;
  }

  const number = Number.parseFloat(value);
  if(!isNaN(number)) {
    return number;
  }

  return value;
};