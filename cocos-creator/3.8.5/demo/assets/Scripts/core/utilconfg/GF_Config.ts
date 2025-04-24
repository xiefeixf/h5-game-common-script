/**
 * @author : zhangxiaoqiang
 * @description : 全局配置脚本
 */

// import { ConfigManager } from "../../Config/ConfigManager";
// import { CityManager } from "../../UIModular/Map/CityManager";
// import { FamilyStatistics } from "../../UIModular/Popup/PopFamilyStatistics";
import engine from "../Engine";
import Singleton from "../util/Singleton";
import { EventTable, LocalData, StorageValue } from "./GF_Constant";


export class GF_Config extends Singleton<GF_Config>() {


    // /**家族名称 */
    // public get familyName() {
    //     let name = engine.localStorage.getItem(StorageValue.familyName);
    //     if (!name) {
    //         name = ConfigManager.ins.first.getFirst();
    //         this.familyName = name;
    //     }
    //     return name;
    // }
    // public set familyName(name: string) {
    //     engine.localStorage.setItem(StorageValue.familyName, JSON.stringify(name));
    //     engine.event.emit(EventTable.SetFamilyName);
    // }

    // /**角色头像列表 */
    // public get roleHeadList() {
    //     let list = engine.localStorage.getItem(StorageValue.roleHeadList);
    //     if (!list) {
    //         list = ConfigManager.ins.role.initialRoleHeadList();
    //         engine.localStorage.setItem(StorageValue.roleHeadList, list);
    //     }
    //     return list;
    // }
    // public set roleHeadList(list) {
    //     engine.localStorage.setItem(StorageValue.roleHeadList, list);
    // }
    // /**修改单个头像状态 */
    // public setSingleHead(id: number, type: number) {
    //     let list = engine.localStorage.getItem(StorageValue.roleHeadList);
    //     for (const key in list) {
    //         if (list[key] == 2 && type == 2) {
    //             list[key] = 0;
    //         }
    //     }
    //     list[id] = type;
    //     this.roleHeadList = list;
    //     engine.event.emit(EventTable.UpdateHeadType);
    // }
    // /**根据状态获取头像 */
    // public getHeadsbyType(type: number) {
    //     let list = engine.localStorage.getItem(StorageValue.roleHeadList);
    //     for (let key in list) {
    //         if (list[key] == type) {
    //             return Number(key);
    //         }
    //     }
    //     return 0;
    // }

    // /**家族天赋 */
    // public get familyGift() {
    //     let list = engine.localStorage.getItem(StorageValue.familyGift)
    //     if (!list) {
    //         list = [];
    //         engine.localStorage.setItem(StorageValue.familyGift, list);
    //     }
    //     return list;
    // }
    // public set familyGift(list: string[]) {
    //     engine.localStorage.setItem(StorageValue.familyGift, list);
    // }

    // /**家族统计信息 */
    // public get familyStatistics(): FamilyStatistics {
    //     let stat = engine.localStorage.getItem(StorageValue.familyStatistics);
    //     if (!stat) {
    //         stat = { frnum: 0, srnum: 0, cynum: 1, mmnum: 0 };
    //         engine.localStorage.setItem(StorageValue.familyStatistics, stat);
    //     }
    //     return stat;
    // }

    // /**家族统计信息 */
    // public set familyStatistics(stat: FamilyStatistics) {
    //     engine.localStorage.setItem(StorageValue.familyStatistics, stat);
    // }

    // /**创建一个家庭 */
    // public creatorFamily(roleAtt: RoleAttribute) {
    //     engine.localStorage.setItem(StorageValue.familyStatistics, {
    //         member: roleAtt,
    //         spouse: null,
    //         children: [],
    //     })
    // }

    // /**家族信息存储 */
    // public setFamilyStatistics(data) {
    //     engine.localStorage.setItem(StorageValue.familyStatistics, data);
    // }

    // /**家族总金钱数 */
    // public get toalGold() {
    //     let value = engine.localStorage.getItem(StorageValue.toalGold);
    //     if (!value) {
    //         value = 0;
    //         engine.localStorage.setItem(StorageValue.toalGold, value);
    //     }
    //     return Number(value);
    // }
    // public set toalGold(value: number) {
    //     let gold = this.toalGold + value;
    //     engine.localStorage.setItem(StorageValue.toalGold, Number(gold));
    // }


    // /**希望之星数量 */
    // public get hopeStar() {
    //     let value = engine.localStorage.getItem(StorageValue.hopeStar);
    //     if (!value) {
    //         value = 0;
    //         engine.localStorage.setItem(StorageValue.hopeStar, value);
    //     }
    //     return value;
    // }
    // public set hopeStar(value: number) {
    //     engine.localStorage.setItem(StorageValue.hopeStar, value);
    // }

    // /**金钱增长倍数 */
    // public get goldMultiple() {
    //     let value = engine.localStorage.getItem(StorageValue.goldMultiple);
    //     if (!value) {
    //         value = 1;
    //         engine.localStorage.setItem(StorageValue.goldMultiple, value);
    //     }
    //     return value;
    // }
    // public set goldMultiple(value: number) {
    //     engine.localStorage.setItem(StorageValue.goldMultiple, value);
    // }

    // /**游戏日期 */
    // public get gameDate(): { year: number, month: number } {
    //     let value = engine.localStorage.getItem(StorageValue.gameDate);
    //     if (!value) {
    //         value = { year: 2024, month: 9 };
    //         engine.localStorage.setItem(StorageValue.gameDate, value);
    //     }
    //     return value;
    // }
    // /**游戏日期 */
    // public set gameDate(value: { year: number, month: number }) {
    //     engine.localStorage.setItem(StorageValue.gameDate, value);
    // }

    // /**城镇收购信息 */
    // public get GetTownsBuyInfo() {
    //     if (!engine.localStorage.getItem(LocalData.TownsBuyInfo)) {
    //         CityManager.ins.ReadlistgenerationBuyInfo();
    //     }
    //     return engine.localStorage.getItem(LocalData.TownsBuyInfo)
    // }
    // /**城镇收购 */
    // public set GetTownsBuyInfo(value: { city: string, bol: boolean }) {
    //     let TownsBuyInfo = this.GetTownsBuyInfo;
    //     TownsBuyInfo[value.city][0] = value.bol;
    //     engine.localStorage.setItem(LocalData.TownsBuyInfo, TownsBuyInfo);
    // }

    // /**建筑物入驻人员信息 */
    // public get GetEntryform() {
    //     if (!engine.localStorage.getItem(LocalData.Entryform)) {
    //         CityManager.ins.ReadlistgenerationEntryform();
    //     }
    //     return engine.localStorage.getItem(LocalData.Entryform);
    // }


    // /**建筑物入驻人员信息 */
    // public set GetEntryform(value: { city: string, Lv: number, idx: number, roleId: any }) {
    //     let Entryform = this.GetEntryform;
    //     Entryform[value.city][value.Lv][value.idx] = value.roleId;
    //     engine.localStorage.setItem(LocalData.Entryform, Entryform);
    // }
    // /**建筑物运营成本 */
    // public get GetOperatingCost() {
    //     return engine.localStorage.getItem(LocalData.OperatingCost) || {};
    // }
    // /**建筑物运营成本 */
    // public set GetOperatingCost(value: { city: string, cost: number, increase: number }) {
    //     let OperatingCost = this.GetOperatingCost;
    //     OperatingCost[value.city] = {
    //         cost: value.cost,
    //         increase: value.increase,
    //     }
    //     engine.localStorage.setItem(LocalData.OperatingCost, OperatingCost);
    // }


    // /**首次进入游戏 */
    // public get firstGame() {
    //     let value = engine.localStorage.getItem(StorageValue.firstGame);
    //     if (!value) {
    //         value = false;
    //         engine.localStorage.setItem(StorageValue.firstGame, value);
    //     }
    //     return value;
    // }

    // public set firstGame(value) {
    //     engine.localStorage.setItem(StorageValue.firstGame, value);
    // }


    // /**获取成就 */
    // public get achievement() {
    //     return {};
    // }

}