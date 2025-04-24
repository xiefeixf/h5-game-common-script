import * as cc from "cc";
import { HashMap } from "../util/HashMap";
import { ViewHashMap } from "./ViewHashMap";

export interface ICdnUrlParam { url: string, assetsPath: string, version?: string, viewSize?: cc.Vec2 };
export interface ICdnSpriteResult {
    size: cc.Vec2,
    spf: cc.SpriteFrame
}

export class ViewUtils {

    /** 将整数转化为字符串 */
    public static convertIntegerToString = function (value: string): string {
        let rets = [];
        let str = value;

        while (str.length > 3) {
            rets.unshift(str.substr(-3));
            str = str.substr(0, str.length - 3);
        }
        if (str.length > 0) {
            rets.unshift(str);
        }

        return rets.join(",");
    };

    /**
     * 把Node当前的节点树结构根据Node命名转成一个js对象,重名的组件会覆盖，
     * Node的name不应该包含空格键，否则将跳过
     * @param node 被遍历的Node组件
     * @param obj  绑定的js对象 (可选)
     * @param level 遍历层次数 (可选)  选择合适的层级可以提升效率
     */
    public static nodeTreeInfoLite(node: cc.Node, obj?: ViewHashMap, level?: number): ViewHashMap {
        let _level = level;
        if (isNaN(_level)) {
            _level = 99;
        }
        if (_level < 1) {
            return;
        }
        --_level;
        let treeInfo: ViewHashMap = obj || new ViewHashMap();
        let items = node.children;
        for (let i = 0; i < items.length; i++) {
            let _node = items[i];
            if (_node.name.indexOf(" ") < 0) {
                treeInfo.set(_node.name, _node);
            }
            _level > 0 && ViewUtils.nodeTreeInfoLite(_node, treeInfo, _level);
        }
        return treeInfo;
    }

    /**
     * 添加节点链信息
     * @param node 
     * @param obj 
     * @param level 
     * @returns 
     */
    public static nodeTreePosInfoLite(node: cc.Node, obj?: HashMap<string, { node: cc.Node, proto: cc.Vec2 }>, level?: number, parentPos?: cc.Vec2): HashMap<string, { node: cc.Node, proto: cc.Vec2 }> {
        let _level = level;
        if (isNaN(_level)) {
            _level = 99;
        }
        if (_level < 1) {
            return;
        }
        --_level;
        if (!parentPos) {
            parentPos = cc.v2(0, 0);
        }

        let treeInfo: HashMap<string, { node: cc.Node, proto: cc.Vec2 }> = obj || new HashMap<string, { node: cc.Node, proto: cc.Vec2 }>();
        let items = node.children;
        for (let i = 0; i < items.length; i++) {
            let _node = items[i],
                _pos = cc.v2(_node.position.x, _node.position.y);
            if (_node.name.indexOf(" ") < 0) {
                treeInfo.set(_node.name, {
                    node: _node,
                    proto: parentPos.add(_pos)
                });
            }
            ViewUtils.nodeTreePosInfoLite(items[i], treeInfo, _level, _pos);
        }
        return treeInfo;
    }

    /**
     * 正则搜索节点名字,符合条件的节点将会返回
     * @param reg   正则表达式
     * @param node  要搜索的父节点
     * @param _nodes 返回的数组 （可选）
     */
    public static findNodes = function (reg: RegExp, node: cc.Node, _nodes?: Array<cc.Node>): Array<cc.Node> {
        let nodes: Array<cc.Node> = _nodes || [];
        let items: Array<cc.Node> = node.children;
        for (let i = 0; i < items.length; i++) {
            let _name: string = items[i].name;
            if (reg.test(_name)) {
                nodes.push(items[i]);
            }
            ViewUtils.findNodes(reg, items[i], nodes);
        }
        return nodes;
    };


    /**
     * 将数字处理为带 K M的字符串  例：1000 => 1K  1000000 => 1M
     * @param val 
     */
    public static changeToKM(val: number): string {
        if (val < 0) {
            return "0";
        }
        else if (val <= 9999) {
            return val + "";
        }
        else if (val <= 999999) {
            let deal = Math.floor(val / 1000 * 100) / 100;
            return deal + "K";
        }
        else {
            let deal = Math.floor(val / 1000000 * 100) / 100;
            return deal + "M";
        }
    }

    /**
     * 修改数字为，第几的英文表示方式，例：1 => 1st  2 => 2nd
     * @param num 
     */
    public static changToRankNum(num: number) {
        if (num === 0) {
            return '';
        }
        else if (num === 1) {
            return '1st';
        }
        else if (num === 2) {
            return '2nd';
        }
        else if (num === 3) {
            return '3rd';
        }
        else {
            return `${num}th`;
        }
    }

    /**
     * 校验输入内容是否为 0-9 a-z A-Z
     * @param str 
     * @param limit 
     */
    public static inputLegal(str: string, limit: number) {
        let len = 0;
        let strLen = str.length;
        let regHanZi = new RegExp("^[\\u3220-\\uFA29]+$", "g");
        let regOther = new RegExp("^[0-9a-zA-Z]+$", "g");
        for (let i = 0; i < strLen; i++) {
            let s = str[i];
            if (s.match(regHanZi)) {
                len += 2;
            }
            else if (s.match(regOther)) {
                len += 1;
            }
            else {
                return false;
            }
        }
        return len <= limit;
    }


    /**
     * 格式化时间显示 （00:00:00）
     * @param hour 小时
     * @param minute 分钟
     * @param second 秒
     */
    public static setFormatTime(hour: number, minute: number, second: number): string {

        let arr = [hour, minute, second];
        let res = [];
        arr.forEach(t => {
            let str: string = "";
            if (t >= 10) {
                str += t;
            }
            else if (t >= 1) {
                str += "0" + t;
            }
            else {
                str += "00";
            }
            res.push(str);
        });
        return res.join(":");

    }


    public static join = function (...args) {
        let l = arguments.length;
        let result = "";
        for (let i = 0; i < l; i++) {
            result = (result + (result === "" ? "" : "/") + arguments[i]).replace(/(\/|\\\\)$/, "");
        }
        return result;
    };
    /**
     * 适配sprite宽高
     * @param desginX 设计高度
     * @param designY 设计宽度
     * @returns 缩放系数
     */
    public static fixedSpriteScale(desginX: number, designY: number, sp: cc.SpriteFrame): cc.Vec2 {
        if (!sp) {
            console.error("----no---sp---");
            return cc.v2(desginX, designY);
        }
        if (!sp.getRect) {
            console.trace();
            console.log(sp);
        }
        const rect = sp.getRect();
        const realWidth: number = rect.width;
        const realHeigth: number = rect.height;
        const minRate = Math.min(desginX / realWidth, designY / realHeigth);
        return cc.v2(realWidth * minRate, realHeigth * minRate);
    }


    /**
     * 手机单次震动
     */
    public static setSingleVibrate() {
        // if(cc.sys.isNative){
        //     let pluginOS = ezplugin.get("PluginOS");
        //     pluginOS && pluginOS.excute("vibrate","");
        // }
        // else{

        // new ScreenShake(gui.ui.layer, 0.01, 2, 2, 10);
        // new ScreenShake(gui.popup.layer, 0.01, 2, 2, 10);
        // }
    }

    /**
     * 获取时间戳
     */
    public static timeRestReturn(rest: number): string {
        let hour = Math.floor(rest / (1000 * 60 * 60));
        let minute = Math.floor((rest - hour * 60 * 60 * 1000) / (1000 * 60));
        let second = Math.floor((rest - hour * 60 * 60 * 1000 - minute * 60 * 1000) / 1000);
        let arr = [];
        if (hour > 0) {
            arr.push(hour);
        }
        arr.push(minute);
        arr.push(second);

        let res = [];
        arr.forEach(t => {
            let str: string = "";
            if (t >= 10) {
                str += t;
            }
            else if (t >= 1) {
                str += "0" + t;
            }
            else {
                str += "00";
            }
            res.push(str);
        });

        return res.join(":");
    }



    /**
     * 处理数额
     * ### 保留小数点后3位小数，低于0.001的强制显示0.001
     * @param money 要处理的数额
     */
    public static handleAmount(money: string): number {
        let tempValue = Math.floor(Number(money) * 1000);
        let result = tempValue / 1000;
        result = result < 0.001 ? 0.001 : result;
        return result;
    }

    /**
     * 获取年月日
     * ### 如2022年4月19日，返回值就是2022419
     * @returns 年月日的拼接number值
     */
    public static getNowTime(): number {
        let nowTime = new Date(Date.parse(new Date().toString()));
        let year = nowTime.getFullYear().toString();
        let month = nowTime.getMonth().toString();
        let day = nowTime.getDate().toString();
        let fullTime = Number(year + month + day);
        return fullTime;
    }

    /**
    * 获取对象的类名和所有父类类名，直到父类名为endName时停止
    * @param obj 对象
    * @param endName 终止类名
    * @param res 结果
    * @param maxDepth 最大递归次数，出于安全考虑，避免无限递归
    * @returns void
    */
    public static getAllClassName(obj: any, endName: string, res: string[], maxDepth: number = 10) {
        if (obj instanceof cc.Component) {
            const prototype = Object.getPrototypeOf(obj);
            const className = prototype['__classname__'];

            if (className === endName || maxDepth === 0) {
                return;
            }
            res.push(className);
            this.getAllClassName(prototype, endName, res, --maxDepth);
        }
    }
}