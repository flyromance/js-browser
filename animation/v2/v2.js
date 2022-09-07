// 获取时间
function getTime() {
    if (typeof performance != 'undefined' && performance.now) {
        return performance.now();
    } else if (Date.now) {
        return Date.now();
    } else {
        return (new Date()).getTime();
    }
}

// polyfill
if (typeof window.requestAnimationFrame != 'function') {
    window.requestAnimationFrame = function(fn) {
        return setTimeout(function() {
            fn.apply(this);
        }, 1000 / 60);
    };

    window.cancelAnimationFrame = function(id) {
        return clearTimeout(id);
    };
}

function Animator(duration, progress, easing) {
    this.duration = duration;
    this.progress = progress;
    this.easing = easing || function(p) {
        return p;
    };
}

Animator.prototype = {
    start: function(callback) {
        var that = this;
        var start_time = Date.now();
        var duration = this.duration;

        requestAnimationFrame(function change() {
            var p = (Date.now() - start_time) / duration;
            var next = true;

            if (p < 1) {
                that.progress(that.easing(p), p);
            } else {
                if (typeof callback === 'function') {
                    next = callback() === false;
                } else {
                    next = callback === false;
                }

                if (next) {
                    start_time = start_time + duration;
                    that.progress(that.easing(p), p);
                } else {
                    that.progress(that.easing(1), 1);
                }
            }

            if (next) {
                requestAnimationFrame(change);
            }
        });
    }
};

function AnimationQueue(animators) {
    this.animators = animators || [];
}

AnimationQueue.prototype = {
    add: function() {
        var args = [].prototype.slice.apply(arguments);
        this.animators.push.apply(this.animators, args);
    },
    fire: function() {
        var animators = this.animators;

        function play() {
            var animator = animators.shift();
            if (animator instanceof Animator) {
                animator.start(function() {
                    play();
                });
            }
        }
        
        if (this.animators.length) {
            play();
        }
    }
};

var a = new Animator(1000, function(p) {
    var tx = 100 * p;
    elem.style.transform = 'translateX(' + tx + 'px)';
});
