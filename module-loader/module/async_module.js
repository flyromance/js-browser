(function() {
  var moduleCache = {},
    F = {},
    config = {
      baseUrl: './'
    };

  function setBaseUrl() {
  	var baseUrl = config.baseUrl;
  }


  function mixin(target, source) {
    for (var key in source) {
      target[key] = source[key];
    }
  }

  F.config = function(conf, value) {
    if (typeof conf === 'string') {
      config[conf] = value;
    } else if (typeof conf === 'object') {
      mixin(config, conf);
    }
  }

  function getCurrentUrl() {
    var head = document.getElementsByTagName('head')[0],
      scripts = head.getElementsByTagName('script'),
      lens = scripts.length,
      script = scripts[lens - 1];
    return script.src;
  }

  function getModId(id) {
    var ret = '';

    var baseUrl = config.baseUrl;
    baseUrl = baseUrl.replace(/\/$/, '') + '/'; // /my/lib/ or ./

    if (baseUrl == './') {
    	config.baseUrl = baseUrl = location.pathname.replace(/\/[^\/]*$/, '') + '/';
    }

    id = id.replace(/\.js$/, '');

    // 绝对路径
    if (id.charAt(0) == '/' || /^(https?:\/\/|\/)/.test(id)) {
      ret = id;
    } else if (id.indexOf('./') === 0) {
      ret = baseUrl + id.replace(/^\./, '');
    } else if (id.indexOf('../') === 0) { // ../../a.js  
    	baseUrl = baseUrl.replace(/\/$/, ''); // /my/lib or .
      ret = id.replace(/\.\.\//g, function() {
        var index = baseUrl.lastIndexOf('/');
        baseUrl = baseUrl.slice(0, index);
        return ''
      });
      ret = baseUrl + id;
    } else {
    	ret = baseUrl + id;
    }

    return ret
  }

  function formatUrl(url) {
    return url.replace(/\.js$/g, '') + '.js'
  }

  function loadScript(url) {
    var script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  // 三种情况
  function loadModule(id, callback) {
    var modId = getModId(id);
    var mod = moduleCache[modId];
    if (mod) {
      if (mod.status === 'loaded') {
        setTimeout(callback(mod.exports), 0);
      } else if (mod.status === 'loading') {
        mod.onload.push(callback)
      }
    } else {
      mod = {
        name: modId,
        status: 'loading',
        exports: null,
        onload: [callback],
      };
      moduleCache[modId] = mod;
      loadScript(formatUrl(modId));
    }
  }

  // 设置模块完成
  function setModule(modName, deps, factory) {
    var modId = getModId(modName),
    	mod = moduleCache[modId],
      fn;
    if (mod) {
      mod.status = 'loaded';
      mod.exports = factory.call(mod, deps);
      while (fn = mod.onload.shift()) {
        fn(mod.exports)
      }
    } else { // F.use() 这种模式
      factory && factory.apply(null, deps)
    }
  }

  F.define = function(modName, deps, factory) {
    if (modName instanceof Array) { // F.define([], function() {})
      factory = deps;
      deps = modName;
      modName = null;
    } else if (typeof modName === 'function') { // F.define(function() {})
      factory = modName;
      deps = [];
      modName = null;
    }

    // F.define('xxx', function() {})
    if (typeof deps === 'function') {
      factory = deps;
      desp = [];
    }

    if (!modName) {
      modName = getCurrentUrl();
      modName = getModId(modName);
    }

    var lens = deps.length,
      depsCount = lens,
      params = [];

    if (lens) {
      for (var i = 0; i < lens; i++) {
        (function(i) {
          loadModule(deps[i], function(modExports) {
            depsCount--;
            params[i] = modExports;
            if (depsCount === 0) {
              setModule(modName, params, factory);
            }
          });
        })(i);
      }
    } else {
      setModule(modName, [], factory);
    }
  }

  // 主入口模块
  F.use = function(deps, factory) {
    F.define(+new Date() + '_mod', deps, factory);
  }

  window.F = F;
})(window);