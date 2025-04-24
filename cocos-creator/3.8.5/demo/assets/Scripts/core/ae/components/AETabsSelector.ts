/*
 * @Description: tab滑动组件
 */
import { CCFloat, Component, EventHandler, EventTouch, Node, Tween, UITransform, _decorator, tween, v3 } from 'cc';
import { DEV } from 'cc/env';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu('AE/AETabsSelector')
export default class AETabsSelector extends Component {
    /** 组件使用的事件 */
    static EventType = {
        /** 开始移动 */
        MOVE_START: 'YZARTabsSelector_MoveStart',
        /** 移动结束 */
        MOVE_END: 'YZARTabsSelector_MoveEnd'
    };
    /** tabs的父节点 */
    @property({
        type: Node,
        tooltip: 'tabs的父节点'
    })
    private tabsParent: Node = null;
    @property({
        type: Node,
        tooltip: DEV && '滑块'
    })
    private slider: Node = null;
    @property({
        type: CCFloat,
        tooltip: DEV && '滑动时间'
    })
    public duration: number = 0.2;
    @property({
        type: [EventHandler],
        tooltip: DEV && '滑动开始绑定的方法'
    })
    public startHandlers: EventHandler[] = [];
    @property({
        type: [EventHandler],
        tooltip: DEV && '滑动结束绑定的方法'
    })
    public endHandlers: EventHandler[] = [];

    onLoad() {
        this.tabsParent.children.forEach((child) => {
            child.on(Node.EventType.TOUCH_END, this.onTouchTab, this);
        });
    }

    /**
     * 将滑块滑到指定位置
     * @param idx tab位置
     * @param duration 动效时间
     */
    public moveTabToIndex(idx: number, duration: number = this.duration, dispatchEvent = true) {
        this.moveSliderTo(this.tabsParent.children[idx], duration, dispatchEvent);
    }

    private onTouchTab(event: EventTouch) {
        this.moveSliderTo(event.target, this.duration);
    }

    private moveSliderTo(tab: Node, duration?: number, dispatchEvent = true) {
        if (!tab) {
            console.warn('[AETabsSelector] index out of bound');
            return;
        }

        let endPos = tab.getComponent(UITransform).convertToWorldSpaceAR(v3());
        endPos = this.slider.parent.getComponent(UITransform).convertToNodeSpaceAR(endPos);
        // 点了同一个tab
        if (endPos.equals(this.slider.position)) { return; }
        let index = this.getTabIndex(tab);
        let moveStartCallback = () => {
            if (!dispatchEvent) { return; }
            this.sendEvent(AETabsSelector.EventType.MOVE_START, index);
            this.startHandlers.forEach(handler => {
                handler.target && handler.handler && handler.emit([index, handler.customEventData]);
            });
        };
        let moveEndCallback = () => {
            if (!dispatchEvent) { return; }
            this.sendEvent(AETabsSelector.EventType.MOVE_END, index);
            this.endHandlers.forEach(handler => {
                handler.target && handler.handler && handler.emit([index, handler.customEventData]);
            });
        };

        moveStartCallback();
        endPos.z = 0;
        Tween.stopAllByTarget(this.slider);
        if (duration > 0) {
            tween(this.slider)
                .to(duration, { position: endPos }, { easing: 'quintOut' })
                .call(moveEndCallback)
                .start();
        } else {
            this.slider.setPosition(endPos);
            moveEndCallback();
        }
    }

    private sendEvent(eventName: string, args1: any) {
        this.node.emit(eventName, args1);
    }

    private getTabIndex(tab: Node) {
        let tabs = this.tabsParent.children;

        for (let i = 0; i < tabs.length; i++) {
            if (tabs[i].uuid === tab.uuid) { return i; }
        }

        return -1;
    }
}