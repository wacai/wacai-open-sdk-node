const fs = require("fs");
const path = require("path")
/**
 * 本地缓存
 */
class LocalCache{
    // 本地缓存文件路径
	static getPath(key){
		return path.join(__dirname, '..', '/cache_folder/', `${key}.txt`);
	}
	static save(key,value){
        var cacheFile = this.getPath(key);
        fs.writeFileSync(cacheFile,value,{encoding: 'UTF8'});
	}
    static get(key){
        var data = null;
        var cacheFile = this.getPath(key);
        if(fs.existsSync(cacheFile)){
            data = fs.readFileSync(cacheFile,{'encoding': 'UTF8'});
        }
        return data;
	}
}

module.exports = LocalCache;