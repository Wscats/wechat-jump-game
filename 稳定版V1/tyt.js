//建议选择启动安卓的PTP传输照片模式
//不然可能造成照片读取上传下载出现问题
var express = require('express');
var child_process = require('child_process');
//实例化第一个express的应用
var app = express();
app.get('/screencap', function(req, res) {
	res.append("Access-Control-Allow-Origin", "*");
	// 触按屏幕时间
	var t;
	// 系数5.5
	t = req.query.length * 5.5;
	new Promise(function(resolve, reject) {
		exec(`adb shell input swipe 100 200 100 200 ${parseInt(t)}`, () => {
			console.log("跳完了");
			resolve()
		});
	}).then(function() {
		return new Promise(function(resolve, reject) {
			//适当调整延时器是必须的
			setTimeout(() => {
				screencap(() => {
					resolve()
				});
			}, 280)
		})
	}).then(function() {
		res.send('删图成功');
	})
});
app.listen(8888);
console.log("开启服务器");

function exec(cmd, success, error) {
	child_process.exec(cmd, (err, stdout, stderr) => {
		if(err) {
			console.error(err);
			error();
			return;
		}
		success();
	});
}

function screencap(callback) {
	//新建文件夹
	new Promise(function(resolve, reject) {
			//这段可要可不要
			exec('adb shell rm -r /sdcard/wscats/', () => {
				console.log("删除图片成功");
				resolve();
			});
		})
		.then(function() {
			return new Promise(function(resolve, reject) {
				exec('adb shell mkdir -p /sdcard/wscats', () => {
					console.log("创建文件夹成功");
					resolve();
				});
			})
		})
		.then(function() {
			//截图
			return new Promise(function(resolve, reject) {
				exec('adb shell screencap -p /sdcard/wscats/screen.png', () => {
					console.log("截图成功");
					resolve();
				});
			})
		}).then(function() {
			//传图
			return new Promise(function(resolve, reject) {
				exec('adb pull /sdcard/wscats/screen.png .', () => {
					console.log("上传手机图片成功");
					resolve();
				}, () => {
					screencap(callback);
				});
			})
		}).then(function() {
			//删图
			return new Promise(function(resolve, reject) {
				exec('adb shell rm -r /sdcard/wscats/', () => {
					console.log("删除图片成功");
					callback();
				});
			})
		})
}