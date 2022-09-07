https://yeefun.github.io/event-loop-in-depth/
https://segmentfault.com/a/1190000008299659

w3c whatwg 规范
https://www.w3.org/TR/2011/WD-html5-20110525/webappapis.html#task-source

- 浏览器拿到 html 后，先扫一遍
  - 分析样式
    - 行内样式 style
    - 外包样式 link href='xxx' rel='stylesheet' 会影响 Domload 时间
  - 分析脚本
    - 行内脚本
    - 外部脚本 src='xxx'
    - 外部脚本 src='xxx' async async 会使得 DomLoa 事件提前
    - 外部脚本 src='xxx' defer

## document.DOMContentLoaded 事件

> 看名字就知道是 dom 内容加载完毕，

- 普通标签 div p 之类的，直接创建实例
- style 行内 css，直接解析，不需要花多少时间
- img 标签 直接跳过，直接算 loaded
- link 外部链接，下载 + 解析 完才算 loaded ！！！
- script 行内，解析 + 执行 完才算 loaded ！！！ 因为同步脚本可能会写入 dom，比如 img 等
- script 外部，下载 + 执行 完才算 loaded ！！！ 执行时也有可能写入 dom
- script 外部 async，直接跳过，直接算 loaded

## window.onload

- 普通标签 div p 之类的，直接创建实例
- style 行内 css，直接解析，不需要花多少时间
- `img 下载完成才算 load ` ！！！
- link 外部链接，下载 + 解析 完才算 loaded ！！！
- script 行内，解析 + 执行 完才算 loaded ！！！
- script 外部，下载 + 执行 完才算 loaded ！！！
- `script 外部 async，下载 + 执行 完才算 loaded ` ！！！

## 同步脚本 同步样式

- 一个文件对应一个任务（下载 + 执行），按照在 html 中出现的顺序，push 到 macro 队列

## render 插入时机

- 外部脚本 下载 之前会在头部插入一次（unshift）
- 外部脚本 下载执行 完之后，会在头部插入一次（unshift）
- async 外部脚本 下载执行 完之后，头部插入一次 unshift
- 最后一个行内脚本 执行 完后，push 一次

```js
// 浏览器事件  可以插入宏任务队列之前地方
// contentloaded
// onload

const macros = [
  inlineScript1,
  inlineScript2,
  // render,
  outScript1,
  // outAsyncScript1,
  inlineScript3,
];

const micros = [];

const frames = [];

function flushFrames() {
  // 渲染前清空frames
  const list = frames.slice();
  let i = 0;
  while (i <= list.length - 1) {
    const fn = list[i];
    fn();
    i++;
  }
}

function render() {
  flushFrames();
  browerRender(); // 真正的渲染
}

function flushMicro() {
  while (micros.length) {
    const micro = micros[0];
    micro();
  }
}

function flushMacro() {
  let i = -1;
  while (macros.length) {
    const macro = macros[0];
    macro();

    flushMicro();
  }
}

flushMacro();
```
