import { Algo } from "../util/Algo";

const trace = function (...args) {
    console.log("engine.localStorage", ...args);
};

const ENCRY_TAG = "xlosr";
const ENCRY_TAG2 = "xlor";

export class LocalStorage {

    /**
     * 是否存储加密数据
     * 默认false
     */
    private _encrypt: boolean = false;
    public get encrypt() {
        return this._encrypt;
    }
    public set encrypt(val: boolean) {
        this._encrypt = val;
        trace(" encrypt => " + val.toString());
    }
    private _queues: Map<string, string> = null;
    public get queues() {
        if (!this._queues) {
            this._queues = new Map<string, string>();
        }
        return this._queues;
    }

    public localStorage: Storage = null;
    /**
     * LocalStorage存储前缀, 适合多玩法使用
     * 玩法名称id，用来区分玩法切换
     */
    public prefix: string = '';

    /**
     * 存储key前缀, 适合多玩法
     * @param localStorage 
     * @param prefix 
     */
    constructor(localStorage: Storage, prefix: string = "") {
        this.localStorage = localStorage;
        this.prefix = prefix;
    }

    /**** 以下根据玩法名获取值 */
    /**
     * 设置玩法localstorage 值(转number)
     * @param key 
     * @param value 
     */
    public setValueForKey(key: string, value: string | number | Object) {
        this.SetValueForKey(this.prefix + key, value);
    }
    /**
     * 获取玩法localstorage 值(转number)
     * @param key 
     * @returns 
     */
    public getIntegerForKey(key: string, defaultV: number = 0): number {
        return this.GetIntegerForKey(this.prefix + key, defaultV);
    }
    /**
     * 获取玩法localstorage 值(转number)
     * @param key 
     * @returns 
     */
    public getFloatForKey(key: string, defaultV: number = 0.0): number {
        return this.GetFloatForKey(this.prefix + key, defaultV);
    }
    /**
     * 获取玩法localstorage 值(转string)
     * @param key 
     * @returns 
     */
    public getStringForKey(key: string, defaultV: string = ""): string {
        return this.GetStringForKey(this.prefix + key, defaultV);
    }
    /**
     * 获取玩法localstorage 值(自动转bool)
     * @param key 
     * @returns 
     */
    public getBooleanForKey(key: string, defaultV: boolean = false): boolean {
        return this.GetBooleanForKey(this.prefix + key, defaultV);
    }
    /**
     * 获取玩法localstorage 存储的json对象
     * @param key 
     * @returns 
     */
    public getJSONForKey(key: string, defaultV: string = ""): Object {
        return this.GetJSONForKey(this.prefix + key, defaultV);
    }
    /**
     * 删除玩法localstorage key值
     * @param key 
     * @returns 
     */
    public removeForKey(key: string) {
        return this.RemoveForKey(this.prefix + key);
    }

    private _formatValue(value: any) {
        let typed = typeof value;
        let data = "";
        switch (typed) {
            case "undefined":
                {
                    data = "";
                    break;
                }
            case "boolean": {
                data = (!!value).toString();
                break;
            }
            case "number": {
                if (isNaN(value)) {
                    data = "NaN";
                } else {
                    data = value + "";
                }
                break;
            }
            case "bigint": {
                data = value.toString();
                break;
            }
            case "object": {
                if (value) {
                    data = JSON.stringify(value);
                }
                break;
            }
            default: {
                data = value;
                break;
            }
        }
        return data;
    }

    /********** 以下是全局获取方式 */
    /**
     * 设置key-value值
     * @param key 
     * @param value string / bool / 对象
     */
    public SetValueForKey(key: string, value: string | number | any) {
        if (!key) {
            throw new Error("key can't be null or empty!");
        }
        let queues = this.queues;
        queues.set(key, this._formatValue(value));
        if (queues.size === 1) {
            Promise.resolve().then(() => {
                //  trace(" setItem count=>", queues.size);
                for (let [k, v] of queues) {
                    if (this._encrypt) {
                        let data = ENCRY_TAG2 + Algo.XOR_Encrypt(Algo.BKDRHash(k).toString(), v);
                        this.localStorage.setItem(k, data);
                    } else {
                        this.localStorage.setItem(k, v);
                    }
                }
                queues.clear();
            });
        }
    }
    /**
     * 获取一个number值
     * @param key 
     * @param defaultV 如返回值为空，则用defaultV
     * @returns 
     */
    public GetIntegerForKey(key: string, defaultV: number = 0): number {
        let value = this.getItem(key);
        if (value == null || value == undefined || value === "NaN" || value === "") {
            return defaultV;
        }
        let val = parseInt(value);
        return isNaN(val) ? defaultV : val;
    }

    /**
     * 获取一个number值
     * @param key 
     * @param defaultV 如返回值为空，则用defaultV
     * @returns 
     */
    public GetFloatForKey(key: string, defaultV: number = 0.0): number {
        let value = this.getItem(key);
        if (value == null || value == undefined || value === "NaN" || value === "") {
            return defaultV;
        }
        let val = parseFloat(value);
        return isNaN(val) ? defaultV : val;
    }

    /**
     * 获取一个string值
     * @param key 
     * @param defaultV 如返回值为空，则用defaultV
     * @returns 
     */
    public GetStringForKey(key: string, defaultV: string = ""): string {
        let value = this.getItem(key);
        if (value == null || value == undefined || value === "") {
            return defaultV;
        }
        return value;
    }

    /**
     * 获取一个bool值
     * @param key 
     * @returns 
     */
    public GetBooleanForKey(key: string, defaultV: boolean = false): boolean {
        let value = this.getItem(key);
        if (value == null || value == undefined || value === "") {
            return defaultV;
        }
        return value === "true";
    }

    /**
     * 获取一个对象
     * @param key 
     * @returns 
     */
    public GetJSONForKey(key: string, defaultV: string = ""): Object {
        try {
            let str = this.GetStringForKey(key, defaultV);
            if (str) {
                return JSON.parse(str);
            };
        } catch (error) {
            console.log(error);
        }
        return null;
    }
    /**
     *  删除key
     * @param key 
     */
    public RemoveForKey(key: string) {
        return this.removeItem(key);
    }

    /***** 以下接口是保证和cocos默认接口兼容而设置 */
    /**
     * 设置值
     */
    public setItem(key: string, value: string | number | Object) {
        this.SetValueForKey(key, value);
    }
    /**
     * 获取值
     * @param key 
     * @returns 
     */
    public getItem(key: string) {
        if (this.queues.has(key)) {
            return JSON.parse(this.queues.get(key));
        }
        let data = this.localStorage.getItem(key);
        if (typeof data === "string" && data) {
            if (data.indexOf(ENCRY_TAG2) === 0) {
                return JSON.parse(Algo.XOR_Decrypt(Algo.BKDRHash(key).toString(), data.substring(ENCRY_TAG2.length)));
            }
            if (data.indexOf(ENCRY_TAG) === 0) {
                return JSON.parse(Algo.XORDecrypt(Algo.BKDRHash(key).toString(), data.substring(ENCRY_TAG.length)));
            }
        }
        if (!data || data == "") {
            return null;
        }
        return JSON.parse(data);
    }
    /**
     * 删除key
     * @param key 
     * @returns 
     */
    public removeItem(key: string) {
        this.queues.delete(key);
        return this.localStorage.removeItem(key);
    }
}
