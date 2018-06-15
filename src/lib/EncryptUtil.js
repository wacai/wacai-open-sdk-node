const crypto = require('crypto');
/**
 * 签名工具类
 */
class EncryptUtil {
    /**
     * replace 为了匹配java Base64.encodeBase64URLSafeString，Url安全
     * @param data 需要加密的数据
     * @param secret 秘钥
     */
    static hmac(data, secret) {
        let hmac = crypto.createHmac('sha256', secret).update(data, 'utf8').digest('base64');
        let hash = hmac.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        return hash;
    }

    /**
     * @param data 需要md5加密的数据
     */
    static md5(data) {
        let md5 = crypto.createHash('md5').update(data, 'utf-8').digest('base64');
        return md5;
    }
}
module.exports = EncryptUtil;