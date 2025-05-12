import { Module } from "snabbdom/src/modules/module.js";
import { VNode } from "snabbdom/src/vnode.js";
import { DOMAPI } from "snabbdom/src/htmldomapi.js";
export type Options = {
    experimental?: {
        fragments?: boolean;
    };
};
export declare function init(modules: Array<Partial<Module>>, domApi?: DOMAPI, options?: Options): (oldVnode: VNode | Element | DocumentFragment, vnode: VNode) => VNode;
