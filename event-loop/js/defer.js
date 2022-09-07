(function () {
  // const img1 = new Image();
  // img1.src = "http://localhost:9191/img/loop.png";

  alert("macro defer");
  Promise.resolve().then(() => {
    alert("micro defer");
  });
  requestAnimationFrame(() => {
    alert("frame defer");
  });
  // let i = 0;
  // while (i < 1000000000) {
  //   i++;
  // }
})();
