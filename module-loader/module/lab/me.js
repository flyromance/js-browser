var labjs = (function () {
  var maps = {};

  return {
    script: function (url) {
      loadScript(url, function () {

      })
      return {
        script: function () {

        },
        await: function () {

        },
      }
    },
    await: function () {

      return {
        script: function () {

        },
        await: function () {

        }
      }
    }
  }
})()
