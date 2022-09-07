function loadScript(url, cb) {
  var script = document.createElement('script');

  if (script.readyState) {
    if (script.readyState === 'complete' || script.readyState === 'interactive') {
      cb && cb.call();
    }
  } else {
    script.onload = function () {
      script.onload = null;
      cb && cb.call()
    }
  }
  script.type = 'text/javascript';
  script.src = url;

  document.head.appendChild(script)
}


function type(obj) {
  // [object Array]
  return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() === 'array'
}


var lazyload = (function () {
  var maps = {};

  return function (src, cb) {
    var arr = []
    if (typeof src === 'string') {
      arr.push(src)
    } else if (Array.isArray(src)) {
      arr = arr.concat(src);
    }
    var lens = arr.length;
    function loaded() {
      if (--lens === 0) {
        cb();
      }
    }

    arr.forEach(function (item, index) {
      var map = maps[item] || {};

      if (map.status === 'loaded') {
        loaded();
      } else if (map.status === 'loading') {

      } else {
        map.status = 'loading';
        loadScript(item, function () {
          map.status = 'loaded';
          loaded();
        })
      }

      maps[item] = map;
    })
  }
})();


