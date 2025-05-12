import { Hooks } from "snabbdom/src/hooks.js";
import { AttachData } from "snabbdom/src/helpers/attachto.js";
import { VNodeStyle } from "snabbdom/src/modules/style.js";
import { On } from "snabbdom/src/modules/eventlisteners.js";
import { Attrs } from "snabbdom/src/modules/attributes.js";
import { Classes } from "snabbdom/src/modules/class.js";
import { Props } from "snabbdom/src/modules/props.js";
import { Dataset } from "snabbdom/src/modules/dataset.js";
export type Key = string | number | symbol;
export interface VNode {
    sel: string | undefined;
    data: VNodeData | undefined;
    children: Array<VNode | string> | undefined;
    elm: Node | undefined;
    text: string | undefined;
    key: Key | undefined;
}
export interface VNodeData<VNodeProps = Props> {
    props?: VNodeProps;
    attrs?: Attrs;
    class?: Classes;
    style?: VNodeStyle;
    dataset?: Dataset;
    on?: On;
    attachData?: AttachData;
    hook?: Hooks;
    key?: Key;
    ns?: string;
    fn?: () => VNode;
    args?: any[];
    is?: string;
    [key: string]: any;
}
export declare function vnode(sel: string | undefined, data: any | undefined, children: Array<VNode | string> | undefined, text: string | undefined, elm: Element | DocumentFragment | Text | undefined): VNode;
