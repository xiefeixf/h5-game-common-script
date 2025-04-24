/*
 * @Author: hehao
 * @Date: 2022-04-28 15:50:43
 * @Email: hehao@wedobest.com.cn
 * @Description:  日志统一打印 
 */

import * as cc from "cc";
import { Algo } from "./util/Algo";


export class Log {
    public static TAG = "[Log]";
    /**
     * 是否开启日志
     */
    public static enable = true;

    public static safetyStringify = Algo.stringify;

    private static formatAny(data: any) {
        if (data === null) {
            return "null";
        }
        if (data === undefined) {
            return "undefined";
        }
        if (typeof data === "object") {
            let str = Log.safetyStringify(data);
            if (str.length < 128) {
                return str;
            }
            return str.substring(0, 127) + " ..."
        }
        return data;
    }

    /**
     * 常规输出打印
     * @param args 
     * @returns 
     */
    public static trace(...args: any[]) {
        if (!Log.enable) { return; }
        if (cc.sys.isBrowser) {
            let time = new Date().toLocaleTimeString();
            return console.log(Log.TAG, time, ...args);
        }
        let msg = '';
        for (let item of args) {
            msg = msg + " | " + Log.formatAny(item);
        }
        console.log(Log.TAG, msg);
    }

    public static info(...args: any[]) {
        if (!Log.enable) { return; }
        if (cc.sys.isBrowser) {
            let time = new Date().toLocaleTimeString();
            return console.log(Log.TAG, time, ...args);
        }
        let msg = '';
        for (let item of args) {
            msg = msg + " | " + Log.formatAny(item);
        }
        console.info(Log.TAG, msg);
    }

    public static error(...args: any[]) {
        if (!Log.enable) { return; }
        if (cc.sys.isBrowser) {
            let time = new Date().toLocaleTimeString();
            return console.error(Log.TAG, time, ...args);
        }
        let msg = '';
        for (let item of args) {
            msg = msg + " | " + Log.formatAny(item);
        }
        console.error(Log.TAG, msg);
    }
}