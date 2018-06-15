const encryt = require('../lib/EncryptUtil');
const config = require('../config/Configuration');
const TokenService = require('../token/TokenService');
const http = require('http');

/**
 * Api Client(调用api接口的客户端)
 */
class ApiClient{
	// 构造函数
	constructor(apiName,apiVersion){
		this.apiName = apiName;
		this.apiVersion = apiVersion;
		this.tokenService = new TokenService();
	}
	// 发送json请求的方法
    async http_post_json(json_data){
		// 从缓存加载token
		const cache_key = config.app_key;
		// Access token
        let access_token = await this.tokenService.get();
		// 时间戳
		let timestamp = new Date().getTime();
		// MD5摘要
		let bodyMd5 = encryt.md5(json_data);
		// Head String
		let headerString = `x-wac-access-token=${access_token}&x-wac-timestamp=${timestamp}&x-wac-version=${config.x_wac_version}`;
		// 待签名
		let plainSignText= `${this.apiName}|${this.apiVersion}|${headerString}|${bodyMd5}`;
		// 生成的签名
		let signature = encryt.hmac(plainSignText, config.app_secret);
		// 请求路径
		let path = `/gw/api_entry/${this.apiName}/${this.apiVersion}`;

		//var postData = JSON.stringify({json_data});
		var postData = JSON.stringify(JSON.parse(json_data));
		var options={
			hostname: config.gw_base_url,
			path: path,
			method:'POST',
				headers:{
				'Content-Type': 'application/json; charset=UTF-8',
				'Content-Length': Buffer.byteLength(postData),
				'x-wac-version': config.x_wac_version,
				'x-wac-timestamp': timestamp,
				'x-wac-access-token': access_token,
				'x-wac-signature': signature
			}
		}

        return new Promise((resolve, reject) =>{
            let body = '';
            var req = http.request(options, function(res) {
                res.setEncoding('utf-8');
                res.on('data',function(chunk){
                	body+=chunk;
                });
                res.on('end',function(){
                    //this.tokenService.reload(body);
                    resolve(body);
                });
            });
            req.on('error',function(err){
                console.error(err);
                reject(err)
            });

            req.write(postData);
            req.end();
        });
	}
}

module.exports = ApiClient;