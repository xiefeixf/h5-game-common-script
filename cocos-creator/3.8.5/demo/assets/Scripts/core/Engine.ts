import { AudioSource, Canvas, DynamicAtlasManager, Label, Node, Prefab, UITransform, director, find, game, macro, sys } from "cc";
import { EventDispatcher, GlobalEvent } from "./event/GlobalEvent";
import { EngineTime } from "./util/EngineTime";
import { Log } from "./Log";
import { gui } from "./gui/GUI";
import GUIToast from "./ui/view/GUIToast";
import { LocalStorage } from "./localStorage/LocalStorage";
import { AudioManager } from "./manager/AudioManager";
import { ResManager } from "./manager/ResManager";
import { DataManager } from "./manager/DataManager";


// 关闭动态合图和Image缓存
macro.CLEANUP_IMAGE_CACHE = true;
DynamicAtlasManager.instance.enabled = false;

/**
 * 基础工具库类
 */
export default class engine {
    /**
     * 是否为调试模式
     */
    public static cc_debug: boolean = false;

    /**
     * 承载GUI的canvas节点
     */
    public static canvas: Canvas = null;

    /**资源管理模块 */
    public static resMar: ResManager = ResManager.ins;
    /**数据管理模块 */
    public static dataMar: DataManager = DataManager.ins;
    /**模块容器 */
    private static modules = new Map<string, any>();

    /** 全局事件发、收管理器 */
    public static event: EventDispatcher = GlobalEvent;
    public static get localStorage(): LocalStorage {
        const key = "localStorage";
        if (!engine.modules.has(key)) {
            engine.modules.set(key, (new LocalStorage(sys.localStorage)));
        }
        return engine.modules.get(key);
    }

    /**游戏时间管理器 */
    public static timer: EngineTime = null;

    /** 日志打印模块 */
    public static log = Log;

    /*** 常驻节点， engine.timer依赖该节点 */
    public static persistRootNode: Node = null;

    /*** 常驻节点， engine.audioManager依赖该节点 */
    public static audioManager: AudioManager = AudioManager.ins;

    private static _isInited = false;

    /**是否已经初始化 */
    public static get isInited() {
        return engine._isInited;
    }

    /**初始化 */
    public static init(canvas: Canvas) {
        Log.info("core CLEANUP_IMAGE_CACHE", macro.CLEANUP_IMAGE_CACHE);
        Log.info("core dynamicAtlasManager.enabled", DynamicAtlasManager.instance.enabled);
        Log.enable = engine.cc_debug;
        engine.canvas = canvas;
        gui.init(canvas.node);
        let sceneInstance = director.getScene();
        if (!engine.persistRootNode) {
            engine.persistRootNode = new Node("persistRootNode");
            engine.persistRootNode.addComponent(UITransform);
            engine.persistRootNode.setSiblingIndex(9999);
            sceneInstance.addChild(engine.persistRootNode);
            director.addPersistRootNode(engine.persistRootNode);

        }
        const audioManagerNode = new Node("audioManagerNode");
        engine.audioManager.init(audioManagerNode.addComponent(AudioSource), audioManagerNode.addComponent(AudioSource));
        director.addPersistRootNode(audioManagerNode);

        if (engine.isInited) {
            return Log.info("engine is Initialized, no need init twice!");
        }
        engine._isInited = true;
        engine.timer = new EngineTime();
        GUIToast.globalInit = (labNode: Label, content: string, useI18n: boolean) => {
            labNode.string = content;
        };
    }

}