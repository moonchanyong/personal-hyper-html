/**
 * {{text node}}, @{{attributenode}}
 * @ko 템플릿 이용, operamini에서 폴리필 필요
 * @class Hhtml
 */
export class Hhtml {
    /**
     *
     *
     * @param {String} template
     * @memberof Hhtml
     */
    constructor(template = "") {
        this._template = document.createElement('template');
        this.termplate = template;
        
    }

    get template() {
        return this._template.content;
    }
    set template(t) {
        this._template.innerHTML = t;
        this.bindedData = {};
        this.bindedData = this._parseBindingTemplate(t);
    }
    
    /**
     * @ko return binded node like object
     *
     * @param {String} template
     * @memberof Hhtml
     */
    _parseBindingTemplate(template) {
        const ret = {text: {}, attr:{}};
        let splitedTemlplate = template;
        let openSynyaxIdx = splitedTemlplate.indexOf("{{");

        while(openSynyaxIdx > 0) {
            const closeSyntaxIdx = splitedTemlplate.indexOf("}}");
            const KEY_START_IDX = openSynyaxIdx+2;
            const NEXT_TEMPLATE_IDX = closeSyntaxIdx+2;
            let checkAttributeBind = false;
            
            if (closeSyntaxIdx < 0) throw new Error("Syntax is not valid");
            if (openSynyaxIdx - 1 > 0 && splitedTemlplate[openSynyaxIdx - 1] === '@') checkAttributeBind = true;
            
            const key = splitedTemlplate.slice(KEY_START_IDX, closeSyntaxIdx).trim();

            if (checkAttributeBind) {
                const attribute = splitedTemlplate.slice(0, NEXT_TEMPLATE_IDX)
                    .split(" ")
                    .find((item) => item.indexOf(`@{{${key}}}`) >= 0)
                    .split('=')[0];

                ret.attr[key] = attribute;
            } else {
                ret.text[key] = undefined;  
            }
            splitedTemlplate = splitedTemlplate.slice(NEXT_TEMPLATE_IDX);
            openSynyaxIdx = splitedTemlplate.indexOf("{{");
        }
        return ret;
    }

    
    _parseNode(currNode, [attr = [], text = []]) {
        let attrLen = attr.length;
        if(currNode.getAttribute)
        for (let idx = 0 ; idx < attrLen ; idx += 1) {
            if (currNode.getAttribute(this.bindedData.attr[attr[idx]]) === attr[idx]) {
                this.bindedData.attr[attr[idx]] = currNode;
                attr.splice(idx, 1);
                idx -= 1;
                attrLen -= 1;
            }
        };
        if(text.length) {
            let textLen = text.length;
            if(currNode.data)
                for (let idx = 0 ; idx < textLen ; idx += 1) {
                    const BINDING_DATA_TEXT_IDX = currNode.data.indexOf(`{{${text[idx]}}}`);
                    if (BINDING_DATA_TEXT_IDX >= 0) {
                        currNode.splitText(BINDING_DATA_TEXT_IDX + `{{${text[idx]}}}`.length);
                        currNode.splitText(BINDING_DATA_TEXT_IDX);
                        this.bindedData.text[text[idx]] = currNode.nextSibling;
                        text.splice(idx, 1);
                        idx -= 1;
                        textLen -= 1;
                    }
                };
        }

        if(!attr.length && !text.length) return;
        for (const node of currNode.childNodes) {
            console.log(text, node);
            this._parseNode(node, [attr, text]);
        }
    }
    
    attach(DOMElemnt) {
        const node = document.importNode(this.template.firstElementChild, true);
        DOMElemnt.appendChild(node);
        this._parseNode(node, [Object.keys(this.bindedData.attr), Object.keys(this.bindedData.text)]);
    }
}

window.Hhtml = new Hhtml('<div>hello {{name}}</div>');