function unique(arr) {
  const uniq = Array.from(new Set(arr));
  this.length = uniq.length;
  return uniq;
}

module.exports = { unique };
