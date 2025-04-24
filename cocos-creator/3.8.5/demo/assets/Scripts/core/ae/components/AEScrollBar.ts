import { EventTouch, Node, ScrollBar, ScrollView, Sprite, UITransform, _decorator, v3 } from "cc";

/*
 * @Description: 给ScrollBar加上滑动的功能 
 */
const { ccclass, menu } = _decorator;

let v3_temp1 = v3();
let v3_temp2 = v3();

@ccclass
@menu('AE/AEScrollBar')
export default class AEScrollBar extends ScrollBar {
    onLoad() {
        super.onLoad && super.onLoad();
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    private onTouchMove(event: EventTouch) {
        if (this.node.getComponent(Sprite).color.a === 0) { return; }
        let location = event.getUILocation();
        v3_temp1.set(location.x, location.y, 0);
        let nodePos = this.handle.node.parent.getComponent(UITransform).convertToNodeSpaceAR(v3_temp1, v3_temp2);
        let maxHeight = this.node.getComponent(UITransform).height;
        let barHeight = this.handle.node.getComponent(UITransform).height;
        let total = maxHeight - barHeight;
        let progress = (total / 2 - nodePos.y) / total;
        let scrollView: ScrollView = this['_scrollView'];
        scrollView.scrollToPercentVertical(1 - progress, 0);
    }
}