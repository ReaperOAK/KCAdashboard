import { VNode } from "snabbdom/src/vnode.js";
import { Module } from "snabbdom/src/modules/module.js";
type Listener<T> = (this: VNode, ev: T, vnode: VNode) => void;
export type On = {
    [N in keyof HTMLElementEventMap]?: Listener<HTMLElementEventMap[N]> | Array<Listener<HTMLElementEventMap[N]>>;
} & {
    [event: string]: Listener<any> | Array<Listener<any>>;
};
export declare const eventListenersModule: Module;
export {};
