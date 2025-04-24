/*
 * @Description: 所有动效需要的参数 
 */
import * as cc from 'cc';

/** 所有动效参数的必要参数 */
interface IAEParamBase {
    /** 动效总时间 */
    duration?: number;
    /** 动效完成回调 */
    callback?: () => void;
}

/** toast出现参数 */
export interface IAEParamToastIn extends IAEParamBase {
    /** toast节点 */
    node: cc.Node,
    /** 位移距离 */
    offsetY?: number,
}

/** toast消失参数 */
export interface IAEParamToastOut extends IAEParamBase {
    /** toast节点 */
    node: cc.Node
    /** 位移距离 */
    offsetY?: number,
}

/** 弹窗出现参数 */
export interface IAEParamPopupIn extends IAEParamBase {
    /** 弹窗节点 */
    node: cc.Node
}

/** 弹窗消失参数 */
export interface IAEParamPopupOut extends IAEParamBase {
    /** 弹窗节点 */
    node: cc.Node
}

/** 进度动画参数 */
export interface IAEParamProgressChange extends IAEParamBase {
    /** 进度条组件 */
    progressBar: cc.ProgressBar,
    /** 类型,to,变化到xxx;by,变化xxx */
    type: 'to' | 'by',
    /** 变化量 */
    value: number,
}

/** 物品移动参数 */
export interface IAEParamItemsMove extends IAEParamBase {
    /** 要移动的节点模板 */
    itemsTemplate: cc.Node,
    /** item的父节点 */
    itemsParent: cc.Node,
    /** item散开的时间，单位秒 */
    t1: number,
    /** item飞到目标点的时间，单位秒 */
    t2: number,
    /** 起始点或者坐标 */
    startP: cc.Node | cc.Vec3,
    /** 终止点或者坐标 */
    endP: cc.Node | cc.Vec3,
    /** 生成物品的数量 */
    count: number;
    /** 散开圆的半径 */
    r: number;
}

/** 节点强调产参数*/
export interface IAEParamNodeEmphasize extends IAEParamBase {
    /** 要强调的节点 */
    node: cc.Node,
    /** 是否循环 */
    loop: boolean,
    /** scale初始值 */
    scaleFrom?: number,
    /** scale放大后 */
    scaleTo?: number,
}