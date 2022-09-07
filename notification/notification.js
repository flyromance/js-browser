var Noticor = (function () {
    function Factory(conf) {
        this.conf = conf;
        if (typeof window.Notification !== 'function') return this;
        this.init();
    }

    Factory.prototype = {
        constructor: Factory,
        init: function () {
            this.events = {};
            this.permission = false; // 默认是不允许的
            this._getAccess(); // 获取用户应答
            if (this.permission === true) {
                this._listen();
            }
        },
        _getAccess: function () {
            var that = this;

            // 询问用户能否启用提示功能
            if (Notification.permission === 'granted') {
                $.isFunction(that.conf.onPass) && that.conf.onPass.call(this);
            } else if (Notification.permission == 'default') {
                Notification.requestPermission(function (permission) {
                    if (permission === 'granted') {
                        $.isFunction(that.conf.onPass) && that.conf.onPass.call(this);
                    } else {
                        // denied or default
                    }
                });
            } else {
                // denied
            }

            return this;
        },
        _listen: function () {
            var that = this;
            if (!that.permission) return this;

            if (typeof that.conf.onshow === 'function') {
                that.on('show', that.conf.onshow);
            }

            if (typeof that.conf.onclick === 'function') {
                that.on('click', that.conf.onclick);
            }

            return this;
        },
        on: function (type, callback) {
            if (typeof type !== 'string') {
                console && console.error('type 必须为字符串');
                return;
            }

            var list = this.events[type] || [];
            list.push(callback);
            this.events[type] = list;

            return this;
        },
        trigger: function (type, obj) {
            if (typeof type !== 'string') {
                return this;
            }

            var list = this.events[type] || [];
            var i = 0;
            while (i++ < list.length) {
                typeof list[i] === 'function' && list[i].apply(this, [obj]);
            }

            return this;
        },
        createNotice: function (data) {
            var that = this;

            if (Notification.permission === 'granted' || !$.isEmptyObject(data)) {
                var notice = new Notification(data.title, {
                    body: data.summary,
                    icon: data.covers || "http://p2.qhimg.com/dmfd/180_100_/t01717c0fc15d425859.jpg?size=1024x768"
                });

                notice.onshow = function () {
                    that.trigger('show');
                };

                // 除此之外还有: onclose, onerror事件
                notice.onclick = function () {
                    window.open(data.url);
                    that.trigger('click');
                    notice.close(); // 执行完关闭
                };

                return notice;
            }
        },
    }

    return Factory;
})();


/*
var noticor = new Noticor({
    onPass: function () { // 用户同意之后，执行的回调
        initWs(CONFIG, this); // this就是noticor
    },
    onshow: function () { // 对于实例化的notification，绑定的回调
        // 具体业务：打点
    },
    onclick: function () { // 对于实例化的notification，绑定的回调
        // 具体业务：打点
    }
});
*/