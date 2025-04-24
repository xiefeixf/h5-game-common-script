import { _decorator } from 'cc';
import engine from 'db://assets/Scripts/core/Engine';
import Singleton from 'db://assets/Scripts/core/util/Singleton';
import { PathConfig } from '../../Config/PathConfig';
import { MonsterConfig } from '../../Config/MonsterConfig';
import { GameConfig } from './GF_Constant';

const { ccclass, property } = _decorator;

@ccclass('ConfigManager')
export class ConfigManager extends Singleton<ConfigManager>() {

    /**天赋配置 */
    public path: PathConfig = null;
    /**天赋配置 */
    public monster: MonsterConfig = null;
    /**配置初始化 */
    public initConig() {
        this.path = this.createConfig(PathConfig, GameConfig.Path);
        this.monster = this.createConfig(MonsterConfig, GameConfig.Monster);
    }

    /**创建配置 */
    private createConfig<T>(ConfigClass: new (data: any) => T, configKey: string): T {
        return new ConfigClass(engine.dataMar.configMap.get(configKey));
    }
}


