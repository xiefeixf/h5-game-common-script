/*
 * @Description:  something 
 */
import * as cc from "cc";

import { HashMap } from "../util/HashMap";

export class ViewHashMap extends HashMap<string, cc.Node> {

    public getComponent<T extends cc.Component>(node_name: string, type: { prototype: T }): T {
        let node: cc.Node = this.get(node_name);
        if (node) {
            return node.getComponent(type as any);
        }
        return null;
    }
}