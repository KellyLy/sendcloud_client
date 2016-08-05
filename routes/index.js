var express = require('express');
var router = express.Router();
var eventproxy = require("eventproxy");
var fetch_function = require("../fetch_function/fetch.js");

var fetch_data_get = fetch_function.fetch_data_get;
var fetch_data_post = fetch_function.fetch_data_post;
var eventproxy = new eventproxy();

// 应用主页
router.get("/send_email", function(req, res, next){
  res.render("index", { title: 'SendCloud Client' });
});
router.get("/send_email/*", function(req, res, next){
  res.render("index", { title: 'SendCloud Client' });
});

// 登录
router.post("/api/login", function(req, res, next){
	var apiUser = req.body.apiUser;
	var apiKey = req.body.apiKey;
	fetch_data_get("http://api.sendcloud.net/apiv2/userinfo/get", { apiUser: apiUser, apiKey: apiKey })
		.then((result) => {
			if(!result.body.result){
				res.json({ error : "错误的API_USER或API_KEY" });
				return;
			};
			var user_name = result.body.info.userName;
			res.json({ user_name : user_name });
		})
		.catch((error) => { console.log(error) });
});

// 获取api_user template address_list label_list
router.get("/api/get_api_user_and_template", function(req, res, next){
	var apiUser = req.query.apiUser;
	var apiKey = req.query.apiKey;
	// get_api_user_list，get_template_list成功后触发操作
	eventproxy.all("get_api_user_list", "get_template_list", "get_address_list", "get_label_list", function(api_user_list, template_list, address_list, label_list){
		console.log(api_user_list);
		console.log(template_list);
		console.log(address_list);
		console.log(label_list);
		res.json({ 
			api_user_list: api_user_list, 
			template_list: template_list,
			address_list: address_list,
			label_list: label_list
		});
	});
	// get_api_user_list
	fetch_data_get("http://api.sendcloud.net/apiv2/apiuser/list", {apiUser: apiUser, apiKey: apiKey})
		.then((result) => {
			var api_user_list = result.body.info.dataList;
			eventproxy.emit("get_api_user_list", api_user_list);
		})
		.catch((error) => { console.log(error) });
	// get_template_list
	fetch_data_get("http://api.sendcloud.net/apiv2/template/list", {apiUser: apiUser, apiKey: apiKey, templateStat: 1})
		.then((result) => {
			var template_list = result.body.info.dataList;
			eventproxy.emit("get_template_list", template_list);
		})
		.catch((error) => { console.log(error) });
	// get_address_list
	fetch_data_get("http://api.sendcloud.net/apiv2/addresslist/list", {apiUser: apiUser, apiKey: apiKey})
		.then((result) => {
			var address_list = result.body.info.dataList;
			eventproxy.emit("get_address_list", address_list);
		})
		.catch((error) => { console.log(error) });
	// get_label_list
	fetch_data_get("http://api.sendcloud.net/apiv2/label/list", {apiUser: apiUser, apiKey: apiKey})
		.then((result) => {
			var label_list = result.body.info.dataList;
			eventproxy.emit("get_label_list", label_list);
		})
		.catch((error) => { console.log(error) });
});

// 普通发送
router.post("/api/send", function(req, res, next){
	fetch_data_post("http://api.sendcloud.net/apiv2/mail/send", req.body)
		.then((result) => {
			console.log(result.body);
			if(!result.body.result){
				res.json({ error: true, message: result.body.message });
				return false;
			};
			res.json({ error: false, message: "邮件发送成功！" });
		})
		.catch((error) => { console.log(error) });
});

// 模板发送
router.post("/api/template_send", function(req, res, next){
	fetch_data_post("http://api.sendcloud.net/apiv2/mail/sendtemplate", req.body)
		.then((result) => {
			console.log(result.body);
			if(!result.body.result){
				res.json({ error: true, message: result.body.message });
				return false;
			};
			res.json({ error: false, message: "邮件发送成功！" });
		})
		.catch((error) => { console.log(error) });
});

module.exports = router;