// navigator.userAgent
//  ie7: "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)"
//  ie8(兼容): "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)"
//  ie9(兼容): "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)"
// ie10(兼容): "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.1; WOW64; Trident/6.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)"
//  ie8: "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.3; .NET4.0C; .NET4.0E)"
//  ie9: "Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; WOW64; Trident/5.0)"
// ie10: "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)"

// document.documentMode
// ie5/ie6/ie7: undefined, 用它可以判断真正的浏览器版本号！
// ie5/ie6/ie7: 对应的版本号，前提：在ie浏览器版本>=8的情况下
// ie8+: 对应的版本号

/**
 * 如何判断真正的浏览器版本号？(在ie8以上的浏览器中，提供了浏览器模式选择的功能，如果用 msie 来判断，得到可能不是真正的浏览器版本号！)
 * ie6: 可以通过 msie 来判断，因为ie7/8/9/10没有提供ie6的浏览器模式，也就是无法在高版本ie浏览器下选择ie6模式
 * ie7: 先通过 msie 来判断是否是7.0，此时还有可能是在高版本浏览器中选择的i7浏览器模式;
        接着如果document.documentMode === undefined，就可确定是ie7;
        因为documentMode在ie8版本之后才引入的，只要真正的浏览器版>=8，都有documentMode, 比如在ie9下选择文本模式为ie6，此时documentMode为6;
 * ie8: trident
 */

/**
 * 如何判断是否处于兼容性视图模式？
 * UA 中 Trident 版本和 IE 版本是否匹配
 *
 */
function getIE() {
  var ua = navigator.userAgent;
  var result = ua.match(/(msie|chrome|safari|firefox|opera|trident)/);
  result = result ? result[0] : "";

  if (result == "msie") {
    result = ua.match(/msie[^;]+/) + "";
  } else if (result == "trident") {
    ua.replace(/trident\/[0-9].*rv[ :]([0-9.]+)/gi, function (a, c) {
      result = "msie " + c;
    });
  }

  return result;
}

/* IE detection. Gist: https://gist.github.com/julianshapiro/9098609 */
// http://tanalin.com/en/articles/ie-version-js/
var IE = (function () {
  if (document.documentMode) {
    return document.documentMode;
  } else {
    for (var i = 7; i > 4; i--) {
      var div = document.createElement("div");

      div.innerHTML = "<!--[if IE " + i + "]><span></span><![endif]-->";

      if (div.getElementsByTagName("span").length) {
        div = null;

        return i;
      }
    }
  }
  return undefined;
})();

// ie > 10 没有document.all这个属性了;
function ltIE10() {
  return !!window.document.all;
}

var IE_version = function () {
  if (window.atob) {
    return "10+"; // history.pushState
  } else if (window.addEventListener) {
    return "9+";
  } else if (window.querySelector) {
    return "8+"; // ie 8 部分支持querySelector
  } else if (window.XMLHttpRequest) {
    return "7+";
  } else if (window.document.documentMode) {
    return "6+";
  } else {
    return "5+";
  }
};

/**
 * @method vendorPropName
 * @param string css属性名称 transition transform等
 * @return string or null 转化后的css属性名称，比如：在老chrome浏览器中 transition 被转为 WebkitTransition; 在ie8中 返回null！
 *
 */
var vendorPropName = (function () {
  var style = document.createElement("div").style,
    cssPrefixes = ["Webkit", "Moz", "O", "ms", "Khtml"].reverse(), // css3属性
    memory = {}; // 用于记忆 Css3 属性

  return function (prop) {
    // 处理一般的属性, 不做记忆
    if (prop in style) {
      return prop;
    }

    // 处理css3属性
    if (typeof memory[prop] === "undefined") {
      var lens = cssPrefixes.length,
        capName = prop.charAt(0).toUpperCase() + prop.slice(1),
        vendorName;
      memory[prop] = null; // 初始化，下次就不会走这个if了

      while (lens--) {
        vendorName = cssPrefixes[lens] + capName; // eg: WebkitTransition; WebkitBorderRadius
        console.log(vendorName);
        if (vendorName in style) {
          return (memory[prop] = vendorName);
        }
      }
    }

    return memory[prop];
  };
})();

/**
 * @method supportCss3 是否支持Css3属性，
 * @param string css属性名称
 * @requires vendorPropName
 * @function 判断动画效果用css3属性来实现，还是用setInterval(jquery animate)来实现
 * @return boolean
 */
function supportCss3(name) {
  if (typeof name !== "string") {
    return false;
  }
  return !!vendorPropName(name);
}

/**
 * 获取transitionend 事件名称
 */
function getTransitionEndName() {
  var transEndEventNames = {
    WebkitTransition: "webkitTransitionEnd",
    MozTransition: "transitionend",
    OTransition: "oTransitionEnd otransitionend",
    transition: "transitionend",
  };
  var name = vendorPropName("transition");
  return name ? transEndEventNames[name] : null;
}
