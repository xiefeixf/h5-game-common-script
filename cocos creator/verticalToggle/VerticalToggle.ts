
import { eventManager } from "../../../common/EventManager";
import Utils from "../../../common/Utils";
import { Event } from "../../../Event";
import ScrollViewController from "../ScrollViewController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class VerticalToggle extends cc.Component {

    public mainGroup: cc.Node;
    public scrollView: cc.Node;
    public arrow: cc.Node;
    public lb_main: cc.Label;
    public maxHeight: number = 200;

    protected scController: ScrollViewController;
    protected scComponent: cc.ScrollView;
    protected content: cc.Node;

    protected _data: any[];
    protected _selectedIndex: number = -1;
    public get selectedIndex(): number { return this._selectedIndex; }
    protected callback: Function;
    protected callbackObj: any;


    onLoad() {
        this.mainGroup = Utils.FindChildByName(this.node, "mainGroup");
        this.scrollView = Utils.FindChildByName(this.node, "scrollView");
        this.arrow = Utils.FindChildByName(this.node, "img_arrow");
        this.lb_main = Utils.FindChildByName(this.node, "lb_main").getComponent(cc.Label);
        this.scController = this.scrollView.getComponent(ScrollViewController);
        this.scComponent = this.scrollView.getComponent(cc.ScrollView);
        this.scComponent.elastic = false;
        this.content = this.scComponent.content;

        this.mainGroup.on(cc.Node.EventType.TOUCH_END, this.onClick, this);

        eventManager.addEvent(Event.ToggleRenderClick, this.onRenderClick, this);
    }


    public set data(value: any[]) {
        this._data = value;
        this.dataChanged();
    }


    protected dataChanged() {
        this.scController.data = this._data;
        // this.scrollView.height = this.content.height > this.maxHeight ? this.maxHeight : this.content.height;
    }


    public show() {
        let show = this.scrollView.active;
        if (show) return;

        this.scrollView.active = true;
    }


    public hide() {
        let show = this.scrollView.active;
        if (!show) return;

        this.scrollView.active = false;
    }


    private onClick() {
        let show = this.scrollView.active;
        show ? this.hide() : this.show();
    }


    private onRenderClick(data: any) {
        this.lb_main.string = data;
        this.hide();
    }



}
