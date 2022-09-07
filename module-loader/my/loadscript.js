function loadScript(url, cb) {
  var script = document.createElement("script");

  function excuteCb() {
    if (typeof cb === "function") {
      cb();
    }
  }

  if ("onreadystatechange" in script) {
    script.onreadystatechange = function () {
      if (script.readyState === "complete" || script.readyState === "loaded") {
        script.onreadystatechange = null;
        excuteCb();
      }
    };
  } else if ("onload" in script) {
    script.onload = function () {
      script.onload = null;
      excuteCb();
    };
  } else {
    throw new Error("there is no method to load script");
  }

  // script.defer = false;
  // script.async = false;
  script.src =
    url.indexOf("?") < 0
      ? url + "?_=" + new Date().getTime()
      : url + "&_=" + new Date().getTime();

  // 插入到dom开始下载
  document.getElementsByTagName("head")[0].appendChild(script);
  // document.querySelector('body').appendChild(script);
}

function load(arr) {
  arr = arr || [];
  for (var i = 0; i < arr.length; i++) {
    loadScript(arr[i]);
  }
}

function loadQueue(arr, cb) {
  var _arr = arr.slice();

  function loadNext() {
    var item = _arr.shift();
    if (item) {
      loadScript(item, loadNext);
    } else {
      if (typeof cb === "function") {
        cb();
      }
    }
  }
  loadNext();
}

function loadParallel(arr, cb) {
  var lens = arr.length;
  var i = 0;
  function done() {
    i++;
    if (i >= lens) {
      if (typeof cb === "function") {
        cb();
      }
    }
  }
  arr.slice().forEach((item) => {
    loadScript(item, done);
  });
}
