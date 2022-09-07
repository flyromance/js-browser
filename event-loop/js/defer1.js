(function () {
  // const img1 = new Image();
  // img1.src = "http://localhost:9191/img/loop.png";

  alert("macro defer1");
  Promise.resolve().then(() => {
    alert("micro defer1");
  });
  requestAnimationFrame(() => {
    alert("frame defer1");
  });
  
})();
