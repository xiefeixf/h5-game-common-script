import { _decorator, Node, tween, UIOpacity } from 'cc';
import { item_type } from './HeroUI';
import { BasicEnemyUI } from './BasicEnemyUI';
const { ccclass } = _decorator;

@ccclass('bossUI')
export class bossUI extends BasicEnemyUI {
    Basic_type: item_type = item_type.box;

    localInit(): void {
        let light = this.node.getChildByPath("light");
        this.showLight(light);
    }

    showLight(light: Node) {
        let speed = 1;
        tween(light)
            .by(speed, { angle: 90 })
            .repeatForever()
            .start()
        tween(light.getComponent(UIOpacity))
            .to(speed, { opacity: 0 })
            .to(speed, { opacity: 255 })
            .union()
            .repeatForever()
            .start()
    }

}


