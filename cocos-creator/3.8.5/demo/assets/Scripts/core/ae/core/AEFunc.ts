/*
 * @Description: 每一种特效的具体实现
 */
import * as cc from 'cc';
import { IAEParamItemsMove, IAEParamNodeEmphasize, IAEParamPopupIn, IAEParamPopupOut, IAEParamProgressChange, IAEParamToastIn } from './AEParam';

// 缓动
// easing.quadOutIn = _makeOutIn(easing.quadIn, easing.quadOut);
// easing.cubicOutIn = _makeOutIn(easing.cubicIn, easing.cubicOut);
// easing.quartOutIn = _makeOutIn(easing.quartIn, easing.quartOut);
// easing.quintOutIn = _makeOutIn(easing.quintIn, easing.quintOut);
// easing.sineOutIn = _makeOutIn(easing.sineIn, easing.sineOut);
// easing.expoOutIn = _makeOutIn(easing.expoIn, easing.expoOut);
// easing.circOutIn = _makeOutIn(easing.circIn, easing.circOut);
// easing.backOutIn = _makeOutIn(easing.backIn, easing.backOut);
// easing.bounceIn = function (k) { return 1 - easing.bounceOut(1 - k); };
// easing.bounceInOut = function (k) {
//     if (k < 0.5) {
//         return easing.bounceIn(k * 2) * 0.5;
//     }
//     return easing.bounceOut(k * 2 - 1) * 0.5 + 0.5;
// };
// easing.bounceOutIn = _makeOutIn(easing.bounceIn, easing.bounceOut);

/** toast动效默认时间 */
let DEFAULT_TOAST_DURATION = 0.3;
/** popup动效默认时间 */
let DEFAULT_POPUP_DURATION = 0.4;
/** progress动效默认时间 */
let DEFAULT_PROGRESS_DURATION = 0.3;
/** 节点强调动效默认时间 */
let DEFAULT_NODE_EMPHASIZE_DURATION = 1.32;


const v3_temp = cc.v3();

/**
 * 以某点为圆心，生成圆周上等分点的坐标
 *
 * @param {number} r 半径
 * @param {Vec2} pos 圆心坐标
 * @param {number} count 等分点数量
 * @param {number} [randomScope=60] 等分点的随机波动范围
 * @returns {Vec2[]} 返回等分点坐标
 */
let getCirclePoints = function (r: number, pos: cc.Vec3, count: number, randomScope: number, func: (x: number, y: number) => any): Array<any> {
    let points = [];
    let radians = cc.macro.RAD * Math.round(360 / count);
    for (let i = 0; i < count; i++) {
        let x = pos.x + r * Math.sin(radians * i);
        let y = pos.y + r * Math.cos(radians * i);
        points.push(func(x + Math.random() * randomScope, y + Math.random() * randomScope));
        // points.unshift(cc.v2(x + Math.random() * randomScope, y + Math.random() * randomScope));
    }
    return points;
};

let AEFunc = {
    /** 播放toast出现的动效*/
    playToastInEffect(param: IAEParamToastIn) {
        let node = param.node;
        let duration = param.duration || DEFAULT_TOAST_DURATION;

        let uiOPacity = node.getComponent(cc.UIOpacity);
        if (!uiOPacity) { uiOPacity = node.addComponent(cc.UIOpacity); }
        uiOPacity.opacity = 0;
        if (node['&yzToastSourceY'] === undefined) { node['&yzToastSourceY'] = node.position.y; }
        if (param.offsetY) {
            // node.y = node['&yzToastSourceY'] + param.offsetY;
            node.setPosition(node.position.x, node['&yzToastSourceY'] + param.offsetY);
        }
        cc.Tween.stopAllByTarget(node);
        let endPos = cc.v3(node.position.x, node['&yzToastSourceY']);
        cc.tween(node)
            .to(duration, { position: endPos })
            .call(() => {
                param.callback && param.callback();
            })
            .start();
        cc.tween(uiOPacity)
            .to(duration, { opacity: 255 })
            .start();
    },
    /** 播放toast消失的动效 */
    playToastOutEffect(param: IAEParamToastIn) {
        let node = param.node;
        let duration = param.duration || DEFAULT_POPUP_DURATION;
        let nodeY = node.position.y;
        let endY = node.position.y;

        if (node['&yzToastSourceY'] === undefined) { node['&yzToastSourceY'] = nodeY; }
        if (param.offsetY) {
            endY = (node['&yzToastSourceY'] === undefined ? nodeY : node['&yzToastSourceY']) + param.offsetY;
        }
        cc.Tween.stopAllByTarget(node);
        let endPos = cc.v3(node.position.x, endY);
        let uiOPacity = node.getComponent(cc.UIOpacity);
        if (!uiOPacity) { uiOPacity = node.addComponent(cc.UIOpacity); }
        cc.tween(node)
            .to(duration, { position: endPos })
            .call(() => {
                param.callback && param.callback();
            })
            .start();
        cc.tween(uiOPacity)
            .to(duration, { opacity: 0 })
            .start();
    },
    /** 播放弹窗出现的动效 */
    playPopupInEffect(param: IAEParamPopupIn) {
        let node = param.node;
        let duration = param.duration || DEFAULT_POPUP_DURATION;
        node.setScale(0.5, 0.5, 1);
        let uiOpacity = node.getComponent(cc.UIOpacity);
        if (!uiOpacity) { uiOpacity = node.addComponent(cc.UIOpacity); }
        uiOpacity.opacity = 0;
        cc.Tween.stopAllByTarget(node);
        cc.tween(node)
            .to(duration / 2, { scale: cc.v3(1.1, 1.1, 1) }).to(duration / 2, { scale: cc.v3(1, 1, 1) })
            .start();
        cc.tween(uiOpacity)
            .to(duration, { opacity: 255 })
            .call(() => {
                param.callback && param.callback();
            }).start();
    },

    /** 播放弹窗消失的动效 */
    playPopupOutEffect(param: IAEParamPopupOut) {
        let node = param.node;
        let duration = param.duration || DEFAULT_TOAST_DURATION;
        cc.Tween.stopAllByTarget(node);
        let uiOpacity = node.getComponent(cc.UIOpacity);
        if (!uiOpacity) { uiOpacity = node.addComponent(cc.UIOpacity); }
        cc.tween(node)
            .to(duration / 2, { scale: cc.v3(1.1, 1.1, 1.1) }).to(duration / 2, { scale: cc.v3(0, 0, 0) })
            .start();
        cc.tween(uiOpacity)
            .to(duration, { opacity: 0 })
            .call(() => {
                param.callback && param.callback();
            }).start();
    },


    /** 播放进度变化的动效 */
    playProgressChangeEffect(param: IAEParamProgressChange) {
        let progressBar = param.progressBar;
        let end = param.type === 'to' ? param.value : (progressBar.progress + param.value);
        let duration = param.duration || DEFAULT_PROGRESS_DURATION;

        cc.Tween.stopAllByTarget(progressBar);
        cc.tween(progressBar)
            .to(duration, { progress: end })
            .call(() => {
                param.callback && param.callback();
            })
            .start();
    },


    /** 播放领取物品后，物品移动的动效 */
    playItemsMoveEffect(param: IAEParamItemsMove) {
        let startPos: cc.Vec3, endPos: cc.Vec3;
        let startP = param.startP;
        let endP = param.endP;
        let itemsParent = param.itemsParent;
        let count = param.count;
        let breakIdx = 0;

        if (startP instanceof cc.Vec3) {
            startPos = startP;
        } else {

            let worldPos = startP.getComponent(cc.UITransform).convertToWorldSpaceAR(v3_temp.set(0, 0, 0));
            startPos = itemsParent.getComponent(cc.UITransform).convertToNodeSpaceAR(worldPos);
        }
        if (endP instanceof cc.Vec3) {
            endPos = endP;
        } else {
            let worldPos = endP.getComponent(cc.UITransform).convertToWorldSpaceAR(v3_temp.set(0, 0, 0));
            endPos = itemsParent.getComponent(cc.UITransform).convertToNodeSpaceAR(worldPos);
        }
        // 计算散开后的坐标
        let itemsInfo = getCirclePoints(param.r, startPos, count, 60, (x, y) => {
            let item = cc.instantiate(param.itemsTemplate) as cc.Node;

            item.active = true;
            item.setPosition(startPos);
            param.itemsParent.addChild(item);
            let pos = cc.v3(x, y);
            return {
                item: item,
                mdPos: pos,
                dis: cc.Vec3.squaredDistance(pos, endPos)
            };
        });
        itemsInfo.sort((a, b) => {
            if (a.dis - b.dis > 0) { return 1; }
            if (a.dis - b.dis < 0) { return -1; }
            return 0;
        });

        for (let i = 0; i < itemsInfo.length; i++) {
            let info = itemsInfo[i];

            cc.tween(info.item)
                .to(param.t1, { position: info.mdPos })
                .delay(i * 0.01)
                .to(param.t2, { position: endPos })
                .call(() => {
                    breakIdx++;
                    info.item.destroy();
                    if (breakIdx === count) {
                        param.callback && param.callback();
                    }
                })
                .start();
        }
    },



    /** 播放按钮强调的特效 */
    playNodeEmphasizeEffect(param: IAEParamNodeEmphasize) {
        let duration = param.duration || DEFAULT_NODE_EMPHASIZE_DURATION;
        let scaleTo = param.scaleTo === undefined ? cc.v3(1.15, 1.15, 1) : cc.v3(param.scaleTo, param.scaleTo, 1);
        let scaleFrom = param.scaleFrom === undefined ? cc.v3(1, 1, 1) : cc.v3(param.scaleFrom, param.scaleFrom, 1);

        cc.Tween.stopAllByTarget(param.node);
        if (param.loop) {
            cc.tween(param.node)
                .then(cc.tween(param.node).to(duration / 2, { scale: scaleTo }).to(duration / 2, { scale: scaleFrom }))
                .repeatForever()
                .start();
        } else {
            cc.tween(param.node)
                .to(duration / 2, { scale: scaleTo })
                .to(duration / 2, { scale: scaleFrom })
                .start();
        }
    }
};

export default AEFunc;