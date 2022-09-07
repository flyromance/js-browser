(function() {
  var F = {};
  var modules = {};
  console.log(modules);
  F.define = function(str, fn) {
    var parts = str.split('.');

    if (parts[0] === 'F') {
      parts.shift();
    }

    var len = parts.length,
      i = 0,
      old = parent = modules;
    for (len = parts.length, i = 0; i < len; i++) {
      if (typeof parent[parts[i]] === 'undefined') {
        parent[parts[i]] = {};
        old = parent;
			}
			// parent = parent[parts[i]]
    }

    if (typeof fn === 'function') {
      old[parts[--i]] = fn();
    }
  };

  F.use = function(mods, cb) {
  	// F.use(['ss.dd', {}], cb) 、 F.use('xx.ss', cb) 、F.use(cb)
  	if (typeof mods === 'string') {
  		mods = [mods];
  	} else if (typeof mods === 'function') {
  		cb = mods;
  		mods = [];
  	}

  	var i = 0,
  		lens = mods.length,
  		_mods = [],
  		parent = modules,
  		modIDs;

  	for (; i < lens; i++) {
  		if (typeof mods[i] === 'string') {
  			modIDs = mods[i].split('.');
  			for (var j = 0, jlen = modIDs.length; j < jlen; j++) {
  				parent = parent[modIDs[j]];
  			}
  			_mods.push(parent);
  		} else {
  			_mods.push(mods[i])
  		}
  	}

  	if (typeof cb === 'function') {
  		cb.apply(null, _mods)
  	}
  }

  window.F = F;
})()