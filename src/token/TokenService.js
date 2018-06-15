const encryptUtil = require('../lib/EncryptUtil');
const config = require('../config/Configuration');
const http = require('http');
const Promise = require('bluebird')
const queryString = require('querystring');
const localCache = require('../lib/LocalCache');

class TokenService {
    // 构造函数
    constructor() {
        this.base_path = '/token/auth';
    }

    static parseJSON(jsonStr) {
        let result = null
        try {
            result = JSON.parse(jsonStr)
        } catch (e) {
            throw new Error('JSON.parse error,' + e);
        }
        return result
    }

    // Token获取
    async get() {
        let token_json_obj = null;

        let token_json = localCache.get(config.app_key);
        if (!token_json) {
            let tokenTrunk = await this.fetch(); // try catch
            if (tokenTrunk) {
                // 保存到本地缓存
                localCache.save(config.app_key, tokenTrunk);
                token_json_obj = TokenService.parseJSON(tokenTrunk);
            }
        } else {
            token_json_obj = TokenService.parseJSON(token_json);
        }

        let access_token = null;
        if (token_json_obj) {
            access_token = token_json_obj.access_token;
        } else {
            console.log('Token is null');
        }

        return access_token;
    }
    save(){
        let tokenTrunk = this.fetch();
        if (tokenTrunk) {
            // 保存到本地缓存
            localCache.save(config.app_key, tokenTrunk);
        }
    }
    reload(response) {
        /*
         INVALID_REFRESH_TOKEN(10010, "非法的refresh_token"),
         ACCESS_TOKEN_EXPIRED(10011, "access_token已过期"),
         INVALID_ACCESS_TOKEN(10012, "access_token非法"),
         REFRESH_TOKEN_EXPIRED(10013, "refresh_token已过期"),;
         */
        let error = JSON.parse(response);
        let code = error.code;
        if (code) {
            let token_json = localCache.get(config.app_key);
            let token_json_obj = TokenService.parseJSON(token_json);
            if (code === '10011') {
                if (token_json_obj) {
                    let tokenTrunk = this.refresh(token_json_obj.refresh_token);
                    if (tokenTrunk) {
                        localCache.save(config.app_key, tokenTrunk);
                    }
                }else{
                    this.save();
                }
            } else if (code === '10013') {
                this.save();
            }
        }
    }

    // Token刷新(根据refresh_token刷新)
    refresh(refresh_token) {
        // Timestamp
        const timestamp = new Date().getTime();
        const grant_type = 'refresh_token';
        // Plain Text
        const signPlainText = `${config.appKey}${grant_type}${refresh_token}${timestamp}`;
        // 生成的签名
        const signature = encryptUtil.hmac(signPlainText, config.app_secret);
        // token刷新路径
        let path = `${this.base_path}/refresh`;

        // 请求构建(Token-refresh)Request-body
        var postData = queryString.stringify({
            app_key: config.app_key,
            grant_type: grant_type,
            timestamp: timestamp,
            refresh_token: refresh_token,
            sign: signature
        });
        // Request-header
        var options = {
            hostname: config.gw_base_url,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': Buffer.byteLength(postData)
            }
        }

        // 发送请求
        return new Promise((resolve, reject) =>{
            let body=''
            var req = http.request(options, function (res) {
                res.setEncoding('utf-8');
                res.on('data', function (chunk) {
                    body+=chunk;
                });
                res.on('end', function () {
                    console.log('No more data');
                    resolve(body);
                });
            });
            req.on('error', function (err) {
                console.error(err);
                reject(err)
            });

            req.write(postData);
            req.end();
        });
    }

    fetch() {
        // Timestamp
        let timestamp = new Date().getTime();
        const grant_type = 'client_credentials';
        // 待签名
        let signPlainText = `${config.app_key}${grant_type}${timestamp}`;
        // 生成的签名
        let signatue = encryptUtil.hmac(signPlainText, config.app_secret);
        // token获取路径
        let path = `${this.base_path}/token`;

        // 请求构建(Token获取)-Requset-body
        var postData = queryString.stringify({
            app_key: config.app_key,
            grant_type: grant_type,
            timestamp: timestamp,
            sign: signatue
        });
        // 请求构建(Token获取)-Requset-header
        let options = {
            hostname: config.gw_base_url,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Content-Length': Buffer.byteLength(postData)
            }
        }
        // 发送请求
        return new Promise((resolve, reject) => {
            let body = '';
            let req = http.request(options, function (res) {
                res.setEncoding('utf-8');
                res.on('data', function (chunk) {
                    body += chunk;
                });
                res.on('end', function (data) {
                    resolve(body);
                });
            });
            req.on('error', function (err) {
                console.error(err);
                reject(err)
            });

            req.write(postData);
            req.end();
        })
    }
}

module.exports = TokenService
