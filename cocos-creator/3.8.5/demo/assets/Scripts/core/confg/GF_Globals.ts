import { sp } from "cc";
// import { EventManager } from "../../GameMain/EventManager";
// import { NewMember } from "../../GameMain/NewMember";
import { CCComFun } from "../util/CCComFun";
import Singleton from "../util/Singleton";
import { GF_Config } from "./GF_Config";
// import { ConfigManager } from "../../Config/ConfigManager";
// import { EventTable, RoleAttribute } from "./GF_Constant";
import engine from "../Engine";

/**
 * @author : zhangxiaoqiang
 * @description : 全局变量脚本
 */

export class GF_Globals extends Singleton<GF_Globals>() {

    // /**家族天赋 */
    // public familyGift: string[] = [];
    // /**符号解释 */
    // public symbolExplainMap: Map<string, string> = new Map<string, string>();

    // /**开启双倍收入 */
    // public startDoubleGold() {
    //     GF_Config.ins.goldMultiple = 2
    //     let doubleTime = 0
    //     let doubleSch = setInterval(() => {
    //         if (doubleTime >= 10) {//60 * 2
    //             if (doubleSch) {
    //                 clearInterval(doubleSch);
    //                 doubleSch = null
    //                 GF_Config.ins.goldMultiple = 1
    //                 engine.event.emit(EventTable.UpdateDoubleGold)
    //             }
    //             doubleTime = 0
    //         }
    //         doubleTime += 1
    //     }, 1000);
    // }


    // /**描述处理 */
    // private replaceWithSwitch(symbol: string) {
    //     switch (symbol) {
    //         case '_getname.Man':
    //             return EventManager.ins.getEventRoleAttByGender(1).name; // 事件中男生的名字
    //         case '_getname.Woman':
    //             return EventManager.ins.getEventRoleAttByGender(2).name; // 事件中女生的名字
    //         case '_getname.Chd':
    //             return EventManager.ins.getEventRoleAtt()[2].name; // 取三人事件中孩子的名称 
    //         case '_getnameL':
    //             return `${GF_Config.ins.familyName}${ConfigManager.ins.last.getRandomName(EventManager.ins.getEventRoleAtt()[2].gender)}`; // 取NameLConfig中权重随机值，看广告特殊处理为在name_rav字段中为2的值中随机
    //         case '_getname.One':
    //             return EventManager.ins.getEventRoleAtt()[0].name; //取事件主人公名字
    //         case '_getname.Oth':
    //             return EventManager.ins.getEventRoleAtt()[1].name; // 取事件第二人的名字
    //         case '_getMaj.name':
    //             return ConfigManager.ins.major.rangeMajorName.major_name; // 取MajorConfig中major_name随机字段
    //         case '_getMaj.One':
    //             return ConfigManager.ins.major.getMajor(EventManager.ins.getEventRoleAtt()[0].major).major_name; // 取事件主人公专业
    //         case '_getCre.attr':
    //             return ConfigManager.ins.career.getRangeCareer().cereer_attribute; // 取CareerConfig中career_attribute字段随机值
    //         case '_getCre.name':
    //             return ConfigManager.ins.career.getLevelNameByFourAtt(NewMember.ins.getRoleByID(EventManager.ins.getEventRoleAtt()[0].uuid).fourAttTotal); // 取CareerConfig中career_levelname字段，若事件主人公四条属性大于320，取随机值数组里等级3的职业名称，若小于240，取随机值数组里等级1的职业名称，否则取等级2的
    //         case '_getCre.fitname':
    //             return ConfigManager.ins.career.getLevelNameByFourAtt(ConfigManager.ins.major.getMajorFitName(EventManager.ins.getEventRoleAtt()[0].major)); // 按主人公属性中专业的值在MajorConfig中找到对应值，并取字段major_plusc中对应数组中随机值，以该值在CareerConfig中找到对应职业，并在该职业的career_levelname字段取值，若事件主人公四条属性大于320，取随机值数组里等级3的职业名称，若小于240，取随机值数组里等级1的职业名称，否则取等级2的
    //         case '_getCre.6name':
    //             return ConfigManager.ins.career.getCustomizeLevelCareer(5); // 取CareerConfig中随机职业等级为6的职业名
    //         case '_getCre.One':
    //             return ConfigManager.ins.career.getCareerName(EventManager.ins.getEventRoleAtt()[0].caree, EventManager.ins.getEventRoleAtt()[0].workValue); // 取事件主人公的职业名字
    //         case '_getCre.attrOne':
    //             return ConfigManager.ins.career.getCareer(EventManager.ins.getEventRoleAtt()[0].caree).cereer_attribute; //取事件主人公的行业名字
    //         case '_getCre.6nameprice':
    //             return ConfigManager.ins.career.getCareeData();     //取CareerConfig中随机职业等级为6的职业名与该职位秒赚金钱，并显示为：xxx（工作）
    //         default:
    //             return symbol; // 如果没有匹配到，返回原符号
    //     }

    // }

    // /**重置描述语句 */
    // public replaceAndProcessSymbols(str: string): string {
    //     // 使用正则表达式匹配形如 {_getnameL} 或 {_getname.One} 的占位符
    //     const regex = /\{(_\w+(\.\w+)?)\}/g;

    //     // 使用 replace 处理每个匹配的占位符
    //     return str.replace(regex, (match, p1) => {
    //         // 这里 p1 就是匹配到的 _getnameL 或 _getname.One
    //         return this.replaceWithSwitch(p1); // 调用 replaceWithSwitch 进行替换
    //     });
    // }


    // /**分隔符处理 */
    // public processString(str: string): string[] {
    //     str = this.replaceAndProcessSymbols(str);

    //     let cleanedStr = str.replace(/%%/g, '');

    //     let temp = [];
    //     let segments = cleanedStr.split(',');
    //     for (let i = 0; i < segments.length; i++) {
    //         temp = segments[i].split('|');
    //         segments[i] = temp.length > 1 ? temp[CCComFun.random(0, temp.length - 1)] : temp[0];
    //     }

    //     return segments;
    // }

    // /**检测事件选择后是否还有ID 如果有则连续触发 */
    // public extractEventDetails(input: string): { cleanedString: string; eventId: number } {
    //     // 正则表达式匹配 &Evt_ 后面的数字
    //     const regex = /Evt_(\d+)/;
    //     const match = input.match(regex);

    //     if (match) {
    //         const eventId = parseInt(match[1], 10); // 获取数字
    //         const cleanedString = input.replace(regex, ''); // 去除 &Evt_和数字
    //         return { cleanedString: cleanedString.trim(), eventId }; // 返回对象
    //     } else {
    //         return null;
    //     }
    // }

    // /**事件属性变化 */
    // public eventAttributes(uuid: number, popAtt: Record<string, number[]>, index) {
    //     let PopAtt = {};
    //     if (Object.keys(popAtt).length > 0) {
    //         PopAtt = CCComFun.combineAttributes(popAtt)[index];
    //     }
    //     return PopAtt
    // }

    // /**根据key值检索属性信息 */
    // public getAttDataByKey(att: RoleAttribute, popAtt: Record<string, number[]>) {
    //     let info = {};
    //     let obj = Object.keys(popAtt);
    //     obj.forEach((key) => {
    //         if (key == 'gold') {
    //             info[key] = GF_Config.ins.toalGold;
    //         } else {
    //             info[key] = att[key];
    //         }

    //     })
    //     return info;
    // }

    // /**两个对象相加的属性值 */
    // public addAttributes(a: { [key: string]: number }, b: { [key: string]: number }) {
    //     const result: { [key: string]: number } = {};

    //     // 遍历 a 和 b 的所有属性，进行相加
    //     for (const key in a) {
    //         if (a.hasOwnProperty(key) && b.hasOwnProperty(key)) {
    //             result[key] = a[key] + b[key];
    //             if (key != 'gold' && result[key] <= 0) { result[key] = 0 };
    //         }
    //     }

    //     return result;
    // }

    // /**保留角色属性 */
    // public retainRoleAtt(index: number, att: { [key: string]: number }) {

    //     let RoleAtt = EventManager.ins.getEventRoleAtt()[index];

    //     let obj = Object.keys(att);
    //     let parse = {};
    //     obj.forEach((key) => {
    //         if (key == 'gold') {
    //             GF_Config.ins.toalGold += att[key];
    //         } else {
    //             parse[key] = att[key];
    //             if (parse[key] <= 0) {
    //                 parse[key] = 0;
    //             }
    //         }
    //     })

    //     NewMember.ins.updateRoleAt(NewMember.ins.setCorresponding(RoleAtt, parse));
    // }






}


