import { _decorator } from 'cc';
// import { GiftConfig } from './GiftConfig';
import { GameConfig, PopEventLayerType } from 'db://assets/Scripts/core/confg/GF_Constant';
import engine from 'db://assets/Scripts/core/Engine';
import Singleton from 'db://assets/Scripts/core/util/Singleton';

const { ccclass, property } = _decorator;

@ccclass('ConfigManager')
export class ConfigManager extends Singleton<ConfigManager>() {

    // /**天赋配置 */
    // public gift: GiftConfig = null;

    /**配置初始化 */
    public initConig() {
        // this.gift = this.createConfig(GiftConfig, GameConfig.Gift);
    }

    /**创建配置 */
    private createConfig<T>(ConfigClass: new (data: any) => T, configKey: string): T {
        return new ConfigClass(engine.dataMar.configMap.get(configKey));
    }
}


