/*
 * @Description: 整数滚动组件  
 */
import { Component, Label, Node, Prefab, _decorator, instantiate } from 'cc';
import { DEV } from 'cc/env';
const { ccclass, property, menu } = _decorator;

@ccclass
@menu('AE/AENumberChange')
export default class AENumberChange extends Component {
    @property({
        type: Prefab,
        tooltip: DEV && '每个数字的预制'
    })
    private numPrefab: Prefab = null;
    @property({
        type: Node,
        tooltip: DEV && '存放数字的父节点，推荐加上Layout组件，并且是Right To Left'
    })
    private numParent: Node = null;

    private curNum: number = 0;
    private endNum: number = 0;
    private speed: number = 1;
    private beginning: boolean = false;
    private callback: Function;
    private curFrame: number = 0;
    private remainingTime: number = 0;
    /** 多少帧刷新一次 */
    private updateFrame: number = 2;

    /**
     * 设置要显示的数
     * @param num 数
     */
    public setNum(num: number) {
        let numStr = num.toFixed();
        let children = this.numParent.children;
        let count = Math.max(children.length, numStr.length);
        this.curNum = num;
        for (let i = 0; i < count; i++) {
            let oneNumChar = numStr[numStr.length - 1 - i];
            let node = children[i];

            if (!node) {
                node = instantiate(this.numPrefab);
                this.numParent.addChild(node);
            }

            if (oneNumChar === undefined) {
                node.active = false;
            } else {
                node.active = true;
                node.getComponent(Label).string = oneNumChar;
            }
        }
    }

    /**
     * 播放数滚动到value的动画
     * @param duration 滚动时间
     * @param value 滚动结果
     * @param callback 滚动回调
     * @returns 
     */
    public changeTo(duration: number, value: number, callback?: Function) {
        if (duration === 0 || value == this.curNum) {
            callback && callback();
            return;
        }
        this.beginning = true;
        this.speed = (value - this.curNum) / duration;
        this.callback = callback;
        this.endNum = value;
        this.curFrame = 0;
        this.remainingTime = duration;
    }

    /**
     * 停止动画
     */
    public stopChange() {
        this.beginning = false;
    }

    protected update(dt: number): void {
        if (this.beginning) {
            this.curNum = Math.floor(this.curNum + dt * this.speed);
            this.remainingTime -= dt;
            this.curFrame++;
            if (this.curFrame < this.updateFrame) { return; }
            this.curFrame = 0;
            if (this.remainingTime <= 0) {
                this.remainingTime = 0;
                this.curNum = this.endNum;
                this.beginning = false;
                this.callback && this.callback();
                this.callback = null;
            }
            this.setNum(this.curNum);
        }
    }
}