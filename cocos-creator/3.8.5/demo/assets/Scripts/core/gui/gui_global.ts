import * as cc from "cc";

export const prefabComponentMap = new Map<string, string>();
export const compPropertyMap = new Map<string, { nodeName: string, key: string, type?: typeof cc.Component | typeof cc.Node }[]>();