/*

 * GUI入口文件
 * 分层设计思想，按界面功能分层
 */
import { LayerBase } from "./LayerBase";
import { gui_setting } from "./Defines";
import { BlockInputEvents, Node, Prefab, Vec3, find, instantiate, v3, view } from "cc";
import engine from "../Engine";
import { PopLayerType } from "../utilconfg/GF_Constant";
// import { PopTips } from "../../UIModular/Tips/PopTips";
export class gui {
    /**
     * gui资源加载器
     */
    // public static get assetsLoader(): AssetsLoader {
    //     return AssetsLoader.instance();
    // }

    /**home层 */
    public static home: LayerBase = null;
    /** ui控制层界面， 允许界面叠加 */
    public static ui: LayerBase = null;
    /**浮动层 */
    public static float: LayerBase = null;
    /**popup层 */
    public static popup: LayerBase = null;


    private static initFlag = false;
    /**顶层触摸穿透 */
    private static blockInputEvent: BlockInputEvents = null;
    public static layers: Array<LayerBase> = [];

    public static root: Node = null;
    public static init(root: Node) {
        this.root = root;
        if (!gui.initFlag) {
            window["gui"] = gui;
            gui.initFlag = true;
        }
        gui.home = new LayerBase("LayerHome", new Node());
        gui.ui = new LayerBase("LayerUI", new Node());
        gui.float = new LayerBase("LayerFloat", new Node());
        gui.popup = new LayerBase("LayerPopUp", new Node());
        gui.layers.length = 0;
        gui.layers.push(gui.home, gui.ui, gui.float, gui.popup);
        for (let glayer of gui.layers) {
            root.addChild(glayer.container)
        }
        gui_setting.engineValid = true;
        gui.blockInputEvent = gui.popup.container.addComponent(BlockInputEvents);
        gui.setTopMask(false);
        this.resize();
    }


    /** 重置层级size */
    public static resize() {
        let winsize = view.getVisibleSize();
        let width = winsize.width;
        let height = winsize.height;
        for (let glayer of gui.layers) {
            glayer.layout(width, height);
        }
    }

    /**设置顶层穿透 */
    public static setTopMask(value: boolean) {
        gui.blockInputEvent.enabled = value;
        //value ? Log.trace("开启顶层穿透") : Log.trace("关闭顶层穿透");
    }

    /**显示提示 */
    public static showTips(str: string) {
        // engine.resMar.loadRes(PopLayerType.PopTips, Prefab, (res) => {
        //     let obj = instantiate(res);
        //     gui.popup.container.addChild(obj);
        //     // obj.getComponent(PopTips).show(str);
        // })
    }


}