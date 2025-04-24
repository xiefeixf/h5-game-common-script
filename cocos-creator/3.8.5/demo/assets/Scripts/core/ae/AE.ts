import AEFunc from "./core/AEFunc";
import { IAEParamItemsMove, IAEParamNodeEmphasize, IAEParamPopupIn, IAEParamPopupOut, IAEParamProgressChange, IAEParamToastIn, IAEParamToastOut } from "./core/AEParam";

const enum EYZGeneralEffectTypeEnum {
    /** toast出现动效 */
    ToastIn = 1,
    /** toast消失动效 */
    ToastOut = 3,
    /** 弹窗出现动效 */
    PopupIn = 5,
    /** 弹窗消失动效 */
    PopupOut,
    /** 进度条变化 */
    ProgressChange = 13,
    /** 物品获取后飞行动效 */
    ItemsMove = 19,
    /** 节点强调动效 */
    NodeEmphasize,
}

interface IAEParamStruct {
    ToastIn: IAEParamToastIn
    ToastOut: IAEParamToastOut,
    PopupIn: IAEParamPopupIn,
    PopupOut: IAEParamPopupOut,
    ProgressChange: IAEParamProgressChange,
    ItemsMove: IAEParamItemsMove,
    NodeEmphasize: IAEParamNodeEmphasize
}

export class AE {
    /** 播放通用特效 */
    static playGeneralEffect<T extends string & keyof IAEParamStruct>(effectType: T, param: IAEParamStruct[T]): void {
        let funcName = `play${effectType}Effect`;
        let func = AEFunc[funcName];

        if (!func) {
            return console.error('AE Not found', effectType);
        }
        func(param);
    }
}
