(function() {
    var _cache = {};

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
                        this._owners[e].removeAttribute(r.name);
                    }
                    this._owners[e].save(e)
                }
            }
        }
    };
    var _storage = function() {
        return _cache.localStorage.test() ? _cache.localStorage.methods : _cache.userData.test() ? _cache.userData.methods : {
            init: function() {},
            get: function() {},
            set: function() {},
            remove: function() {},
            clear: function() {}
        }
    }();

    // 真正的构造函数
    var LocalCache = function(prefix) {
        this.prefix = prefix || 'btime';
        this.storeSvc = _storage;
        this.storeSvc && this.storeSvc.init(prefix || 'btime');
    };
    LocalCache.serialize = function(e) {
        return JSON.stringify(e)
    };
    LocalCache.unserialize = function(e) {
        return JSON.parse(e)
    };
    LocalCache.prototype = {
        set: function(name, value) {
            try {
                return this.storeSvc.set(this.prefix, name, LocalCache.serialize(value));
            } catch (e) {
                return false;
            }
        },
        get: function(name) {
            try {
                return LocalCache.unserialize(this.storeSvc.get(this.prefix, name))
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
    window.LocalCache = LocalCache;
})();