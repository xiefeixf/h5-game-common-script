import { Sprite, SpriteFrame, view } from "cc";
import { GF_ResUtil } from "db://assets/Scripts/core/confg/GF_ResUtil";
import engine from "db://assets/Scripts/core/Engine";



export class CCComFun {

    public static CCLog(...str) {
        engine.log.trace(`[adsfunc] : ${str}`);
    }

    public static StatLog(...str) {
        engine.log.trace(`[GameStatistics] : ${str}`);
        //console.log(`[GameStatistics] : ${str}`);
    }


    // 金钱缩进
    public static formatMoneyWithUnit(amount: number): string {
        let unit = '元';
        let formattedAmount = amount;

        if (amount >= 100000000) {
            // 亿以上
            unit = '亿';
            formattedAmount = amount / 100000000;
        } else if (amount >= 10000) {
            // 万以上，但不足亿
            unit = '万';
            formattedAmount = amount / 10000;
        }

        // 保留两位小数
        const result = formattedAmount.toFixed(2);

        return `${result}${unit}`;
    }

    // 金钱缩进
    public static formatMoneyWithUnit1(amount: number): string {
        let unit = '';
        let formattedAmount = amount;

        if (amount >= 100000000) {
            // 亿以上
            unit = '亿';
            formattedAmount = amount / 100000000;
        } else if (amount >= 10000) {
            // 万以上，但不足亿
            unit = '万';
            formattedAmount = amount / 10000;
        }

        // 保留两位小数
        const result = formattedAmount.toFixed(0);

        return `${result}${unit}`;
    }

    /**收益转换 */
    public static disPlayProfit(value: number) {
        if (value == 0) {
            return '';
        }

        if (value > 0) {
            return `<b><color=#1eb722>+${value}/s</color><b>`;
        } else {
            return `<b><color=#65656>-${value}/s</color><b>`;
        }
    }

    /**设置头像 */
    public static setHead(headId: number, spr: Sprite) {
        engine.resMar.loadRes(GF_ResUtil.getTexturebyPath(`UIModular/CreateFamily/head/${headId}`), SpriteFrame, (res) => {
            spr.spriteFrame = res;
        })
    }

    /**
    * 产生随机整数，包含下限值，包括上限值
    * @param {Number} lower 下限
    * @param {Number} upper 上限
    * @return {Number} 返回在下限到上限之间的一个随机整数
    */
    public static random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower + 1)) + lower;
    }

    /**随机打乱 */
    public static shuffle<T>(array: T[]): T[] {
        const shuffledArray = [...array];

        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
        }

        return shuffledArray;
    }

    /**分辨率缩小比例返回 */
    public static getScaleRatio(): number {
        const frameSize = view.getVisibleSize();
        const Resolution = view.getDesignResolutionSize();
        const scaleX = frameSize.width / Resolution.width;
        const scaleY = frameSize.height / Resolution.height;
        const scaleRatio = Math.min(scaleX, scaleY);
        return scaleRatio;
    }

    /**属性组合处理 */
    public static combineAttributes(data: { [key: string]: number[] }): { [key: string]: number }[] {
        const keys = Object.keys(data);
        const length = data[keys[0]].length;

        const result = [];

        for (let i = 0; i < length; i++) {
            const obj: { [key: string]: number } = {};
            for (const key of keys) {
                const value = data[key][i];
                if (value !== 0) {
                    obj[key] = value;
                }
            }
            result.push(obj);
        }

        return result;
    }

}

