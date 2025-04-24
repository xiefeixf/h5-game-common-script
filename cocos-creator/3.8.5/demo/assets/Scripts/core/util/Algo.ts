/*
 * 
 * 公共算法库
 */
import * as cc from "cc";

let stringifyTmp = new Set();

export class Algo {

    /**
     * 安全序列化对象
     * 可防止循环引用，cc.Node对象
     * @param obj 
     * @param space 换行空格数
     * @returns 
     */
    public static stringify(obj: Object, space: number = 1) {
        stringifyTmp.clear();
        let str = JSON.stringify(obj, function (key, value) {
            if (value instanceof cc.Component) {
                return 'cc.Component(' + value.name + ")";
            }
            if (value instanceof cc.Node) {
                return 'cc.Node(' + value.name + ")";
            }
            if (typeof value === 'object' && value !== null) {
                if (stringifyTmp.has(value)) {
                    return "CircularReference";
                }
                stringifyTmp.add(value);
            }
            return value;
        }, space);
        stringifyTmp.clear();
        return str;
    }

    /**
     * BKDR hash算法
     * @param str 
     */
    public static BKDRHash(str: string): number {
        const seed = 131;  //  31 131 1313 13131 131313 etc..
        let hash = 0, i = 0;
        while (i < str.length) {
            let num = ((hash * seed) & 0xFFFFFFFF) >>> 0;
            hash = parseFloat(num + "") + str.charCodeAt(i++);
        }
        return (hash & 0x7FFFFFFF);
    }

    /**
     * @deprecated 异或加密
     * @param key 秘钥
     * @param data 需要加密的值
     */
    public static XOREncrypt(key: string, data: string) {
        let klen = key.length;
        let result = '';
        for (let i = 0; i < data.length; i++) {
            let code = data.charCodeAt(i) ^ key.charCodeAt(i % klen);
            result += String.fromCharCode(code);
        }
        return result;
    }

    /**
     * @deprecated 异或解密
     * @param key 秘钥（必须和加密一致）
     * @param data 加密后的字符
     */
    public static XORDecrypt(key: string, data: string) {
        let klen = key.length;
        let result = '';
        for (let i = 0; i < data.length; i++) {
            let code = data.charCodeAt(i) ^ key.charCodeAt(i % klen);
            result += String.fromCharCode(code - 63);
        }
        return result;
    }

    /**
     * 异或加密
     * @param key 秘钥
     * @param data 需要加密的值
     */
    public static XOR_Encrypt(key: string, data: string) {
        let klen = key.length;
        let result = '';
        for (let i = 0; i < data.length; i++) {
            let code = data.charCodeAt(i) ^ key.charCodeAt(i % klen);
            result += String.fromCharCode(code + 63);
        }
        return result;
    }

    /**
     * 异或解密
     * @param key 秘钥（必须和加密一致）
     * @param data 加密后的字符
     */
    public static XOR_Decrypt(key: string, data: string) {
        let klen = key.length;
        let result = '';
        for (let i = 0; i < data.length; i++) {
            let code = (data.charCodeAt(i) - 63) ^ key.charCodeAt(i % klen);
            result += String.fromCharCode(code);
        }
        return result;
    }


}