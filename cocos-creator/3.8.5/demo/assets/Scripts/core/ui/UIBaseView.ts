import { Component, Node, Prefab } from "cc";
import engine from "../Engine";
import { AudioManager } from "../manager/AudioManager";

export class UIBaseView extends Component {

    private curPrefab: Prefab = null;

    protected onLoad(): void {

    }
    public onAdded(data?) { };
    public onRemoved(data?) { };

    protected onClose(data?) { };

    public close(data?) {
        if (!this.node) { engine.log.error(`当前关闭的节点不存在！`); return; };
        this.onClose();
    }

    /**添加button事件 */
    public addButtonEvent(btn: Node, call: Function) {
        btn.off(Node.EventType.TOUCH_END)
        btn.on(Node.EventType.TOUCH_END, () => {
            //AudioManager.ins.playGameSound("点击")
            if (call) call()
        }, this);
    }
}