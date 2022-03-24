function unique(arr) {
  const uniq = Array.from(new Set(arr));
  this.length = uniq.length;
  return uniq;
}

function tabulate(header, data) {
  console.log(header);
  console.table(data);
}

module.exports = { unique, tabulate, log };
