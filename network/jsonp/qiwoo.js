var jsonp = (function () {
    var reqMap = {},
        seq = 0,
        threshold = 600000; //默认10分钟更新一次缓存，因为存在CDN回原的问题，需要这么设置

    var monitorData = {};

    function mix() {

    }

    var jsonpRet = function (url, data, callback, opt) {
        if (typeof data !== 'object') {
            opt = callback, callback = data, data = null;
        }
        opt = qboot.mix(opt || {}, {jsonp: '_callback', timeout: 30000, threshold: threshold});

        if (data) {
            url += (/\?/.test(url) ? "&" : "?") + qboot.encodeURIJson(data);
        }

        //为url生成callback名
        //为了不让CDN失效，唯一的url对应唯一的名字
        var jsonp;
        jsonp = reqMap[url] = reqMap[url] || opt['cb'] || ('__jsonp' + (seq++) + '__');

        monitorData[jsonp] = {
            url: url,
            startTime: +new Date
        };

        url += (/\?/.test(url) ? "&" : "?") + opt.jsonp + '=' + encodeURIComponent(jsonp)
            + '&t=' + Math.floor((new Date()).getTime() / opt.threshold);


        if (!window[jsonp]) {
            window[jsonp] = (function () {

                var list = [];  //初始化一个队列

                var ret = function (data, err) {
                    monitorData[jsonp].endTime = +new Date;
                    jsonpRet.fire('resourceLoaded', {data: monitorData[jsonp]});
                    var fn = list.shift();  //从队列里取出要执行的函数
                    if (fn) {
                        fn(data, err);
                    }
                }

                //将函数添加到队列的接口
                ret.add = function (fn) {
                    list.push(fn);
                }

                return ret;
            })();
        }

        var t = setTimeout(function () {
            window[jsonp](null, {status: 'error', reason: 'timeout'});    //如果超时，返回data为null，reason为timeout
        }, opt.timeout);

        //将函数存放到调用队列里
        //这个是为了支持同时用相同的url参数调用多次接口
        //这里不做返回次序的验证，因此可能服务器返回顺序会交错，但是一般情况下应该没影响
        window[jsonp].add(function (data, err) {
            clearTimeout(t);
            if (callback) {
                err = err || {status: 'ok'};
                callback(data, err);
            }
        });

        qload({path: url, type: 'js', force: true});

        qboot.createEvents(jsonpRet);
    };

    jsonpRet.getMonitorData = function () {
        return monitorData;
    };

    return jsonpRet;
})()