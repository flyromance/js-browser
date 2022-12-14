/**
 * 为什么会乱码？？？ 没有设置 text/xxx; charset=utf-8 缺一不可
 *
 * 为什么图片不对？？？
 *
 * 为什么响应头有keep-live，如何关闭
 *
 * 如何设置换存
 */

var http = require("http");
var path = require("path");
var fs = require("fs");
var parse = require("url").parse;

function normlizeOptions(options = {}) {
  const cwd = typeof options.cwd === "string" ? options.cwd : process.cwd();
  const port =
    typeof options.port === "string" || typeof options.port === "number"
      ? options.port
      : 9191;
  const prefix = typeof options.cwd === "string" ? options.prefix : "";
  const extensions = Array.isArray(options.extensions)
    ? options.extensions
    : [".html"];
  const fallback =
    typeof options.fallback === "boolean" ? options.fallback : true;
  const cache = typeof options.cache === "boolean" ? options.cache : true;

  return {
    cwd,
    port,
    prefix,
    extensions,
    fallback,
    cache,
  };
}

function stripRegExpString(str) {
  return str.replace(/\//, "\\/").replace(/\./, "\\.");
}

const extmap = {
  // '': 'text/plain',
  html: "text/html", //
  css: "text/css", //
  js: "application/javascript",
  json: "application/json",
  svg: "image/svg+xml",
  png: "image/png",
  jpg: "image/jpg",
  jpeg: "image/jpeg",
  woff: "application/font-woff",
};

function findFile(ranges) {
  for (let i = 0; i < ranges.length; i++) {
    try {
      const stats = fs.statSync(ranges[i]);
      if (stats.isFile()) {
        return {
          stats,
          filename: ranges[i],
        };
      }
    } catch (e) {
      // 如果不存在（文件或文件夹）会报错
    }
  }
}

// .html结尾不cache
// 支持cwd
// 支持port
// 支持prefix:         /prefix/xxx... => /xxx
// 支持文件默认后缀:     /xxx => 查找范围 [/xxx, /xxx/index.js, /xxx/index.json, ...]
// 支持文件夹缺省查找:   /xxx => 查找范围 [/xxx/index.js, /xxx/index.json, ...]
// 支持fallback:      如果匹配不到则，返回根目录下的index.html
// 支持cache:
function createServer(options) {
  const { cwd, port, prefix, extensions, fallback, cache } =
    normlizeOptions(options);
  const rootDir = path.resolve(cwd);

  const server = http.createServer(function (req, res) {
    const originUrl = req.url; // 不会有hash信息
    let urlStr = originUrl;

    console.log(">>>>>> origin url: " + originUrl); //  '/'  '/xx' '/xx/'

    // 'xx' => '/xx' 需要转
    // '/xx'
    if (prefix) {
      const _p = "/" + prefix.replace(/^\//, ""); // 保证第一个字符是'/'
      urlStr = originUrl.replace(new RegExp("^" + stripRegExpString(_p), ""));
    }

    // urlStr 有可能是 '' '/' '/xx' '/xx/'
    const { pathname } = parse(urlStr || "/");
    const _filename = path.join(rootDir, pathname);

    // 查找范围
    const list = [];
    if (!_filename.endsWith("/")) {
      list.push(_filename);
      list.push(...extensions.map((e) => _filename + e));
    }
    list.push(...extensions.map((e) => path.join(_filename, "index" + e)));

    let ret = findFile(list);

    // 如果没有找到，并且支持回退
    if (!ret && fallback) {
      ret = findFile([
        path.join(rootDir, "index"),
        path.join(rootDir, "index.html"),
      ]);
    }

    // 还没找到就报错
    if (!ret) {
      res.statusCode = 404;
      return res.end("not found...");
    }

    const { filename: finalFilename, stats } = ret;

    // res.setHeader("content-type", "image/svg+xml");
    // fs.createReadStream(finalFilename).pipe(res);

    setTimeout(() => {
      fs.createReadStream(finalFilename).pipe(res);
    }, 5000);

    // fs.readFile(finalFilename, { encoding: "binary" }, function (err, data) {
    //   if (err) {
    //     res.end("error");
    //   }
    //   res.statusCode = 200;
    //   console.log(typeof data)
    //   res.end(data);
    // });

    return;
    fs.readFile(finalFilename, function (err, data) {
      if (err) {
        console.log("error");
        res.statusCode = 404;
        res.end("not found...");
        return;
      }
      console.log(`>>>>>> filename: ${finalFilename.replace(rootDir, "")}`);
      var ext = path.extname(finalFilename).replace(/^\./, "");
      var mimeType = extmap[ext] || "text/plain";
      const encoding = "charset=utf-8";

      // Content-Length是指字节长度，不是字符串长度，所以不能直接用data.length;
      // 一个中文字、中文符号3个字节，数字、字母、英文符号、空格为1个字节
      res.setHeader("content-length", Buffer.byteLength(data));
      res.setHeader("content-type", "text/plain");
      //   res.setHeader(
      //     "content-type",
      //     `${mimeType}${ext === "png" ? "" : "; " + encoding}`
      //   );
      res.statusCode = 200;
      if ([".css", ".js"].some((item) => finalFilename.endsWith(item))) {
        setTimeout(() => {
          res.write(data);
          res.end();
        }, 0);
      } else {
        res.write(data);
        res.end();
      }
    });
  });
  server.listen(port, function () {
    console.log(`server url: http://127.0.0.1:${port}`);
  });
  return server;
}

createServer({});
