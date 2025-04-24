
import Singleton from "../util/Singleton";

/**
 * @author : zhangxiaoqiang
 * @description : 全局变量脚本
 */

export class GF_Globals extends Singleton<GF_Globals>() {

    /**符号解释 */
    public symbolExplainMap: Map<string, string> = new Map<string, string>();


}


