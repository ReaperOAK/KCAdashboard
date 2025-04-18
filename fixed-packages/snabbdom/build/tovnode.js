import { addNS } from "./h.js";
import { vnode } from "./vnode.js";
import { htmlDomApi } from "./htmldomapi.js";
export function toVNode(node, domApi) {
    const api = domApi !== undefined ? domApi : htmlDomApi;
    let text;
    if (api.isElement(node)) {
        const id = node.id ? "#" + node.id : "";
        const cn = node.getAttribute("class");
        const c = cn ? "." + cn.split(" ").join(".") : "";
        const sel = api.tagName(node).toLowerCase() + id + c;
        const attrs = {};
        const dataset = {};
        const data = {};
        const children = [];
        let name;
        let i, n;
        const elmAttrs = node.attributes;
        const elmChildren = node.childNodes;
        for (i = 0, n = elmAttrs.length; i < n; i++) {
            name = elmAttrs[i].nodeName;
            if (name.startsWith("data-")) {
                dataset[name.slice(5)] = elmAttrs[i].nodeValue || "";
            }
            else if (name !== "id" && name !== "class") {
                attrs[name] = elmAttrs[i].nodeValue;
            }
        }
        for (i = 0, n = elmChildren.length; i < n; i++) {
            children.push(toVNode(elmChildren[i], domApi));
        }
        if (Object.keys(attrs).length > 0)
            data.attrs = attrs;
        if (Object.keys(dataset).length > 0)
            data.dataset = dataset;
        if (sel.startsWith("svg") &&
            (sel.length === 3 || sel[3] === "." || sel[3] === "#")) {
            addNS(data, children, sel);
        }
        return vnode(sel, data, children, undefined, node);
    }
    else if (api.isText(node)) {
        text = api.getTextContent(node);
        return vnode(undefined, undefined, undefined, text, node);
    }
    else if (api.isComment(node)) {
        text = api.getTextContent(node);
        return vnode("!", {}, [], text, node);
    }
    else {
        return vnode("", {}, [], undefined, node);
    }
}
//# sourceMappingURL=tovnode.js.map