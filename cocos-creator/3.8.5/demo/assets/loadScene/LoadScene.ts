import { _decorator, Component, director, Node } from 'cc';
import { BundlesName } from '../Scripts/core/confg/GF_Constant';
import engine from '../Scripts/core/Engine';
const { ccclass, property } = _decorator;

@ccclass('LoadScene')
export class LoadScene extends Component {

    private index: number = 0;

    protected onLoad(): void {
        engine.cc_debug = true;
        this.loadBundle();
    }

    private loadBundle() {
        for (let i = 0; i < BundlesName.length; i++) {
            engine.resMar.loadBundle(BundlesName[i], () => {
                if (BundlesName[i] == "Config") {
                    engine.dataMar.dataInit(() => {
                        this.dataInit();
                        this.next();
                    })
                } else {
                    this.next();
                }
            })
        }

    }

    /**数据初始化 */
    private dataInit() {

        // ConfigManager.ins.initConig();
        if (engine.cc_debug) { return };
    }

    private next() {
        this.index++;
        if (this.index >= BundlesName.length) {
            director.loadScene("main");
        }
    }




}


