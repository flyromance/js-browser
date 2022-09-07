let StateEnums = {
  ChangeText: 0,
  ChangeProps: 1,
  Insert: 2,
  Move: 3,
  Remove: 4,
  Replace: 5
};

function flatten(arr) {
  let ret = [];

  arr.forEach(function(item) {
    if (Array.isArray(item)) {
      ret = ret.concat(flatten(item));
    } else {
      ret.push(item);
    }
  });

  return ret;
}

function isString(str) {
  return typeof str === "string";
}
