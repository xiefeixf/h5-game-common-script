import { _decorator, Canvas, Component, find, Node, UI } from 'cc';
import { gui } from '../Scripts/core/gui/GUI';
import { UILayerType } from '../Scripts/core/utilconfg/GF_Constant';
import engine from '../Scripts/core/Engine';
import { ConfigManager } from '../Scripts/core/utilconfg/ConfigManager';
const { ccclass, property } = _decorator;

@ccclass('gameScene')
export class gameScene extends Component {



    protected onLoad(): void {
        engine.init(find("Canvas").getComponent(Canvas));
    }

    protected start(): void {
        gui.home.add(UILayerType.gameUI);
        console.warn(ConfigManager.ins.monster)
        console.warn(ConfigManager.ins.path)

    }
}


