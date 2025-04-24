import { _decorator, Component, JsonAsset, Node } from 'cc';
import Singleton from '../util/Singleton';
import engine from '../Engine';
import { GameConfig } from '../confg/GF_Constant';
const { ccclass, property } = _decorator;

@ccclass('DataManager')
export class DataManager extends Singleton<DataManager>() {

    /**配置 */
    public configMap: Map<string, JsonAsset> = new Map<string, JsonAsset>();

    /**数据初始化 */
    public dataInit(succ: Function) {
        let arr = Object.values(GameConfig);
        for (let i = 0; i < arr.length; i++) {
            engine.resMar.loadRes(`Config/${arr[i]}`, JsonAsset, (res) => {
                this.configMap.set(arr[i], res.json);
                if (this.configMap.size == arr.length) {
                    succ && succ();
                }
            })
        }
    }




}


