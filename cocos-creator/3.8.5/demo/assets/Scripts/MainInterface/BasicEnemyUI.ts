import { _decorator, Component, Label, Node, sp } from 'cc';
import { item_type } from './HeroUI';
import { UIBaseView } from '../core/ui/UIBaseView';
import engine from '../core/Engine';
const { ccclass, property } = _decorator;

@ccclass('BasicEnemyUI')
export class BasicEnemyUI extends UIBaseView {

    @property
    public indexID: number = 0;//序号id

    @property
    public HP: number = 0;

    @property(sp.Skeleton)
    public skele: sp.Skeleton = null;
    /**道具类型 */
    Basic_type: item_type = null;
    /**是否死亡 */
    IsDeath: boolean = false;
    /**能否点击 */
    IsClick: boolean = true;

    start() {

    }

    onLoad(): void {
        this.IsDeath = false;
        this.skele.setAnimation(0, "holdon", true);
        this.node.getChildByPath("bg/HP").getComponent(Label).string = `${this.HP}`;
        this.localInit();
    }

    update(deltaTime: number) {

    }

    /**自定义初始 */
    localInit() { }

    click_Btn() {
        if (!this.IsClick) { return }
        engine.event.emit("atk", this)
    }

    playATK() {
        this.skele.setAnimation(0, "win", false);
        this.skele.setCompleteListener(() => {
            this.skele.setCompleteListener(null);
            this.skele.setAnimation(0, "holdon", true);
        })
    }

}


