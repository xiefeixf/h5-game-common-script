/*
 * @Description:  something 
 */
import * as cc from "cc";

export class NodeTree {

    private static _nodeTreePool: Array<NodeTree> = [];

    public static alloc(root: cc.Node) {
        let ret: NodeTree = null;
        if (NodeTree._nodeTreePool.length > 0) {
            ret = this._nodeTreePool.pop();
            ret.root = root;
        } else {
            ret = new NodeTree(root);
        }
        return ret;
    }
    public static free(nt: NodeTree) {
        if (nt && nt.state != 3) {
            nt.clear();
            if (NodeTree._nodeTreePool.length < 8) {
                NodeTree._nodeTreePool.push(nt);
            }
        }
    }

    /************************************************ */
    private _root: cc.Node = null;

    private _state = 0; // 0表示初始化，1表示待使用，2表示全部ok，3表示已清除

    public get state() {
        return this._state;
    }
    private _nodes: Map<string, cc.Node> = new Map<string, cc.Node>();

    /**
     * 设置根节点
     */
    public set root(root: cc.Node) {
        if (root && this._root != root) {
            this._root = root;
            this._state = 1;
            this._nodes.clear();
        }
    }

    constructor(root: cc.Node) {
        this.root = root;
    }
    /**
     * 遍历节点
     * @param node 
     */
    private _loopNode(node: cc.Node) {
        for (let childNode of node.children) {
            if (childNode.name.indexOf(" ") < 0) {
                this._nodes.set(childNode.name, childNode);
            }
            this._loopNode(childNode);
        }
    }
    /**
     * 获取一个节点
     * @param name 节点名称
     * @returns 
     */
    public get(name: string): cc.Node {
        if (this._nodes.has(name)) {
            return this._nodes.get(name);
        }
        if (this._state === 1) {
            this._loopNode(this._root);
            this._state = 2;
            return this.get(name);
        }
        return null;
    }
    /**
     * root中是否存在某个节点
     * @param name 节点名称
     * @returns 
     */
    public has(name: string): boolean {
        if (this._nodes.has(name)) {
            return true;
        }
        if (this._state === 1) {
            this._loopNode(this._root);
            this._state = 2;
            return this.has(name);
        }
        return false;
    }
    /**
     * 清理
     */
    public clear() {
        this._root = null;
        this._state = 3;
        this._nodes.clear();
    }
}