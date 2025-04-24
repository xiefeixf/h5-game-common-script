import { _decorator, Button, EventTouch, find, Node, tween, v3 } from 'cc';
import engine from '../core/Engine';
import { UIBaseView } from '../core/ui/UIBaseView';
const { ccclass, property } = _decorator;

@ccclass('gameUI')
export class gameUI extends UIBaseView {

    door1: Button = null;
    door2: Button = null;
    /**相机节点 */
    cameraNode: Node = null;
    mask: Node = null;
    start() {

    }
    protected onLoad(): void {
        this.cameraNode = find("Canvas/Camera");
        this.mask = this.node.getChildByPath("mask");
        this.mask.active = true;
        this.door1 = this.node.getChildByPath("door1").getComponent(Button);
        this.door2 = this.node.getChildByPath("door2").getComponent(Button);
        this.door1.interactable = false;
        this.door2.interactable = false;
        this.initEvent();
        this.showCamera();
    }

    showCamera() {
        // this.cameraNode.setPosition(0, 2500, 1000);
        let speed = 1;
        tween(this.cameraNode)
            .delay(speed / 2)
            .to(speed / 2, { position: v3(0, 2500, 1000) })
            .delay(speed / 2)
            .to(speed * 1.5, { position: v3(0, 0, 1000) })
            .call(() => {
                this.mask.active = false;
            })
            .start()
    }

    initEvent() {
        engine.event.on("openDoor", this.onOpenDoor, this)
        engine.event.on("mask", this.onMask, this)
    }
    update(deltaTime: number) {

    }

    click_door(event: EventTouch, str: string) {
        let btn: Button = event.target.getComponent(Button);
        btn.interactable = false;
        engine.event.emit("door", str);
    }
    onOpenDoor(indexID: number) {
        switch (indexID) {
            case 8: this.door1.interactable = true; break;
            case 19: this.door2.interactable = true; break;
            default:
                break;
        }
    }

    onMask(bol: boolean) {
        console.warn(bol);
        this.mask.active = bol;
    }

    protected onDestroy(): void {
        engine.event.clearAll();
    }

}


