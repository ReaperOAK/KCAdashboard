import { VNode } from "snabbdom/src/vnode.js";
export interface AttachData {
    [key: string]: any;
    [i: number]: any;
    placeholder?: any;
    real?: Node;
}
export declare function attachTo(target: Element, vnode: VNode): VNode;
