function getStyle(obj, attr) {
    return window.getComputedStyle ? window.getComputedStyle(obj, null)[attr] : obj.currentStyle[attr];
}

function startMove(target, attr, endFun) {

    if (!target || target.nodeType !== 1) {
        throw new Error('obj应该是dom对象！');
    }

    target.timer && clearInterval(target.timer);

    target.timer = setInterval(function() {
        var curr, speed;
        var stop = true;

        for (var key in attr) {

            if (attr.hasOwnProperty(key)) {

                if (key == 'opacity') {
                    curr = parseFloat(getStyle(target, key)) * 100;
                } else {
                    curr = parseInt(getStyle(target, key));
                }

                speed = (attr[key] - curr) / 6;

                // attr[key] = 106
                speed > 0 ? speed = Math.ceil(speed) : Math.floor(speed);

                // 所有属性只要有一个不满足就设置为false，也就代表没有完成！
                if (curr !== attr[key]) {
                    stop = false;
                }

                if (key == 'opacity') {
                    target.style.opacity = (curr + speed) / 100;
                    target.style.filter = 'alpha(opacity:' + (curr + speed) * 100 + ')';
                } else {
                    target.style[key] = curr + speed + 'px';
                }
            }
        }

        if (stop) {
            console.log('completed');
            clearInterval(target.timer);
            typeof endFun == 'function' && endFun();
        }
    }, 30);
}
