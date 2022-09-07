var WS = (function () {
  // ArrayBuffer转为字符串
  function decodeUtf8(arrayBuffer) {
    var result = "";
    var i = 0;
    var c = 0;
    var c3 = 0;
    var c2 = 0;

    var data = new Uint8Array(arrayBuffer);

    // If we have a BOM skip it
    if (
      data.length >= 3 &&
      data[0] === 0xef &&
      data[1] === 0xbb &&
      data[2] === 0xbf
    ) {
      i = 3;
    }

    while (i < data.length) {
      c = data[i];

      if (c < 128) {
        result += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        if (i + 1 >= data.length) {
          throw "UTF-8 Decode failed. Two byte character was truncated.";
        }
        c2 = data[i + 1];
        result += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        if (i + 2 >= data.length) {
          throw "UTF-8 Decode failed. Multi byte character was truncated.";
        }
        c2 = data[i + 1];
        c3 = data[i + 2];
        result += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    }
    return result;
  }

  // ArrayBuffer转为字符串
  function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
  }

  // 字符串转为ArrayBuffer对象
  function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

  function Factory(options) {
    this.conf = options;
    this.status = "";
    this.events = {};
    this.reqs = {};
    this.proto = options.proto; // 模式
    this.currentHeader = null;
    this.create();
  }

  function getUniqueId() {
    return Math.ceil($.now() * (Math.random() + 1));
  }

  //
  Factory.prototype = {
    constructor: Factory,
    decodeUtf8: decodeUtf8,
    create: function () {
      // 保证create方法只能执行一次
      if (this.ws instanceof WebSocket) return;

      var that = this;

      // 实例对象上有readyState属性(0, 1, 2, 3)
      // WebSocket.CONNECTING=0正在建立, OPEN=1已建立, ClOSING=2正在关闭, CLOSED=3已关闭
      var ws = new WebSocket(that.conf.url);

      that.status = "initing"; // 手动设置状态

      // 通知服务器发送指定的数据类型
      ws.binaryType = "arraybuffer";

      this.ws = ws;

      that.listen();
    },
    listen: function () {
      var that = this;

      that.ws.onopen = function (evt) {
        that.trigger("open");
        that.status = "completed";
      };

      that.ws.onmessage = function (evt) {
        // msg有两种类型：String字符串 or ArrayBuffer二进制
        // 如果设置了binaryTyep，就是指定的类型
        var msg = evt.data;
        that.trigger("message", msg);
      };

      that.ws.onclose = function () {
        that.trigger("close");
        that.status = "closed";
      };

      that.ws.onerror = function () {
        that.trigger("error");
      };

      if (typeof that.conf.onopen === "function") {
        that.on("open", that.conf.onopen);
      }

      if (typeof that.conf.onmessage === "function") {
        that.on("message", that.conf.onmessage);
      }

      if (typeof that.conf.onreceive === "function") {
        that.on("receive", that.conf.onreceive);
      }

      if (typeof that.conf.onclose === "function") {
        that.on("close", that.conf.onclose);
      }

      if (typeof that.conf.onerror === "function") {
        that.on("error", that.conf.onerror);
      }
    },
    on: function (type, callback) {
      if (typeof type !== "string") {
        console && console.error("type 必须为字符串");
        return;
      }

      this.events[type] = this.events[type] || [];
      this.events[type].push(callback);
    },
    trigger: function (type, obj) {
      if (typeof type !== "string") {
        return;
      }

      var list = this.events[type] || [];
      var i = 0;
      while (i < list.length) {
        list[i].apply(this, [obj]);
        i++;
      }
    },
    send: function (data) {
      var that = this;

      // 只有当状态为open的时候，才能发送
      if (that.ws.readyState == WebSocket.OPEN) {
        that.ws.send(data);
      }
    },
    request: function (business, method, header, payload, callback) {
      var that = this;
      var uniqueId = getUniqueId();
      var req = (this.reqs[uniqueId] = {
        header: $.extend(
          true,
          {},
          {
            version: 1,
            sequence: uniqueId,
            type: 1,
            request: {
              service: business || "",
              method: method || "",
              one_way: false,
            },
          },
          $.isPlainObject(header) ? header : {}
        ),
        payload: JSON.stringify(payload || {}),
        callback: typeof callback == "function" ? callback : $.noop,
      });
      console.log(req.header, req.payload);
      that.send(new that.proto(req.header).toArrayBuffer());
      payload && that.send(str2ab(req.payload));
    },
  };

  return Factory;
})();

/*

new WS({
    url: conf.wsUrl,
    proto: conf.proto,
    onopen: function () {
        var that = this;

        // 发送ip, guid
        that.request('push', 'login', null, { ip: conf.ip, guid: conf.guid }, function (payload) {
            console.log('push login success...');
        });

        // 为了防止websocket链接中断，每隔180秒发一次请求，称为“心跳机制”
        var heartBeatTimer = setInterval(function () {
            if (that.ws.readyState == WebSocket.CLOSED || that.ws.readyState == WebSocket.CLOSING) {
                clearInterval(heartBeatTimer);
            }

            that.request('push', 'heartbeat', { type: 4 }, null, function () {
                console.log('push hearbeat success....');
            });
        }, 3 * 60 * 1000);
    },
    onmessage: function (data) {
        var that = this;

        // data 数据都是二进制格式的数据
        
        // 代表这是次发过来的是header
        // { version: '1', sequence: 111, type: 4, response: { status: 0, errmsg: ''} }
        if (!that.currentHeader) {
            var temp = that.proto.decode(data);
            console.log('header', temp);

            // 如果type == 4，表示服务端对“心跳”的应答，紧接着不传payload，所以必须过滤掉
            if (temp.type == 1 || temp.type == 2) {
                that.currentHeader = temp;
            }
            return;
        }

        // 代表这次发过来的是payload
        var payload = JSON.parse(that.decodeUtf8(data));
        console.log('payload', payload);
        
        switch (that.currentHeader.type) {
            case 1: // 表示服务端推送(请求)客户端
                that.trigger('receive', payload);
                break;
            case 2: // 表示服务端响应了之前客户端的请求, 之前的请求如果有回调就要执行
                var req = that.reqs[that.currentHeader.sequence];
                req.callback(payload);
                break;
        }

        that.currentHeader = null;
    },
    onreceive: function (data) {
        var that = this;

        if (Notification.permission == 'granted') {
            // 收到服务端的推送通知，调用Notification
            noticor.createNotice(data);
        } else if (Notification.permission == 'denied') {
            that.ws.close();
        }
        
    },
    onclose: function () {
        console.log('socket closed...');
    }
});

*/
