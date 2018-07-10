const Router = require('koa-router')
const router = new Router()
const tokenService = require('../src/token/TokenService')
const apiClient = require('../src/api/ApiClient')

router.get('/api/token', async ctx => {
	// token获取
	let api = new tokenService();
	let token = await api.get();

    // API方法调用
	let api_name = 'api.test.post.fixed';
	let api_version = '1.0';
	let json_data = '{"uid":123,"name":"zy"}';
	let api_client = new apiClient(api_name,api_version);
	let result = await api_client.http_post_json(json_data);
	
	ctx.body={
		label: 'Current token:',
		token: token,
        result: result
	}
})

module.exports = router
