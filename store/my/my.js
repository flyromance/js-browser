/*
localStorage.getItem(key)
localStorage.setItem(key, value)
localStorage.removeItem(name)
localStorage.length 返回存储中总条数
localStorage.key(1) 传入number索引, 返回key值
localStorage.clear 清除所有

www.btime.com 和 user.btime.com 不共享数据
www.btime.com 、www.btime.com/ss 共享数据
*/

(function(g, factory) {
    g.LocalCache = factory(g)
})(this, function(g) {
    var _cache = {};

    function mixin() {
        var isDeep = false;
        var args = [].slice.apply(arguments);
        var target, sources;
        if (typeof args[0] === 'boolean') {
            isDeep = args[0];
            target = args[1];
            sources = args.slice(2);
        } else {
            target = args[0];
            sources = args.slice(1);
        }

        var lens = sources.length;
        var source, i, key, value;
        target = typeof target === 'object' ? target : {};

        for (i = 0; i < lens; i++) {
            source = sources[i];
            for (key in source) {
                if (!source.hasOwnProperty(key)) continue;
                value = source[key];
                if (typeof value === 'object' && isDeep) {
                    if (typeof target[key] === 'object') {
                        target[key] = mixin(isDeep, target[key], value);
                    } else {
                        target[key] = mixin(isDeep, {}, value);
                    }
                } else if (typeof value !== 'undefined') {
                    target[key] = value;
                }
            }
        }

        return target;
    }

    // 支持命名空间格式，因为userData有命名空间形式
    _cache.localStorage = {
        test: function() {
            try {
                return window.localStorage ? true : false;
            } catch (e) {
                return false;
            }
        },
        methods: {
            init: function(e) {},
            set: function(prefix, name, value) {
                try {
                    localStorage.setItem(prefix + '_' + name, value);
                } catch (e) {
                    throw e
                }
            },
            get: function(prefix, name) {
                return localStorage.getItem(prefix + '_' + name)
            },
            remove: function(prefix, name) {
                localStorage.removeItem(prefix + '_' + name)
            },
            clear: function(prefix) {
                if (!prefix) {
                    localStorage.clear(); // 全部清除
                } else {
                    var lens = localStorage.length - 1,
                        name = '';
                    for (; name = localStorage.key(lens--);) {
                        name && name.indexOf(prefix) === 0 && localStorage.removeItem(name);
                    }
                }
            }
        }
    };

    _cache.userData = {
        test: function() {
            try {
                return window.ActiveXObject && document.documentElement.addBehavior ? !0 : !1;
            } catch (e) {
                return !1;
            }
        },
        methods: {
            _owners: {},
            init: function(prefix) {
                if (!this._owners[prefix]) {
                    if (document.getElementById(prefix)) {
                        this._owners[prefix] = document.getElementById(prefix);
                    } else {
                        var _script = document.createElement("script"),
                            _parent = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
                        _script.id = prefix;
                        _script.style.display = "none";
                        _script.addBehavior("#default#userdata");
                        _parent.insertBefore(_script, _parent.firstChild);
                        this._owners[prefix] = _script;
                    }
                    try {
                        this._owners[prefix].load(prefix)
                    } catch (r) {}
                    var that = this;
                    window.attachEvent("onunload", function() {
                        that._owners[e] = null;
                    })
                }
            },
            set: function(prefix, name, value) {
                if (this._owners[prefix]) {
                    try {
                        this._owners[prefix].setAttribute(name, value);
                        this._owners[prefix].save(prefix);
                    } catch (e) {
                        throw e
                    }
                }
            },
            get: function(prefix, name) {
                return this._owners[prefix] ? (this._owners[prefix].load(prefix), this._owners[prefix].getAttribute(name) || "") : "";
            },
            remove: function(prefix, name) {
                this._owners[prefix] && (this._owners[prefix].removeAttribute(name));
                this._owners[prefix].save(prefix);
            },
            clear: function(prefix) {
                if (this._owners[prefix]) {
                    var attrs = this._owners[prefix].XMLDocument.documentElement.attributes;
                    this._owners[prefix].load(prefix);
                    for (var n = 0, r; r = attrs[n]; n++) {
                        this._owners[prefix].removeAttribute(r.name);
                    }
                    this._owners[prefix].save(prefix)
                }
            }
        }
    };

    var _storage = function() {
        return _cache.localStorage.test() ?
            _cache.localStorage.methods :
            _cache.userData.test() ?
            _cache.userData.methods : {
                init: function() {},
                get: function() {},
                set: function() {},
                remove: function() {},
                clear: function() {}
            }
    }();

    var config = {
        prefix: ''
    };

    function LocalCache(prefix) {
        this.prefix = prefix || config.prefix;
        this.storeSvc = _storage;
        this.storeSvc && this.storeSvc.init(this.prefix);
    }

    LocalCache.setConf = function(conf, value) {
        if (typeof conf == 'object') {
            mixin(true, config, conf)
        } else if (typeof conf === 'string') {
            config[conf] = value;
        }
    }

    LocalCache.prototype = {
        constructor: LocalCache,
        set: function(name, value) {
            try {
                return this.storeSvc.set(this.prefix, name, JSON.stringify(value));
            } catch (e) {
                return false;
            }
        },
        get: function(name) {
            try {
                return JSON.prase(this.storeSvc.get(this.prefix, name))
            } catch (e) {}
        },
        remove: function(name) {
            try {
                this.storeSvc.remove(this.prefix, name)
            } catch (e) {}
        },
        clear: function() {
            try {
                this.storeSvc.clear(this.prefix)
            } catch (e) {}
        }
    };

    return LocalCache
});