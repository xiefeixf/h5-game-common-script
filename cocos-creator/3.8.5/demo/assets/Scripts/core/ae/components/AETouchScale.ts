import { Button, CCFloat, Component, Node, Tween, Vec3, _decorator, tween, v3 } from "cc";

const { ccclass, property, menu } = _decorator;

@ccclass
@menu('AE/AETouchScale')
export default class AETouchScale extends Component {
    @property(CCFloat)
    public duration: number = 0.1;
    @property(CCFloat)
    public scale: number = 1.2;

    private originScale: Vec3 = null;
    private _transitionFinished = false;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart() {
        let button = this.getComponent(Button);
        if (button && !button.interactable) {
            return;
        }
        if (this.originScale === null) {
            this.originScale = this.node.getScale();
        }
        this._transitionFinished = false;
        Tween.stopAllByTarget(this.node);
        let target = v3(this.originScale).multiplyScalar(this.scale);
        tween(this.node)
            .to(this.duration, { scale: target })
            .start();
    }

    onTouchEnd() {
        let button = this.getComponent(Button);
        if (this._transitionFinished || (button && !button.interactable)) {
            return;
        }
        this._transitionFinished = true;
        Tween.stopAllByTarget(this.node);
        tween(this.node)
            .to(this.duration, { scale: this.originScale })
            .start();
    }
}