import { _decorator } from 'cc';
import { CCComFun } from '../core/util/CCComFun';
import { SymbolExplain } from '../core/utilconfg/GF_Constant';
import { GF_Globals } from '../core/utilconfg/GF_Globals';
const { ccclass } = _decorator;

@ccclass('BaseConfig')
export class BaseConfig {

    protected config: { [key: string]: any } = null;

    constructor(para) {
        this.config = para;
    }

    /**传入数组数据返回随机值 */
    protected randomArram(arr) {
        return arr[CCComFun.random(0, arr.length - 1)];
    }

    /**字符串处理 - 去除%% 分割| */
    protected processString(str: string): string[] {
        str = this.replaceSymbols(str);

        let cleanedStr = str.replace(/%%/g, '');
        //   cleanedStr = cleanedStr.replace(/_getname\.Man/g, '小龙').replace(/_getname\.Woman/g, '小美');

        let temp = [];
        let segments = cleanedStr.split(',');
        for (let i = 0; i < segments.length; i++) {
            temp = segments[i].split('|');
            segments[i] = temp.length > 1 ? this.randomArram(temp) : temp[0];
        }

        return segments;
    }


    public replaceSymbols(inputString: string): string {
        Object.values(SymbolExplain).forEach(symbol => {
            if (inputString.includes(symbol)) {
                inputString = inputString.replace(new RegExp(symbol, 'g'), GF_Globals.ins.symbolExplainMap.get(symbol));
            }
        });
        return inputString;
    }

    /**传入一个对象 返回一定数量的随机不重复键对值 */
    public getRandomUniqueKeys(obj: Record<string, any>, count: number): Record<string, any> {
        const keys = Object.keys(obj);

        if (count > keys.length) {
            throw new Error('数量超过了对象的键数');
        }

        const shuffledKeys = keys.sort(() => Math.random() - 0.5);

        const selectedKeys = shuffledKeys.slice(0, count);

        const result: Record<string, any> = {};
        selectedKeys.forEach(key => {
            result[key] = obj[key];
        });

        return result;
    }

    /**根据权重获取随机值 */
    public getRandomValueWithWeight(arr: string[]): string {
        const parsedArr = arr.map(item => {
            const [value, weight] = item.split('^').map(Number);
            return { value, weight };
        });

        const totalWeight = parsedArr.reduce((sum, item) => sum + item.weight, 0);

        const randomNum = Math.random() * totalWeight;

        let accumulatedWeight = 0;
        for (const item of parsedArr) {
            accumulatedWeight += item.weight;
            if (randomNum < accumulatedWeight) {
                return item.value.toString();
            }
        }
        return '';
    }

}


