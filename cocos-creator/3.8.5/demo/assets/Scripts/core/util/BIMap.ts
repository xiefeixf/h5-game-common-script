/*
 *  
 * 双向Map结构
 */

let cid = 1;

export class BIMap<T extends Object> {
    private bid: string;
    private _count = 1;
    private _data = new Map<string, T | string>();

    constructor() {
        this.bid = "_bi_" + (cid++).toString();
    }

    /**
     * 设置值
     * @param key
     * @param value
     * @returns
     */
    public set(key: string, value: T) {
        if (!key || !value) {
            return;
        }
        let valkey = this.bid;
        let kid: string = value[valkey];
        if (!kid) {
            kid = "_bi_" + (this._count++).toString();
            value[valkey] = kid;
        }
        this._data.set(key, value);
        this._data.set(kid, key);
    }

    /**
     * 根据key获取value
     * @param key
     * @returns
     */
    public get(key: string): T {
        return this._data.get(key) as T;
    }

    /**
     * 根据value获取key
     * @param val
     * @returns
     */
    public getKey(val: T): string {
        let kid: string = val[this.bid];
        if (kid) {
            return this._data.get(kid) as string;
        }
        return "";
    }

    /**
     * key/value是否存在
     * @param keyOrVal
     * @returns
     */
    public has(keyOrVal: string | T): boolean {
        if (!keyOrVal) {
            return false;
        }
        let ttt = typeof keyOrVal;
        switch (ttt) {
            case "string": {
                return this._data.has(keyOrVal as string);
            }
            case "object": {
                let key = this.getKey(keyOrVal as T);
                return this.has(key);
            }
            default: {
                return false;
            }
        }
        return false;
    }

    /**
     * 删除key/value
     * @param keyOrVal
     * @returns
     */
    delete(keyOrVal: string | T) {
        if (!keyOrVal) {
            return;
        }
        let ttt = typeof keyOrVal;
        switch (ttt) {
            case "string": {
                let val = this.get(keyOrVal as string);
                if (val && val[this.bid]) {
                    this._data.delete(val[this.bid]);
                }
                break;
            }
            case "object": {
                let key = this.getKey(keyOrVal as T);
                this.delete(key);
                break;
            }
            default:
                break;
        }
    }

    /**
     * 清除数据
     */
    clear() {
        this._data.clear();
    }
}
