import { _decorator, Camera, Component, find, Label, Node, sp, tween, v3, Vec3 } from 'cc';
import { BasicEnemyUI } from './BasicEnemyUI';
import engine from '../core/Engine';
import { UIBaseView } from '../core/ui/UIBaseView';
import { gui } from '../core/gui/GUI';
import { UILayerType } from '../core/confg/GF_Constant';
const { ccclass, property } = _decorator;

export const enum item_type {
    /**怪物 */
    monster = "monster",
    /**宝箱 */
    box = "box",
    /**钥匙 */
    key = "key",
    /**英雄 */
    hero = "hero",
}

@ccclass('HeroUI')
export class HeroUI extends UIBaseView {

    @property
    public HP: number = 0;

    @property
    public indexID: number = 0;

    @property(sp.Skeleton)
    public heroSke: sp.Skeleton = null;

    historyPos: Vec3 = v3(0, 0, 0);
    /**相机节点 */
    cameraNode: Node = null;
    /**相机缓动 */
    istween: boolean = false;

    start() {

    }

    onLoad(): void {
        this.historyPos = this.node.getPosition();
        this.cameraNode = find("Canvas/Camera");
        this.upHP_Label();
        this.initEvent();
    }

    initEvent() {
        engine.event.on("atk", this.eventCb, this)
        engine.event.on("door", this.onDoor, this)
    }

    upHP_Label() {
        this.node.getChildByPath("bg/HP").getComponent(Label).string = `${this.HP}`;
    }

    eventCb(data: BasicEnemyUI) {
        engine.event.emit("mask", true);
        if (!data) { engine.event.emit("mask", false); return }
        let path = findPath(posid, this.indexID, data.indexID);
        if (!path) { engine.event.emit("mask", false); return }
        path.reverse();
        path.pop();
        if (path.length > 0) {
            this.plotMove(path);
        }
    }

    plotMove(inarr: number[]) {
        if (inarr.length <= 0) {
            engine.event.emit("mask", false);
            return
        };
        let plot = this.node.parent.getChildByName(`plot${inarr[inarr.length - 1]}`).getComponent(BasicEnemyUI);
        inarr.pop();
        let pos = plot.node.position;
        if (!plot.IsDeath) {
            pos.add(v3(-50, 0, 0));
        }
        if (plot.Basic_type == item_type.box) {
            this.showSp(pos, () => {
                if (!plot.IsDeath) {
                    this.heroSke.node.setScale(0.4, 0.4, 1);
                    plot.playATK();
                    this.heroSke.setAnimation(0, "attack", false);
                    this.heroSke.setCompleteListener(() => {
                        this.heroSke.setAnimation(0, "idle", true);
                        this.indexID = plot.indexID;
                        if (!plot.IsDeath) {
                            plot.node.active = false;
                            plot.IsDeath = true;
                            this.HP += plot.HP;
                            this.upHP_Label();
                        }
                        this.heroSke.setCompleteListener(null);
                        this.plotMove(inarr);
                    })
                } else {
                    this.plotMove(inarr);
                }
            })

        } else if (plot.Basic_type == item_type.monster) {
            this.showSp(pos, () => {
                if (!plot.IsDeath) {
                    this.heroSke.node.setScale(0.4, 0.4, 1);
                    plot.playATK();
                    this.heroSke.setAnimation(0, "attack", false);
                    this.heroSke.setCompleteListener(() => {
                        this.heroSke.setAnimation(0, "idle", true);
                        this.indexID = plot.indexID;
                        if (this.HP > plot.HP) {
                            if (!plot.IsDeath) {
                                plot.node.active = false;
                                plot.IsDeath = true;
                                this.HP += plot.HP;
                                this.upHP_Label();
                                this.plotMove(inarr);
                                this.judge();
                            }
                        } else {
                            //打不过，死亡
                            console.warn("打不过，死亡");
                            // engine.event.emit("prefab", 'loseUI');
                            gui.ui.add(UILayerType.loseUI);
                        }
                        this.heroSke.setCompleteListener(null);
                    })
                } else {
                    this.plotMove(inarr);
                }
            })
        } else if (plot.Basic_type == item_type.key) {
            this.showSp(pos, () => {
                if (!plot.IsDeath) {
                    this.heroSke.node.setScale(0.4, 0.4, 1);
                    plot.playATK();
                    this.heroSke.setAnimation(0, "attack", false);
                    this.heroSke.setCompleteListener(() => {
                        this.heroSke.setAnimation(0, "idle", true);
                        this.indexID = plot.indexID;
                        if (!plot.IsDeath) {
                            plot.node.active = false;
                            plot.IsDeath = true;
                            this.HP += plot.HP;
                            this.upHP_Label();
                        }
                        this.heroSke.setCompleteListener(null);
                        this.plotMove(inarr);
                    })
                } else {
                    this.plotMove(inarr);
                }
            })
        }
    }

    showSp(pos: Vec3, cb: Function) {
        this.heroSke.setAnimation(0, "run", true);
        let speed = 0.5;
        if (this.node.position.x > pos.x) {
            this.heroSke.node.setScale(-0.4, 0.4, 1);
        } else {
            this.heroSke.node.setScale(0.4, 0.4, 1);
        }
        tween(this.node)
            .to(speed, { position: pos })
            .call(() => {
                cb && cb();
            })
            .start();
    }

    judge() {
        switch (this.indexID) {
            case 7: this.node.parent.getChildByName(`plot8`).getComponent(BasicEnemyUI).IsClick = true; break;
            case 18: this.node.parent.getChildByName(`plot19`).getComponent(BasicEnemyUI).IsClick = true; break;
            default:
                break;
        }
    }


    onDoor(str: string) {
        switch (str) {
            case "1":
                let plotPos = this.node.parent.getChildByName(`plot9`).position;
                this.node.setPosition(plotPos);
                this.indexID = 9;
                break;
            case "2":
                gui.ui.add(UILayerType.winUI);
                console.warn("通关");
                break;
            default:
                break;
        }
    }


    update(dt: number) {
        if (this.istween) { return }
        let yyy = v3(this.node.getPosition()).subtract(v3(this.historyPos)).y;
        let xxx = v3(this.node.getPosition()).subtract(v3(this.historyPos)).x;
        let high = this.node.getPosition().y - this.cameraNode.getPosition().y;
        if (high > 640) {
            this.istween = true;
            let speed = 1;
            tween(this.cameraNode)
                .to(speed, { position: v3(this.cameraNode.getPosition().x, yyy, 1000) })
                .call(() => {
                    this.istween = false;
                })
                .start()
            // this.cameraNode.setPosition(v3(this.cameraNode.getPosition().x, yyy, 1000));
        }
        if (Math.abs(xxx) != 0 && Math.abs(xxx) < 155) {
            this.cameraNode.setPosition(v3(xxx, this.cameraNode.getPosition().y, 1000));
        }
    }

    protected onDestroy(): void {
        engine.event.clearAll();
    }




}

type PosId = {
    id: number;
    up: number | number[]; // 可以前进的地块（单个或多个）
    down: number;          // 可以后退的地块（0 表示不能后退）
};

// 测试用例
const posid: PosId[] = [
    { id: 0, up: 1, down: 0 },
    { id: 1, up: 2, down: 0 },
    { id: 2, up: [3, 5], down: 1 },
    { id: 3, up: 4, down: 2 },
    { id: 4, up: 7, down: 3 },
    { id: 5, up: [6, 7], down: 2 },
    { id: 6, up: 0, down: 5 },
    { id: 7, up: 8, down: 0 },
    { id: 8, up: 0, down: 0 },//钥匙

    { id: 9, up: 10, down: 0 },
    { id: 10, up: 11, down: 0 },
    { id: 11, up: [12, 14], down: 0 },
    { id: 12, up: [13, 16], down: 11 },
    { id: 13, up: 16, down: 12 },
    { id: 14, up: [15, 18], down: 11 },
    { id: 15, up: 18, down: 14 },
    { id: 16, up: [17, 18], down: 12 },
    { id: 17, up: 18, down: 16 },
    { id: 18, up: 19, down: 0 },
    { id: 19, up: 0, down: 0 },
];
/**
 * 寻找从起始地块到目标地块的路径
 * @param posid 地块数组
 * @param startId 起始地块ID
 * @param endId 目标地块ID
 * @returns 返回路径数组（如 `[4, 7, 6]`），如果没有路径则返回 `null`
 */
export function findPath(posid: PosId[], startId: number, endId: number): number[] | null {
    const posDict: Record<number, PosId> = {};
    posid.forEach(pos => {
        posDict[pos.id] = pos;
    });

    if (!posDict[startId] || !posDict[endId]) {
        return null;
    }

    const queue: number[][] = [[startId]];
    const visited = new Set<number>([startId]);

    while (queue.length > 0) {
        const currentPath = queue.shift()!;
        const currentId = currentPath[currentPath.length - 1];

        if (currentId === endId) {
            return currentPath;
        }

        const currentPos = posDict[currentId];
        const nextMoves: number[] = [];

        if (Array.isArray(currentPos.up)) {
            nextMoves.push(...currentPos.up.filter(id => id !== 0));
        } else if (currentPos.up !== 0) {
            nextMoves.push(currentPos.up);
        }

        if (currentPos.down !== 0) {
            nextMoves.push(currentPos.down);
        }

        for (const nextId of nextMoves) {
            if (!visited.has(nextId)) {
                visited.add(nextId);
                const newPath = [...currentPath, nextId];
                queue.push(newPath);
            }
        }
    }

    return null;
}






