const Router = require('koa-router')
const router = new Router()
const tokenService = require('../src/token/TokenService')
const apiClient = require('../src/api/ApiClient')

router.get('/api/token', async ctx => {
	// token获取
	let api = new tokenService();
	const token = await api.get();

    // API方法调用
	var api_name = 'api.test.post.fixed';
	var api_version = '1.0';
	var json_data = '{"uid":123,"name":"zy"}';
	api_client = new apiClient(api_name,api_version);
	var result = await api_client.http_post_json(json_data);
	
	ctx.body={
		label: 'Current token:',
		token: token,
        result: result
	}
})

module.exports = router
