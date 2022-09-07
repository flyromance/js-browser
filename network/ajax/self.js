/*
 * 浏览器输入：get
 * form： get、post，同域
 * ajax：get、post，同域
 * jsonp：get，
 * iframe：
 * flash：
 */

// 序列化表单，把表单数据转化为 name=value&name1=value1 的形式
// input text
// input file
// input button
// input radio
// input checkbox
// select 
// textarea 

function serialize(form) {
    if (form.elements) {
        var elems = form.elements;
        var len = elems.length;
        var elem = null;
        var parts = [];
        var i, j, optLen, option, optValue;
        for (i = 0; i < len; i++) {
            elem = elems[i];
            if (!elem.name.length) continue;
            switch (elem.type) {
                case 'select-one':
                case 'select-multiple':
                    for (j = 0, optLen = elem.options.length; j < optLen; j++) {
                        option = elem.options[j];
                        if (option.selected) {
                            optValue = option.value ? option.value : option.text;
                            parts.push(encodeURIComponent(elem.name) + '=' + encodeURIComponent(optValue));
                        }
                    }
                    break;

                case 'button':
                case 'submit':
                case 'file':
                case 'undefined':
                case 'reset':
                    break;

                case 'radio':
                case 'checkbox':
                    if (!elem.checked) {
                        break;
                    }

                // text textarea也可以用value获取   
                default:
                    parts.push(encodeURIComponent(elem.name) + '=' + encodeURIComponent(elem.value));
            }
        }
        return parts.join("&");
    } else {
        return null;
    }
}

// request请求 and response响应
function createXHR() {
    if (XMLHttpRequest) {
        /// for other
        return new XMLHttpRequest();
    } else if (ActiveXObject) {
        // for ie5 ie6
        return new ActiveXObject("Microsoft.XMLHTTP");
    } else {
        throw new Error("no xhr object available");
    }
}

// 添加查询字符串 location.search
function addURLParam(url, name, value) {
    url += (url.indexOf("?") == -1 ? "?" : "&");
    console.log(url);
    url += encodeURIComponent(name) + "=" + encodeURIComponent(value);
    console.log(url);
    return url;
}

function sendXhr(options) {
    options = options || {};

    var xhr = createXHR(); // readyState == 0， 刚创建完xhr对象，还没发出请求

    options.onerror = options.onerror || function () {};
    options.onsuccess = options.onsuccess || function () {};

    var outDate = options.timeout || 1; // 1 分钟

    var timer = setTimeout(function () {
        xhr.abort('time out');
    }, outDate * 60 * 1000);

    // 
    xhr.onerror = function (error) {
        options.onerror({
            msg: 'error'
        }, xhr);
    };

    // 同域www.baidu.com、同端口:8080、同协议http://
    // readyState == 1， 已发出请求，还没调用send()
    xhr.open(options.method || options.type || 'GET', options.url, options.async === false ? false : true); 

    // for ie
    xhr.onload = function () {

    }

    // 监听xhr的状态改变事件,全是小写
    xhr.onreadystatechange = function() {

        // raadyState == 3 已经接受到部分响应数据
        // readyState == 4 数据接受完成，并且能在客户端使用
        // xhr.abort() 调用此方法后，停止触发事件
        if (xhr.readyState == 4) {
            if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                // getResponseHeader()获取响应的头信息
                var responseHeader = xhr.getResponseHeader('content-type');
                var responseHeaders = xhr.getAllResponseHeaders();
                var responseValue = xhr.responseText;

                options.onsuccess(responseValue, {
                    msg: 'success'
                }, xhr);
            } else {
                options.onerror({
                    msg: 'error'
                }, xhr);
            }

            clearTimeout(timer);
            timer = null;
        }
    }

    // 设置响应头
    // 此方法必须在open()方法调用之后，send()调用之前使用
    // Cookie：当前页面设置的Cookie, Referer：请求页面的URI, Host:请求页面所在的域
    // 浏览器一般禁止以此方法设置cookie
    // xhr.setRequestHeader('myHeader', 'myValue');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    //  readyState == 2， 已调用send()，但没有接受到响应
    xhr.send((options.method || options.type || 'get').toLowerCase() === 'get' ? null : options.data || null); 

}

