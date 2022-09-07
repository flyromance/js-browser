function diff(oldVnode, newVnode) {
  let patches = {};
  diffNode(oldVnode, newVnode, 0, patches);
  return patches;
}

function diffNode(oldVnode, newVnode, index, patches) {
  let patch = [];

  // 1、没有新的节点，什么都不用做
  // 2、新的节点与旧的节点 tagname 和 key，只要有一个不同就替换
  // 3、遍历子树
  if (!newVnode) {
  } else if (oldVnode.tag === newVnode.tag) {
    // 对比属性
    let propPatches = diffProps(oldVnode.props, newVnode.props);
    if (propPatches.length) patch.push({ type: StateEnums.ChangeProps, props: propPatches });

    // 对比子节点
    diffChildren(oldVnode.children, newVnode.children, index, patches);
  } else {
    patch.push({ type: StateEnums.Replace, node: newVnode });
  }

  if (patch.length) {
    if (patches[index]) {
      patches[index] = patches[index].concat(patch);
    } else {
      patches[index] = patch;
    }
  }
}

function diffProps(oldProps = {}, newProps = {}) {
  let ret = [];
  let oldPropNames = Object.keys(oldProps || {});
  let newPropNames = Object.keys(newProps || {});

  oldPropNames.forEach(function(propName) {
    if (newPropNames.indexOf(propName) === -1) {
      // 删除
      ret.push({ type: "delete", propName });
    } else {
      ret.push({ type: "change", propName, propValue: newProps[propName] });
    }
  });

  newPropNames.forEach(function(propName) {
    if (oldPropNames.indexOf(propName) === -1) {
      // 新增
      ret.push({ type: "add", propName, propValue: newProps[propName] });
    }
  });

  return ret;
}

function diffChildren(oldChildren, newChildren, index, patches) {
  let { changes, list } = diffList(oldChildren, newChildren, index, patches);

  if (changes.length) {
    if (patches[index]) {
      patches[index] = patches[index].concat(changes);
    } else {
      patches[index] = changes;
    }
  }

  // 记录上一个遍历过的节点
  let last = null;
  oldChildren &&
    oldChildren.forEach((item, i) => {
      let child = item && item.children;
      if (child) {
        index = last && last.children ? index + last.children.length + 1 : index + 1;
        let keyIndex = list.indexOf(item.key);
        let node = newChildren[keyIndex];
        // 只遍历新旧中都存在的节点，其他新增或者删除的没必要遍历
        if (node) {
          diffNode(item, node, index, patches);
        }
      } else index += 1;
      last = item;
    });
}

function diffList(oldList, newList, index, patches) {
  // 为了遍历方便，先取出两个 list 的所有 keys
  let oldKeys = getKeys(oldList);
  let newKeys = getKeys(newList);
  let changes = [];

  // 用于保存变更后的节点数据
  // 使用该数组保存有以下好处
  // 1.可以正确获得被删除节点索引
  // 2.交换节点位置只需要操作一遍 DOM
  // 3.用于 `diffChildren` 函数中的判断，只需要遍历
  // 两个树中都存在的节点，而对于新增或者删除的节点来说，完全没必要再去判断一遍
  let list = [];
  oldList &&
    oldList.forEach((item, i) => {
      let key;
      if (isString(item)) {
        key = item;
      } else {
        key = item.key;
      }

      // 寻找新的 children 中是否含有当前节点
      // 没有的话需要删除
      let index = newKeys.indexOf(key); 
      if (index === -1) {
        list.push(null);
      } else list.push(key);
    });
  // 遍历变更后的数组
  let length = list.length;
  // 因为删除数组元素是会更改索引的
  // 所有从后往前删可以保证索引不变
  for (let i = length - 1; i >= 0; i--) {
    // 判断当前元素是否为空，为空表示需要删除
    if (!list[i]) {
      list.splice(i, 1);
      changes.push({
        type: StateEnums.Remove,
        index: i
      });
    }
  }
  // 遍历新的 list，判断是否有节点新增或移动
  // 同时也对 `list` 做节点新增和移动节点的操作
  newList &&
    newList.forEach((item, i) => {
      let key = item.key;
      if (isString(item)) {
        key = item;
      }
      // 寻找旧的 children 中是否含有当前节点
      let index = list.indexOf(key);
      // 没找到代表新节点，需要插入
      if (index === -1 || key == null) {
        changes.push({
          type: StateEnums.Insert,
          node: item,
          index: i
        });
        list.splice(i, 0, key);
      } else {
        // 找到了，需要判断是否需要移动
        console.log(key);
        if (index !== i) {
          changes.push({
            type: StateEnums.Move,
            from: index,
            to: i
          });
          move(list, index, i);
        }
      }
    });
  return { changes, list };
}

function getKeys(list) {
  let keys = [];
  list &&
    list.forEach(item => {
      let key;
      if (isString(item)) {
        key = item; // todo key = [item] ?
      } else if (item instanceof Node) {
        key = item.key;
      }
      keys.push(key);
    });
  return keys;
}

function move(arr, old_index, new_index) {
  while (old_index < 0) {
    old_index += arr.length;
  }
  while (new_index < 0) {
    new_index += arr.length;
  }
  if (new_index >= arr.length) {
    let k = new_index - arr.length;
    while (k-- + 1) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
}