const Router = require('koa-router')
const router = new Router()
const apiClient = require('../src/api/ApiClient')

// API方法调用
router.get('/api/demo', async ctx => {
	// api方法名称
	let api_name = 'api.test.post.fixed';
    // api方法版本
	let api_version = '1.0';
    // 请求报文(json格式)
	let json_data = '{"uid":123,"name":"zy"}';
    // api 初始化
	let api_client = new apiClient(api_name,api_version);
    // api调用
	let result = await api_client.http_post_json(json_data);
	
	ctx.body={
		label: 'Demo return:',
        result: result
	}
})

module.exports = router
