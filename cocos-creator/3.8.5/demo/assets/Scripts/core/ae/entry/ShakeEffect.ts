import { _decorator, Component, Node, Tween, tween, v2, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;


/** 震动效果  */
@ccclass('ScreenShake')
export class ShakeEffect extends Component {

    /**
     * 震动节点
     * @param targetNode 目标节点
     * @param duration 震动时间
     * @param cb 震动结束回调
     * @param once 多节点是否只回调一次
     */
    static shakeNodes(targetNode: Node | Node[], duration: number, cb?: Function, once: boolean = true) {
        if (targetNode instanceof Array) {

            if (once) {
                let tweens: Promise<void>[] = [];
                for (let i = 0; i < targetNode.length; i++) {
                    let tween = this.onceNodeShake(targetNode[i], duration, cb, once);
                    tweens.push(tween);
                }
                Promise.all(tweens).then(() => cb && cb());
            } else {
                // 注：这里每个节点震动后都会回调一次
                targetNode.forEach(node => this.onceNodeShake(node, duration, cb, once));
            }
        } else {
            this.onceNodeShake(targetNode, duration, cb, once);
        }
    }

    /** 单个节点震动 */
    static onceNodeShake(targetNode: Node, duration: number, cb: Function, once: boolean) {
        // 获取目标节点的初始位置
        const nodeStartPos = targetNode.getPosition();
        // 单次震动的时间
        const onceDuration = 0.02;
        // 最大值和最小值之间的坐标
        const maxNum = 5;
        const minNum = -5;
        // 停止目标动画
        Tween.stopAllByTarget(targetNode);
        // 每次震动频率随机位置
        let randomX: number[] = [];
        let randomY: number[] = [];
        // 基于初始位置，随机生成8个坐标
        for (let i = 0; i < 8; i++) {
            let random1 = Math.round(Math.random() * (minNum - maxNum)) + maxNum;
            randomX.push(random1 + nodeStartPos.x);
            let random2 = Math.round(Math.random() * (minNum - maxNum)) + maxNum;
            randomY.push(random2 + nodeStartPos.y);
        }
        // 播放动画
        tween(targetNode)
            .sequence(
                tween().to(onceDuration, { position: v3(randomX[0], randomY[0], 0) }),
                tween().to(onceDuration, { position: v3(randomX[1], randomY[1], 0) }),
                tween().to(onceDuration, { position: v3(randomX[2], randomY[2], 0) }),
                tween().to(onceDuration, { position: v3(randomX[3], randomY[3], 0) }),
                tween().to(onceDuration, { position: v3(randomX[4], randomY[4], 0) }),
                tween().to(onceDuration, { position: v3(randomX[5], randomY[5], 0) }),
                tween().to(onceDuration, { position: v3(randomX[6], randomY[6], 0) }),
                tween().to(onceDuration, { position: v3(randomX[7], randomY[7], 0) }),
            )
            .repeatForever()
            .start();

        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                Tween.stopAllByTarget(targetNode);
                targetNode.setPosition(nodeStartPos.x, nodeStartPos.y);
                if (!once) {
                    cb && cb();
                } else {
                    resolve();
                }
            }, duration * 1000)
        })

    }
}

