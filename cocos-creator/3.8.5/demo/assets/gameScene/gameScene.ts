import { _decorator, Canvas, Component, find, Node, UI } from 'cc';
import { gui } from '../Scripts/core/gui/GUI';
import { UILayerType } from '../Scripts/core/confg/GF_Constant';
import engine from '../Scripts/core/Engine';
const { ccclass, property } = _decorator;

@ccclass('gameScene')
export class gameScene extends Component {



    protected onLoad(): void {
        engine.init(find("Canvas").getComponent(Canvas));
        this.initMgrData()
    }

    protected start(): void {

        gui.home.add(UILayerType.gameUI);

    }

    //初始化mgr数据
    initMgrData() {
        // AncestralManager.ins.init()
    }

}


