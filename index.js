let exec = require('child_process').exec;
let process = require('child_process');
let http = require('http');
let url = require('url');
let querystring = require('querystring');
let fs = require('fs');
let runExec = (cmdStr, callback) => {
  exec(cmdStr, (err, stdout, stderr) => {
    if (err) {
      //console.log('error:' + stderr);
      //return;
    } else {
      //console.log(cmdStr)
      callback();
    }
  });
}

setInterval(() => {
  // 在/sdcard/下新建wscats文件件
  runExec(`adb shell mkdir -p /sdcard/wscats`, () => {
    // 截图并保存到/sdcard/wscats/下，并命名为screen.png
    runExec(`adb shell screencap -p /sdcard/wscats/screen.png`, () => {
      // 上传/sdcard/wscats/的截图到电脑
      runExec(`adb pull /sdcard/wscats/screen.png .`, () => {
        // 删除/sdcard/wscats/下的screen.png，用删除文件夹的方式比较稳定，删图片有可能出问题
        runExec(`adb shell rm -r /sdcard/wscats/`, () => {
          console.log("截图成功");
        })
      })
    })
  })
}, 3000)

http.createServer((req, res) => {
  switch (url.parse(req.url).pathname) {
      // 跳一跳路由
    case "/jump":
      // 解决跨域
      res.setHeader("Access-Control-Allow-Origin", "*")
      var query = url.parse(req.url).query
      console.log(querystring.parse(query))
      var param = querystring.parse(query)
      // 触按屏幕时间
      var t;
      // 系数5.5
      t = param.length * 5.5;
      // 小于10的距离，原地跳
      if (param.length < 10) {
        t = 0;
      }
      console.log("长按：", t, "秒")
      runExec(`adb shell input swipe 100 200 300 400 ${parseInt(t)}`, () => {
        res.end('success')
      })
      break;
    default:
      //进入页面
      fs.readFile("." + url.parse(req.url).pathname, function(err, data) {
        res.end(data)
      })
  }
}).listen(1314)
console.log("开启服务器")
