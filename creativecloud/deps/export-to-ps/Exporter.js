import{s as U,T,x as B,i as z,l as K,n as j,dataURLToBlob as I}from"./FTResponsiveContainer.js";import{openInPsWeb as V}from"./OpenInPsWeb.js";const F="0.42.2",C=new Set,G=()=>{const n=document.documentElement.dir==="rtl"?document.documentElement.dir:"ltr";C.forEach(t=>{t.setAttribute("dir",n)})},H=new MutationObserver(G);H.observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]});const W=n=>typeof n.startManagingContentDirection<"u"||n.tagName==="SP-THEME";function q(n){class t extends n{get isLTR(){return this.dir==="ltr"}hasVisibleFocusInTree(){const e=((a=document)=>{var s;let i=a.activeElement;for(;i!=null&&i.shadowRoot&&i.shadowRoot.activeElement;)i=i.shadowRoot.activeElement;const u=i?[i]:[];for(;i;){const l=i.assignedSlot||i.parentElement||((s=i.getRootNode())==null?void 0:s.host);l&&u.push(l),i=l}return u})(this.getRootNode())[0];if(!e)return!1;try{return e.matches(":focus-visible")||e.matches(".focus-visible")}catch{return e.matches(".focus-visible")}}connectedCallback(){if(!this.hasAttribute("dir")){let e=this.assignedSlot||this.parentNode;for(;e!==document.documentElement&&!W(e);)e=e.assignedSlot||e.parentNode||e.host;if(this.dir=e.dir==="rtl"?e.dir:this.dir||"ltr",e===document.documentElement)C.add(this);else{const{localName:a}=e;a.search("-")>-1&&!customElements.get(a)?customElements.whenDefined(a).then(()=>{e.startManagingContentDirection(this)}):e.startManagingContentDirection(this)}this._dirParent=e}super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback(),this._dirParent&&(this._dirParent===document.documentElement?C.delete(this):this._dirParent.stopManagingContentDirection(this),this.removeAttribute("dir"))}}return t}class L extends q(U){}L.VERSION=F;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const S={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},M=n=>(...t)=>({_$litDirective$:n,values:t});class N{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,r,e){this._$Ct=t,this._$AM=r,this._$Ci=e}_$AS(t,r){return this.update(t,r)}update(t,r){return this.render(...r)}}/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const J=M(class extends N{constructor(n){var t;if(super(n),n.type!==S.ATTRIBUTE||n.name!=="class"||((t=n.strings)===null||t===void 0?void 0:t.length)>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(n){return" "+Object.keys(n).filter(t=>n[t]).join(" ")+" "}update(n,[t]){var r,e;if(this.it===void 0){this.it=new Set,n.strings!==void 0&&(this.nt=new Set(n.strings.join(" ").split(/\s/).filter(s=>s!=="")));for(const s in t)t[s]&&!(!((r=this.nt)===null||r===void 0)&&r.has(s))&&this.it.add(s);return this.render(t)}const a=n.element.classList;this.it.forEach(s=>{s in t||(a.remove(s),this.it.delete(s))});for(const s in t){const i=!!t[s];i===this.it.has(s)||!((e=this.nt)===null||e===void 0)&&e.has(s)||(i?(a.add(s),this.it.add(s)):(a.remove(s),this.it.delete(s)))}return T}});/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const P="important",Q=" !"+P,Y=M(class extends N{constructor(n){var t;if(super(n),n.type!==S.ATTRIBUTE||n.name!=="style"||((t=n.strings)===null||t===void 0?void 0:t.length)>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(n){return Object.keys(n).reduce((t,r)=>{const e=n[r];return e==null?t:t+`${r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${e};`},"")}update(n,[t]){const{style:r}=n.element;if(this.ht===void 0){this.ht=new Set;for(const e in t)this.ht.add(e);return this.render(t)}this.ht.forEach(e=>{t[e]==null&&(this.ht.delete(e),e.includes("-")?r.removeProperty(e):r[e]="")});for(const e in t){const a=t[e];if(a!=null){this.ht.add(e);const s=typeof a=="string"&&a.endsWith(Q);e.includes("-")||s?r.setProperty(e,s?a.slice(0,-11):a,s?P:""):r[e]=a}}return T}});var Z=Object.defineProperty,X=Object.getOwnPropertyDescriptor,E=(n,t,r,e)=>{for(var a=e>1?void 0:e?X(t,r):t,s=n.length-1,i;s>=0;s--)(i=n[s])&&(a=(e?i(t,r,a):i(a))||a);return e&&a&&Z(t,r,a),a};function D(n,t,r,e,a){const s=e/t,i=a/r;return n==="contain"?Math.min(s,i):n==="cover"?Math.max(s,i):1}class _ extends L{constructor(){super(...arguments),this.width=100,this.height=100,this.fit="contain",this.checkerboard=!1,this.resizeObserver=new ResizeObserver(()=>{this.requestUpdate()})}connectedCallback(){super.connectedCallback(),this.resizeObserver.observe(this)}disconnectedCallback(){this.resizeObserver.unobserve(this),super.disconnectedCallback()}render(){let t=1,r={};const e=this.getBoundingClientRect();e.width&&e.height&&this.width&&this.height&&(t=D(this.fit,this.width,this.height,e.width,e.height),r={width:`${this.width}px`,height:`${this.height}px`,scale:t});const a=20/t,s={...r,"background-size":`${a}px ${a}px`,"background-position":`0 0, 0 ${a/2}px, ${a/2}px -${a/2}px, -${a/2}px 0px`},i={checkerboard:this.checkerboard};return B`
      <div
        id="canvas"
        class=${J(i)}
        style=${Y(s)}
      >
        <slot
          @slotchange=${()=>this.dispatchEvent(new CustomEvent("ft-playground-layerchange",{bubbles:!0,cancelable:!0,composed:!0}))}
        ></slot>
      </div>
    `}}_.styles=[z`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
      }

      #canvas {
        position: absolute;
        overflow: hidden;

        transition-property: background-color, background-image;
        transition-duration: 250ms;
        transition-timing-function: ease-in-out;
      }

      .checkerboard {
        transition-property: background-color, background-image;
        transition-duration: 250ms;
        transition-timing-function: ease-in-out;

        background-color: var(
          --spectrum-colorcontrol-checkerboard-light-color,
          var(--spectrum-global-color-static-white)
        );
        background-image: linear-gradient(
            -45deg,
            transparent 75.5%,
            var(
                --spectrum-colorcontrol-checkerboard-dark-color,
                var(--spectrum-global-color-static-gray-300)
              )
              75.5%
          ),
          linear-gradient(
            45deg,
            transparent 75.5%,
            var(
                --spectrum-colorcontrol-checkerboard-dark-color,
                var(--spectrum-global-color-static-gray-300)
              )
              75.5%
          ),
          linear-gradient(
            -45deg,
            var(
                --spectrum-colorcontrol-checkerboard-dark-color,
                var(--spectrum-global-color-static-gray-300)
              )
              25.5%,
            transparent 25.5%
          ),
          linear-gradient(
            45deg,
            var(
                --spectrum-colorcontrol-checkerboard-dark-color,
                var(--spectrum-global-color-static-gray-300)
              )
              25.5%,
            transparent 25.5%
          );
        background-size: 20px 20px;
        background-position:
          0 0,
          0 10px,
          10px -10px,
          -10px 0px;
      }

      ::slotted(*) {
        position: absolute;
        display: inline-block;
      }

      ::slotted(img) {
        display: block;
        line-height: 0;
      }
    `],E([K({selector:"img",flatten:!0})],_.prototype,"images",2),E([j({type:Number})],_.prototype,"width",2),E([j({type:Number})],_.prototype,"height",2),E([j()],_.prototype,"fit",2),E([j({type:Boolean})],_.prototype,"checkerboard",2);function tt(n){return{_obj:"set",_target:[{_enum:"ordinal",_ref:"layer",_value:"targetEnum"}],to:{_obj:"layer",name:n}}}function et(n){return{_obj:"delete",_target:[{_enum:"ordinal",_ref:"layer",_value:"targetEnum"}],layerID:[n]}}function nt(){return{_obj:"make",at:{_enum:"channel",_ref:"channel",_value:"mask"},new:{_class:"channel"},using:{_enum:"userMaskEnabled",_value:"revealAll"}}}function rt(){return{_obj:"select",_target:[{_enum:"channel",_ref:"channel",_value:"mask"}],makeVisible:!0}}function at(){return{_obj:"select",_target:[{_enum:"channel",_ref:"channel",_value:"RGB"}],makeVisible:!1}}function O(n){return{_obj:"set",_target:[{_property:"selection",_ref:"channel"}],to:{_enum:"ordinal",_value:n}}}function st(){return O("none")}function it(){return O("allEnum")}function ot(){return{_obj:"copyEvent",copyHint:"pixels"}}function ct(){return{_obj:"paste",antiAlias:{_enum:"antiAliasType",_value:"antiAliasNone"},as:{_class:"pixel"}}}function lt(n){let t;switch(n){case"brightnessContrast":{t={_obj:"brightnessEvent",useLegacy:!1};break}case"hueSaturation":{t={_obj:"hueSaturation",colorize:!1,presetKind:{_enum:"presetKindType",_value:"presetKindDefault"}};break}default:throw new Error(`unhandled adjustment layer type '${n}'`)}return{_obj:"make",_target:[{_ref:"adjustmentLayer"}],using:{_obj:"adjustmentLayer",type:t}}}function ut(){return{_obj:"groupEvent",_target:[{_enum:"ordinal",_ref:"layer",_value:"targetEnum"}]}}function dt(n,t,r){let e;switch(n){case"brightnessContrast":{e={_obj:"brightnessEvent",brightness:t,center:r,useLegacy:!1};break}case"hueSaturation":{e={_obj:"hueSaturation",adjustment:[{_obj:"hueSatAdjustmentV2",hue:t,lightness:0,saturation:r}],presetKind:{_enum:"presetKindType",_value:"presetKindCustom"}};break}default:throw new Error(`unhandled adjustment layer type '${n}'`)}return{_obj:"set",_target:[{_enum:"ordinal",_ref:"adjustmentLayer",_value:"targetEnum"}],to:e}}function ht(n,t){return{ID:n,_obj:"placeEvent",freeTransformCenterState:{_enum:"quadCenterState",_value:"QCSAverage"},null:{_kind:"local",_path:t},offset:{_obj:"offset",horizontal:{_unit:"pixelsUnit",_value:0},vertical:{_unit:"pixelsUnit",_value:0}},replaceLayer:{_obj:"placeEvent",to:{_id:n,_ref:"layer"}}}}var c={renameCurrentLayer:tt,deleteLayer:et,createMask:nt,selectMaskChannel:rt,selectRGBChannel:at,deselectAll:st,selectAll:it,copyPixels:ot,pastePixels:ct,makeAdjustmentLayer:lt,makeClippingLayer:ut,setAdjustment:dt,placeAction:ht};function mt(n){return[c.selectAll(),c.copyPixels(),c.deleteLayer(n),c.createMask(),c.selectMaskChannel(),c.pastePixels(),c.selectRGBChannel(),c.deselectAll()]}async function $(n,t,r,e,a=!1){const s=t.naturalWidth,i=t.naturalHeight,u=D(n,s,i,r,e),l=document.createElement("canvas");l.width=r,l.height=e;const b=l.getContext("2d");if(!b)throw new Error("could not get 2d context");b.fillStyle="black",b.fillRect(0,0,r,e);const o=s*u,h=i*u,w=(r-o)/2,x=(e-h)/2;let y=t;if(a){const f=document.createElement("img"),v=t.style.maskImage;f.src=v.substring(5,v.length-2),await new Promise(k=>{f.onload=()=>{k()}}),y=f}return b.drawImage(y,0,0,s,i,w,x,o,h),l.toDataURL("image/png")}class pt{constructor(t){this.commands=[],this.fileIdx=0,this.canvas=t}renameCurrentLayer(t){this.commands.push(c.renameCurrentLayer(t))}addMaskToCurrent(){const t=this.placeAction();this.commands.push(...mt(t))}placeAction(){const t=this.fileIdx+2;return this.commands.push(c.placeAction(t,`PEGASUS_ACTION_JSON_OPTIONS_ADDITIONAL_IMAGES_${this.fileIdx}`)),this.fileIdx+=1,t}addAdjustmentLayer(t,r,e){this.commands.push(c.makeAdjustmentLayer(t),c.makeClippingLayer(),c.setAdjustment(t,r,e))}async getData(){const t=[],{children:r}=this.canvas;for(let o=0;o<r.length;o+=1){const h=r[o];h instanceof HTMLImageElement&&t.push(h)}if(t.length===0)throw new Error("no images");const e=[];let a=!0;const s=this.canvas.getAttribute("width"),i=this.canvas.getAttribute("height");if(!s||!i)throw new Error("canvas requires 'width' and 'height' attributes");const u=parseInt(s,10),l=parseInt(i,10),b=t.map(async(o,h)=>{if(o.style.display==="none")return;const w=o.style.objectFit,x=await $(w,o,u,l),y=I(x),f=y.type.substring(6),v=o.dataset.filename||o.src.replace(/^.*[\\/]/,"")||`Image_${h}.foo`,k=v.substring(0,v.lastIndexOf(".")),R=`${k}.${f}`;if(e.push({filename:R,imageData:y}),a?this.renameCurrentLayer(k):this.placeAction(),a=!1,o.style.maskImage){const m=await $(w,o,u,l,!0),A=I(m),d=`${k}-maskData.${f}`;e.push({filename:d,imageData:A}),this.addMaskToCurrent()}if(o.style.filter){const m=o.style.filter.match(/hue-rotate\((\d+)deg\) saturate\((\d+)%\) brightness\((\d+)%\) contrast\((\d+)%\)/);if(m){const A=Number.parseInt(m[1],10);let d=Number.parseInt(m[2],10);(A!==0||d!==100)&&(d<=100?d-=100:d=(d-100)/2,this.addAdjustmentLayer("hueSaturation",A,d));let p=Number.parseInt(m[3],10),g=Number.parseInt(m[4],10);(p!==100||g!==100)&&(p<=100?p=(p-100)*3:p=(p-100)*1.5,g<=100?g=(g-100)/15*50:g=(g-100)*2,this.addAdjustmentLayer("brightnessContrast",p,g))}}});return await Promise.all(b),{fileData:e,actionJSON:this.commands}}}async function gt(n,t){const r=new pt(n),{fileData:e,actionJSON:a}=await r.getData();await V(t,"Try Photoshop",e,a)}export{$ as bakeFit,gt as exportToPsWeb};
