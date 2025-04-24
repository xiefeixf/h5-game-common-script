/**
 * @author : zhangxiaoqiang
 * @description : 存储枚举，宏定义，常量等
 */

/**bundles */
// export const BundlesName = ["Config", "UI", "Animation", "roleSp"];
export const BundlesName = ["UI"];

/**UI界面 */
export const UILayerType = {
    /**主界面 */
    gameUI: "UI/Prefab/MainInterface/gameUI",

    /**胜利 */
    winUI: "UI/Prefab/MainInterface/winUI",
    /**失败 */
    loseUI: "UI/Prefab/MainInterface/loseUI",
}

/**弹窗界面 */
export const PopLayerType = {
    /**提示弹窗 --- GUI直接调用不走pop层 */
    PopTips: "UI/Prefab/Pop/PopTips",
}

/**事件弹窗 */
export const PopEventLayerType = {
    PopOptionEvent: "UI/Prefab/EventPop/PopOptionEvent",
    PopOnemanEvent: "UI/Prefab/EventPop/PopOnemanEvent",
    PopMultipersonEvent: "UI/Prefab/EventPop/PopMultipersonEvent",
}

/**存储 */
export const StorageValue = {

    /**家族名称 */
    familyName: "familyName",
    /**角色头像列表 */
    roleHeadList: "roleHeadList",
    /**家族天赋 */
    familyGift: "familyGift",
    /**家族统计信息 */
    familyStatistics: "familyStatistics",
    /**角色信息 */
    roleAttributes: "roleAttributes",
    /**总金钱数 */
    toalGold: "toalGlod",
    /**游戏日期 */
    gameDate: "gameDate",
    /**祠堂数据 */
    ancesData: "ancesData",
    /**家族树 */
    familyTree: "familyTree",
    /**家庭成员信息 */
    familyMember: "familyMember",
    /**是否为首次进入游戏 */
    firstGame: "firstGame",
    /**当前金钱增长倍数 */
    goldMultiple: "goldMultiple",
    /**希望之星数量 */
    hopeStar: "hopeStar",

}

/**事件 */
export const EventTable = {
    /**修改家族名称 */
    SetFamilyName: "SetFamilyName",
    /**更新头像状态 */
    UpdateHeadType: "UpdateHeadType",
    /**更新天赋选择 */
    UpdateGiftChoice: "UpdateGiftChoice",
    /**家族属性更新 */
    FamilyStat: "FamilyStat",
    /**每秒执行 - 数据更新 */
    ExecutePerSecondEvent: "ExecutePerSecondEvent",
    /**每秒执行 - UI更新 */
    ExecutePerSecondUI: "ExecutePerSecondUI",
    /**页面切换 */
    ChangeInterface: "ChangeInterface",
    /**入驻服务员 */
    Residentattendant: "Residentattendant",
    /**关闭入驻服务员List */
    ClosePopMemberList: "ClosePopMemberList",
    /**移出服务员 */
    Removalattendant: "Removalattendant",
    /**祠堂数据更新 */
    AncestralUpdate: "AncestralUpdate",
    /**祠堂选择更新 */
    AncestralUpdateSelect: "AncestralUpdateSelect",
    /**事件弹窗 */
    EventPop: "EventPop",
    /**更新属性值 */
    Updateattribute: "Updateattribute",
    /**更新map界面ui显示 */
    UpdateMapUI: "UpdateMapUI",
    /**关闭人物信息 */
    CloseInfo: "CloseInfo",
    /**聚焦界面人物 */
    LockEventRole: "LockEventRole",
    /**更新家庭列表 */
    UpdateFamilList: "UpdateFamilList",
    /**更新双倍金钱按钮 */
    UpdateDoubleGold: "UpdateDoubleGold",
}

export const GameConfig = {
    /**天赋表 */
    Gift: "GiftConfig",
    /**角色表 */
    Role: "RoleConfig",
    /**标签表 */
    Tips: "TipsConfig",
    /**姓氏表 */
    First: "NameFConfig",
    /**姓名表 */
    Last: "NameLConfig",
    /**职业表 */
    Career: "CareerConfig",
    /**表情表 */
    Emoji: "EmojiConfig",
    /**专业表 */
    Major: "MajorConfig",
    /**动态配置表 */
    Centre: "CentreControl",
    /**事件表 */
    Event: "EventConfig",
    /**事件标题表 */
    EventTit: "EventTitConfig",
    /**事件弹窗表 */
    EventPop: "EventPopConfig",
    /**城镇建筑物表 */
    City: "CityConfig",
    /**祠堂道具表 */
    AncestralHall: "AncestralHallConfig",
    /**成就表 */
    AchiveConfig: "AchiveConfig",
    /**年龄事件表 */
    Age: "AgeConfig",
    /**表情事件表 */
    Emo: "EventEmoConfig",
    /**事件类型表 */
    EventType: "EventTypeConfig",
    /**角色表 */
    Doll: "DollConfig",
}

/**角色头像颜色表 */
export const RoleHeadBgColor = {
    10019: "efb5b5",
    20018: "bec7ee",
    10020: "eeddbe",
    20019: "eebed3",
    10021: "e3beee",
    20020: "bee1ee",
    10022: "dbeebe",
    20021: "bae3cd",
}

/**天赋品质 */
export const GiftQuality = {
    1: 'EEDFC8',
    2: 'B6DDFF',
    3: 'E8BDFF',
    4: 'FFDF88',
}

export const studies = [
    ["一般小学", "一般初中", "一般高中", "一般大学"],
    ["精英小学", "贵族初中", "交大附中", "华清大学"]
]

export const LocalData = {
    /**城镇收购信息 */
    TownsBuyInfo: "TownsBuyInfo",
    /**建筑物入驻人员信息 */
    Entryform: "Entryform",
    /**建筑物运营成本 */
    OperatingCost: "OperatingCost",
}

export const TownsType = {
    /**研究所 */
    "yanjiusuo": 10,
    /**餐厅 */
    "canting": 9,
    /**公寓1 */
    "gongyu1": 1,
    /**公寓2 */
    "gongyu2": 2,
    /**酒店 */
    "jiudian": 3,
    /**健身房 */
    "jianshenfang": 5,
    /**酒吧 */
    "jiuba": 8,
    /**咖啡厅 */
    "kafeiting": 4,
    /**学校 */
    "xuexiao": 7,
    /**医院 */
    "yiyuan": 6,
}



export const SymbolExplain = {
    'getnameMan': '_getname.Man',
    'getnameWoman': '_getname.Woman',
    'getnameChd': '_getname.Chd',
    'getnameL': '_getnameL',
    'getnameOne': '_getname.One',
    'getnameOth': '_getname.Oth',
    'getMajName': '_getMaj.name',
    'getMajOne': '_getMaj.One',
    'getCreAttr': '_getCre.attr',
    'getCreName': '_getCre.name',
    'getCreFitname': '_getCre.fitname',
    'getCre6Name': '_getCre.6name',
    'getCreOne': '_getCre.One',
    'getCreAttrOne': '_getCre.attrOne',
}