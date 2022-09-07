
// 事件处理函数
var eventUtil = {
    getEvent: function (e) {
        return e || window.event;
    },
    getTarget: function (e) {
        var ev = this.getEvent(e);
        return ev.target || ev.srcElement;
    },
    stopPropagation: function (e) {
        var ev = this.getEvent(e);
        ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
    },
    preventDefault: function (e) {
        var ev = this.getEvent(e);
        ev.preventDefault ? ev.preventDefault() : ev.returnValue = false;
    },
    addHandler: function (elem, type, handler) {
        if (elem.addEventListener) {
            elem.addEventListener(type, handler, false);
        } else if (elem.attachEvent) { // 注意：handler执行环境中的this，指向不对，不是elem
            elem.attachEvent('on' + type, handler);
        } else {
            elem['on' + type] = handler;
        }
    },
    removeHandler: function (elem, type, handler) {
        if (elem.removeEventListener) {
            elem.removeEventListener(type, handler, false);
        } else if (elem.detachEvent) {
            elem.detachEvent('on' + type, handler);
        } else {
            elem['on' + type] = handler;
        }
    },
    addEvent: function (elem, type, handler, key) {
        var key = key || handler;
        if (elem[type + key]) {
            return false;
        }
        if (elem.addEventListener) {
            elem[type + key] = handler;
            elem.addEventListener(type, handler, false);
        } else if (elem.attachEvent) {  // 兼容性写法，解决this指向问题；
            elem["e" + type + key] = handler;
            elem[type + key] = function () {
                elem["e" + type + key](window.event);
            }
            elem.attachEvent('on' + type, elem[type + key]);
        }
    },
    removeEvent: function () {

    }
}
