// Wed, 29 Nov 2023 16:06:11 GMT
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn2, res) => function __init() {
  return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/@spectrum-web-components/base/src/version.js
var version;
var init_version = __esm({
  "../../node_modules/@spectrum-web-components/base/src/version.js"() {
    version = "0.39.4";
  }
});

// ../../node_modules/@spectrum-web-components/base/src/Base.js
import { LitElement as u2 } from "./lit-all.min.js";
function SpectrumMixin(s2) {
  class o6 extends s2 {
    get isLTR() {
      return this.dir === "ltr";
    }
    hasVisibleFocusInTree() {
      const n5 = ((r2 = document) => {
        var l4;
        let t4 = r2.activeElement;
        for (; t4 != null && t4.shadowRoot && t4.shadowRoot.activeElement; )
          t4 = t4.shadowRoot.activeElement;
        const a5 = t4 ? [t4] : [];
        for (; t4; ) {
          const i3 = t4.assignedSlot || t4.parentElement || ((l4 = t4.getRootNode()) == null ? void 0 : l4.host);
          i3 && a5.push(i3), t4 = i3;
        }
        return a5;
      })(this.getRootNode())[0];
      if (!n5)
        return false;
      try {
        return n5.matches(":focus-visible") || n5.matches(".focus-visible");
      } catch (r2) {
        return n5.matches(".focus-visible");
      }
    }
    connectedCallback() {
      if (!this.hasAttribute("dir")) {
        let e4 = this.assignedSlot || this.parentNode;
        for (; e4 !== document.documentElement && !h2(e4); )
          e4 = e4.assignedSlot || e4.parentNode || e4.host;
        if (this.dir = e4.dir === "rtl" ? e4.dir : this.dir || "ltr", e4 === document.documentElement)
          c2.add(this);
        else {
          const { localName: n5 } = e4;
          n5.search("-") > -1 && !customElements.get(n5) ? customElements.whenDefined(n5).then(() => {
            e4.startManagingContentDirection(this);
          }) : e4.startManagingContentDirection(this);
        }
        this._dirParent = e4;
      }
      super.connectedCallback();
    }
    disconnectedCallback() {
      super.disconnectedCallback(), this._dirParent && (this._dirParent === document.documentElement ? c2.delete(this) : this._dirParent.stopManagingContentDirection(this), this.removeAttribute("dir"));
    }
  }
  return o6;
}
var c2, w2, p2, h2, SpectrumElement;
var init_Base = __esm({
  "../../node_modules/@spectrum-web-components/base/src/Base.js"() {
    "use strict";
    init_version();
    c2 = /* @__PURE__ */ new Set();
    w2 = () => {
      const s2 = document.documentElement.dir === "rtl" ? document.documentElement.dir : "ltr";
      c2.forEach((o6) => {
        o6.setAttribute("dir", s2);
      });
    };
    p2 = new MutationObserver(w2);
    p2.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    h2 = (s2) => typeof s2.startManagingContentDirection != "undefined" || s2.tagName === "SP-THEME";
    SpectrumElement = class extends SpectrumMixin(u2) {
    };
    SpectrumElement.VERSION = version;
  }
});

// ../../node_modules/@spectrum-web-components/base/src/sizedMixin.js
import { property as S2 } from "./lit-all.min.js";
function SizedMixin(n5, { validSizes: i3 = ["s", "m", "l", "xl"], noDefaultSize: s2, defaultSize: t4 = "m" } = {}) {
  class e4 extends n5 {
    constructor() {
      super(...arguments);
      this._size = t4;
    }
    get size() {
      return this._size || t4;
    }
    set size(r2) {
      const c5 = s2 ? null : t4, z2 = r2 && r2.toLocaleLowerCase(), x2 = i3.includes(z2) ? z2 : c5;
      if (x2 && this.setAttribute("size", x2), this._size === x2)
        return;
      const p5 = this._size;
      this._size = x2, this.requestUpdate("size", p5);
    }
    update(r2) {
      !this.hasAttribute("size") && !s2 && this.setAttribute("size", this.size), super.update(r2);
    }
  }
  return m2([S2({ type: String, reflect: true })], e4.prototype, "size", 1), e4;
}
var a2, u3, m2, ElementSizes;
var init_sizedMixin = __esm({
  "../../node_modules/@spectrum-web-components/base/src/sizedMixin.js"() {
    "use strict";
    a2 = Object.defineProperty;
    u3 = Object.getOwnPropertyDescriptor;
    m2 = (n5, i3, s2, t4) => {
      for (var e4 = t4 > 1 ? void 0 : t4 ? u3(i3, s2) : i3, l4 = n5.length - 1, o6; l4 >= 0; l4--)
        (o6 = n5[l4]) && (e4 = (t4 ? o6(i3, s2, e4) : o6(e4)) || e4);
      return t4 && e4 && a2(i3, s2, e4), e4;
    };
    ElementSizes = { xxs: "xxs", xs: "xs", s: "s", m: "m", l: "l", xl: "xl", xxl: "xxl" };
  }
});

// ../../node_modules/@spectrum-web-components/base/src/index.js
var src_exports = {};
__export(src_exports, {
  ElementSizes: () => ElementSizes,
  SizedMixin: () => SizedMixin,
  SpectrumElement: () => SpectrumElement,
  SpectrumMixin: () => SpectrumMixin
});
import * as lit_star from "./lit-all.min.js";
var init_src = __esm({
  "../../node_modules/@spectrum-web-components/base/src/index.js"() {
    "use strict";
    init_Base();
    init_sizedMixin();
    __reExport(src_exports, lit_star);
  }
});

// ../../node_modules/@spectrum-web-components/base/src/decorators.js
var decorators_exports = {};
import * as decorators_star from "./lit-all.min.js";
var init_decorators = __esm({
  "../../node_modules/@spectrum-web-components/base/src/decorators.js"() {
    "use strict";
    __reExport(decorators_exports, decorators_star);
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/platform.js
function n2(o6) {
  return typeof window != "undefined" && window.navigator != null ? o6.test(window.navigator.userAgent) : false;
}
function e2(o6) {
  return typeof window != "undefined" && window.navigator != null ? o6.test(window.navigator.platform) : false;
}
function isMac() {
  return e2(/^Mac/);
}
function isIPhone() {
  return e2(/^iPhone/);
}
function isIPad() {
  return e2(/^iPad/) || isMac() && navigator.maxTouchPoints > 1;
}
function isIOS() {
  return isIPhone() || isIPad();
}
function isAndroid() {
  return n2(/Android/);
}
var init_platform = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/platform.js"() {
    "use strict";
  }
});

// ../../node_modules/@spectrum-web-components/reactive-controllers/src/ElementResolution.js
var elementResolverUpdatedSymbol, ElementResolutionController;
var init_ElementResolution = __esm({
  "../../node_modules/@spectrum-web-components/reactive-controllers/src/ElementResolution.js"() {
    "use strict";
    elementResolverUpdatedSymbol = Symbol("element resolver updated");
    ElementResolutionController = class {
      constructor(e4, { selector: t4 } = { selector: "" }) {
        this._element = null;
        this._selector = "";
        this.mutationCallback = (e5) => {
          let t5 = false;
          e5.forEach((s2) => {
            if (!t5) {
              if (s2.type === "childList") {
                const r2 = this.element && [...s2.removedNodes].includes(this.element), l4 = !!this.selector && [...s2.addedNodes].some(this.elementIsSelected);
                t5 = t5 || r2 || l4;
              }
              if (s2.type === "attributes") {
                const r2 = s2.target === this.element, l4 = !!this.selector && this.elementIsSelected(s2.target);
                t5 = t5 || r2 || l4;
              }
            }
          }), t5 && this.resolveElement();
        };
        this.elementIsSelected = (e5) => {
          var t5;
          return this.selectorIsId ? (e5 == null ? void 0 : e5.id) === this.selectorAsId : (t5 = e5 == null ? void 0 : e5.matches) == null ? void 0 : t5.call(e5, this.selector);
        };
        this.host = e4, this.selector = t4, this.observer = new MutationObserver(this.mutationCallback), this.host.addController(this);
      }
      get element() {
        return this._element;
      }
      set element(e4) {
        if (e4 === this.element)
          return;
        const t4 = this.element;
        this._element = e4, this.host.requestUpdate(elementResolverUpdatedSymbol, t4);
      }
      get selector() {
        return this._selector;
      }
      set selector(e4) {
        e4 !== this.selector && (this.releaseElement(), this._selector = e4, this.resolveElement());
      }
      get selectorAsId() {
        return this.selector.slice(1);
      }
      get selectorIsId() {
        return !!this.selector && this.selector.startsWith("#");
      }
      hostConnected() {
        this.resolveElement(), this.observer.observe(this.host.getRootNode(), { subtree: true, childList: true, attributes: true });
      }
      hostDisconnected() {
        this.releaseElement(), this.observer.disconnect();
      }
      resolveElement() {
        if (!this.selector) {
          this.releaseElement();
          return;
        }
        const e4 = this.host.getRootNode();
        this.element = this.selectorIsId ? e4.getElementById(this.selectorAsId) : e4.querySelector(this.selector);
      }
      releaseElement() {
        this.element = null;
      }
    };
  }
});

// ../../node_modules/@spectrum-web-components/base/src/condition-attribute-with-id.js
function conditionAttributeWithoutId(t4, i3, n5) {
  const e4 = t4.getAttribute(i3);
  let r2 = e4 ? e4.split(/\s+/) : [];
  r2 = r2.filter((s2) => !n5.find((o6) => s2 === o6)), r2.length ? t4.setAttribute(i3, r2.join(" ")) : t4.removeAttribute(i3);
}
function conditionAttributeWithId(t4, i3, n5) {
  const e4 = Array.isArray(n5) ? n5 : [n5], r2 = t4.getAttribute(i3), s2 = r2 ? r2.split(/\s+/) : [];
  return e4.every((d3) => s2.indexOf(d3) > -1) ? () => {
  } : (s2.push(...e4), t4.setAttribute(i3, s2.join(" ")), () => conditionAttributeWithoutId(t4, i3, e4));
}
var init_condition_attribute_with_id = __esm({
  "../../node_modules/@spectrum-web-components/base/src/condition-attribute-with-id.js"() {
    "use strict";
  }
});

// ../../node_modules/@spectrum-web-components/base/src/directives.js
import { ifDefined } from "./lit-all.min.js";
import { repeat } from "./lit-all.min.js";
import { classMap } from "./lit-all.min.js";
import { styleMap } from "./lit-all.min.js";
import { until } from "./lit-all.min.js";
import { live } from "./lit-all.min.js";
import { when } from "./lit-all.min.js";
var init_directives = __esm({
  "../../node_modules/@spectrum-web-components/base/src/directives.js"() {
    "use strict";
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/reparent-children.js
function T2(o6, i3, l4 = []) {
  for (let e4 = 0; e4 < i3.length; ++e4) {
    const n5 = i3[e4], r2 = o6[e4], t4 = r2.parentElement || r2.getRootNode();
    l4[e4] && l4[e4](n5), t4 && t4 !== r2 && t4.replaceChild(n5, r2), delete o6[e4];
  }
  return i3;
}
var reparentChildren;
var init_reparent_children = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/reparent-children.js"() {
    "use strict";
    reparentChildren = (o6, i3, { position: l4, prepareCallback: e4 } = { position: "beforeend" }) => {
      let { length: n5 } = o6;
      if (n5 === 0)
        return () => o6;
      let r2 = 1, t4 = 0;
      (l4 === "afterbegin" || l4 === "afterend") && (r2 = -1, t4 = n5 - 1);
      const a5 = new Array(n5), c5 = new Array(n5), p5 = document.createComment("placeholder for reparented element");
      do {
        const d3 = o6[t4];
        e4 && (c5[t4] = e4(d3)), a5[t4] = p5.cloneNode();
        const m4 = d3.parentElement || d3.getRootNode();
        m4 && m4 !== d3 && m4.replaceChild(a5[t4], d3), i3.insertAdjacentElement(l4, d3), t4 += r2;
      } while (--n5 > 0);
      return function() {
        return T2(a5, o6, c5);
      };
    };
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/overlay-timer.js
var OverlayTimer;
var init_overlay_timer = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/overlay-timer.js"() {
    "use strict";
    OverlayTimer = class {
      constructor(e4 = {}) {
        this.warmUpDelay = 1e3;
        this.coolDownDelay = 1e3;
        this.isWarm = false;
        this.timeout = 0;
        Object.assign(this, e4);
      }
      async openTimer(e4) {
        if (this.cancelCooldownTimer(), !this.component || e4 !== this.component)
          return this.component && (this.close(this.component), this.cancelCooldownTimer()), this.component = e4, this.isWarm ? false : (this.promise = new Promise((o6) => {
            this.resolve = o6, this.timeout = window.setTimeout(() => {
              this.resolve && (this.resolve(false), this.isWarm = true);
            }, this.warmUpDelay);
          }), this.promise);
        if (this.promise)
          return this.promise;
        throw new Error("Inconsistent state");
      }
      close(e4) {
        this.component && this.component === e4 && (this.resetCooldownTimer(), this.timeout > 0 && (clearTimeout(this.timeout), this.timeout = 0), this.resolve && (this.resolve(true), delete this.resolve), delete this.promise, delete this.component);
      }
      resetCooldownTimer() {
        this.isWarm && (this.cooldownTimeout && window.clearTimeout(this.cooldownTimeout), this.cooldownTimeout = window.setTimeout(() => {
          this.isWarm = false, delete this.cooldownTimeout;
        }, this.coolDownDelay));
      }
      cancelCooldownTimer() {
        this.cooldownTimeout && window.clearTimeout(this.cooldownTimeout), delete this.cooldownTimeout;
      }
    };
  }
});

// ../../node_modules/@spectrum-web-components/base/src/define-element.js
function defineElement(e4, n5) {
  window.__swc, customElements.define(e4, n5);
}
var init_define_element = __esm({
  "../../node_modules/@spectrum-web-components/base/src/define-element.js"() {
    "use strict";
  }
});

// ../../node_modules/@spectrum-web-components/overlay/sp-overlay.js
var sp_overlay_exports = {};
var init_sp_overlay = __esm({
  "../../node_modules/@spectrum-web-components/overlay/sp-overlay.js"() {
    "use strict";
    init_define_element();
    init_Overlay();
    defineElement("sp-overlay", Overlay);
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/AbstractOverlay.js
function nextFrame() {
  return new Promise((o6) => requestAnimationFrame(() => o6()));
}
function forcePaint() {
  document.body.offsetHeight;
}
var overlayTimer, noop, BeforetoggleClosedEvent, BeforetoggleOpenEvent, guaranteedAllTransitionend, AbstractOverlay;
var init_AbstractOverlay = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/AbstractOverlay.js"() {
    "use strict";
    init_src();
    init_reparent_children();
    init_overlay_timer();
    overlayTimer = new OverlayTimer();
    noop = () => {
    };
    BeforetoggleClosedEvent = class extends Event {
      constructor() {
        super("beforetoggle", { bubbles: false, composed: false });
        this.currentState = "open";
        this.newState = "closed";
      }
    };
    BeforetoggleOpenEvent = class extends Event {
      constructor() {
        super("beforetoggle", { bubbles: false, composed: false });
        this.currentState = "closed";
        this.newState = "open";
      }
    };
    guaranteedAllTransitionend = (o6, d3, t4) => {
      const a5 = new AbortController(), n5 = /* @__PURE__ */ new Map(), c5 = () => {
        a5.abort(), t4();
      };
      let u7, s2;
      const e4 = requestAnimationFrame(() => {
        u7 = requestAnimationFrame(() => {
          s2 = requestAnimationFrame(() => {
            c5();
          });
        });
      }), m4 = (r2) => {
        r2.target === o6 && (n5.set(r2.propertyName, n5.get(r2.propertyName) - 1), n5.get(r2.propertyName) || n5.delete(r2.propertyName), n5.size === 0 && c5());
      }, y2 = (r2) => {
        r2.target === o6 && (n5.has(r2.propertyName) || n5.set(r2.propertyName, 0), n5.set(r2.propertyName, n5.get(r2.propertyName) + 1), cancelAnimationFrame(e4), cancelAnimationFrame(u7), cancelAnimationFrame(s2));
      };
      o6.addEventListener("transitionrun", y2, { signal: a5.signal }), o6.addEventListener("transitionend", m4, { signal: a5.signal }), o6.addEventListener("transitioncancel", m4, { signal: a5.signal }), d3();
    };
    AbstractOverlay = class extends SpectrumElement {
      constructor() {
        super(...arguments);
        this.dispose = noop;
        this.offset = 6;
        this.willPreventClose = false;
      }
      async applyFocus(t4, a5) {
      }
      get delayed() {
        return false;
      }
      set delayed(t4) {
      }
      async ensureOnDOM(t4) {
      }
      async makeTransition(t4) {
        return null;
      }
      async manageDelay(t4) {
      }
      async manageDialogOpen() {
      }
      async managePopoverOpen() {
      }
      managePosition() {
      }
      get open() {
        return false;
      }
      set open(t4) {
      }
      get state() {
        return "closed";
      }
      set state(t4) {
      }
      manuallyKeepOpen() {
      }
      static update() {
        const t4 = new CustomEvent("sp-update-overlays", { bubbles: true, composed: true, cancelable: true });
        document.dispatchEvent(t4);
      }
      static async open(t4, a5, n5, c5) {
        var g2, b3, f3, O2;
        await Promise.resolve().then(() => (init_sp_overlay(), sp_overlay_exports));
        const u7 = arguments.length === 2, s2 = n5 || t4, e4 = new this();
        let m4 = false;
        e4.dispose = () => {
          e4.addEventListener("sp-closed", () => {
            m4 || (y2(), m4 = true), requestAnimationFrame(() => {
              e4.remove();
            });
          }), e4.open = false, e4.dispose = noop;
        };
        const y2 = reparentChildren([s2], e4, { position: "beforeend", prepareCallback: (i3) => {
          const v2 = i3.slot;
          return i3.removeAttribute("slot"), () => {
            i3.slot = v2;
          };
        } });
        if (!u7 && s2 && c5) {
          const i3 = t4, v2 = a5, p5 = c5;
          return e4.delayed = p5.delayed || s2.hasAttribute("delayed"), e4.receivesFocus = (g2 = p5.receivesFocus) != null ? g2 : "auto", e4.triggerElement = p5.virtualTrigger || i3, e4.type = v2 === "modal" ? "modal" : v2 === "hover" ? "hint" : "auto", e4.offset = (b3 = p5.offset) != null ? b3 : 6, e4.placement = p5.placement, e4.willPreventClose = !!p5.notImmediatelyClosable, i3.insertAdjacentElement("afterend", e4), await e4.updateComplete, e4.open = true, e4.dispose;
        }
        const l4 = a5;
        return e4.append(s2), e4.delayed = l4.delayed || s2.hasAttribute("delayed"), e4.receivesFocus = (f3 = l4.receivesFocus) != null ? f3 : "auto", e4.triggerElement = l4.trigger || null, e4.type = l4.type || "modal", e4.offset = (O2 = l4.offset) != null ? O2 : 6, e4.placement = l4.placement, e4.willPreventClose = !!l4.notImmediatelyClosable, e4.updateComplete.then(() => {
          e4.open = true;
        }), e4;
      }
    };
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/focusable-selectors.js
var e3, o2, userFocusableSelector, focusableSelector;
var init_focusable_selectors = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/focusable-selectors.js"() {
    "use strict";
    e3 = ["button", "[focusable]", "[href]", "input", "label", "select", "textarea", "[tabindex]"];
    o2 = ':not([tabindex="-1"])';
    userFocusableSelector = e3.join(`${o2}, `) + o2;
    focusableSelector = e3.join(", ");
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/first-focusable-in.js
var firstFocusableIn, firstFocusableSlottedIn;
var init_first_focusable_in = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/first-focusable-in.js"() {
    "use strict";
    init_focusable_selectors();
    firstFocusableIn = (e4) => e4.querySelector(userFocusableSelector);
    firstFocusableSlottedIn = (e4) => e4.assignedElements().find((o6) => o6.matches(userFocusableSelector));
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/VirtualTrigger.js
var VirtualTrigger;
var init_VirtualTrigger = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/VirtualTrigger.js"() {
    "use strict";
    init_AbstractOverlay();
    VirtualTrigger = class {
      constructor(t4, i3) {
        this.x = 0;
        this.y = 0;
        this.x = t4, this.y = i3;
      }
      updateBoundingClientRect(t4, i3) {
        this.x = t4, this.y = i3, AbstractOverlay.update();
      }
      getBoundingClientRect() {
        return { width: 0, height: 0, top: this.y, right: this.x, y: this.y, x: this.x, bottom: this.y, left: this.x, toJSON() {
        } };
      }
    };
  }
});

// ../../node_modules/focus-visible/dist/focus-visible.js
var require_focus_visible = __commonJS({
  "../../node_modules/focus-visible/dist/focus-visible.js"(exports2, module2) {
    (function(global2, factory) {
      typeof exports2 === "object" && typeof module2 !== "undefined" ? factory() : typeof define === "function" && define.amd ? define(factory) : factory();
    })(exports2, function() {
      "use strict";
      function applyFocusVisiblePolyfill(scope) {
        var hadKeyboardEvent = true;
        var hadFocusVisibleRecently = false;
        var hadFocusVisibleRecentlyTimeout = null;
        var inputTypesAllowlist = {
          text: true,
          search: true,
          url: true,
          tel: true,
          email: true,
          password: true,
          number: true,
          date: true,
          month: true,
          week: true,
          time: true,
          datetime: true,
          "datetime-local": true
        };
        function isValidFocusTarget(el2) {
          if (el2 && el2 !== document && el2.nodeName !== "HTML" && el2.nodeName !== "BODY" && "classList" in el2 && "contains" in el2.classList) {
            return true;
          }
          return false;
        }
        function focusTriggersKeyboardModality(el2) {
          var type = el2.type;
          var tagName = el2.tagName;
          if (tagName === "INPUT" && inputTypesAllowlist[type] && !el2.readOnly) {
            return true;
          }
          if (tagName === "TEXTAREA" && !el2.readOnly) {
            return true;
          }
          if (el2.isContentEditable) {
            return true;
          }
          return false;
        }
        function addFocusVisibleClass(el2) {
          if (el2.classList.contains("focus-visible")) {
            return;
          }
          el2.classList.add("focus-visible");
          el2.setAttribute("data-focus-visible-added", "");
        }
        function removeFocusVisibleClass(el2) {
          if (!el2.hasAttribute("data-focus-visible-added")) {
            return;
          }
          el2.classList.remove("focus-visible");
          el2.removeAttribute("data-focus-visible-added");
        }
        function onKeyDown(e4) {
          if (e4.metaKey || e4.altKey || e4.ctrlKey) {
            return;
          }
          if (isValidFocusTarget(scope.activeElement)) {
            addFocusVisibleClass(scope.activeElement);
          }
          hadKeyboardEvent = true;
        }
        function onPointerDown(e4) {
          hadKeyboardEvent = false;
        }
        function onFocus(e4) {
          if (!isValidFocusTarget(e4.target)) {
            return;
          }
          if (hadKeyboardEvent || focusTriggersKeyboardModality(e4.target)) {
            addFocusVisibleClass(e4.target);
          }
        }
        function onBlur(e4) {
          if (!isValidFocusTarget(e4.target)) {
            return;
          }
          if (e4.target.classList.contains("focus-visible") || e4.target.hasAttribute("data-focus-visible-added")) {
            hadFocusVisibleRecently = true;
            window.clearTimeout(hadFocusVisibleRecentlyTimeout);
            hadFocusVisibleRecentlyTimeout = window.setTimeout(function() {
              hadFocusVisibleRecently = false;
            }, 100);
            removeFocusVisibleClass(e4.target);
          }
        }
        function onVisibilityChange(e4) {
          if (document.visibilityState === "hidden") {
            if (hadFocusVisibleRecently) {
              hadKeyboardEvent = true;
            }
            addInitialPointerMoveListeners();
          }
        }
        function addInitialPointerMoveListeners() {
          document.addEventListener("mousemove", onInitialPointerMove);
          document.addEventListener("mousedown", onInitialPointerMove);
          document.addEventListener("mouseup", onInitialPointerMove);
          document.addEventListener("pointermove", onInitialPointerMove);
          document.addEventListener("pointerdown", onInitialPointerMove);
          document.addEventListener("pointerup", onInitialPointerMove);
          document.addEventListener("touchmove", onInitialPointerMove);
          document.addEventListener("touchstart", onInitialPointerMove);
          document.addEventListener("touchend", onInitialPointerMove);
        }
        function removeInitialPointerMoveListeners() {
          document.removeEventListener("mousemove", onInitialPointerMove);
          document.removeEventListener("mousedown", onInitialPointerMove);
          document.removeEventListener("mouseup", onInitialPointerMove);
          document.removeEventListener("pointermove", onInitialPointerMove);
          document.removeEventListener("pointerdown", onInitialPointerMove);
          document.removeEventListener("pointerup", onInitialPointerMove);
          document.removeEventListener("touchmove", onInitialPointerMove);
          document.removeEventListener("touchstart", onInitialPointerMove);
          document.removeEventListener("touchend", onInitialPointerMove);
        }
        function onInitialPointerMove(e4) {
          if (e4.target.nodeName && e4.target.nodeName.toLowerCase() === "html") {
            return;
          }
          hadKeyboardEvent = false;
          removeInitialPointerMoveListeners();
        }
        document.addEventListener("keydown", onKeyDown, true);
        document.addEventListener("mousedown", onPointerDown, true);
        document.addEventListener("pointerdown", onPointerDown, true);
        document.addEventListener("touchstart", onPointerDown, true);
        document.addEventListener("visibilitychange", onVisibilityChange, true);
        addInitialPointerMoveListeners();
        scope.addEventListener("focus", onFocus, true);
        scope.addEventListener("blur", onBlur, true);
        if (scope.nodeType === Node.DOCUMENT_FRAGMENT_NODE && scope.host) {
          scope.host.setAttribute("data-js-focus-visible", "");
        } else if (scope.nodeType === Node.DOCUMENT_NODE) {
          document.documentElement.classList.add("js-focus-visible");
          document.documentElement.setAttribute("data-js-focus-visible", "");
        }
      }
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        window.applyFocusVisiblePolyfill = applyFocusVisiblePolyfill;
        var event;
        try {
          event = new CustomEvent("focus-visible-polyfill-ready");
        } catch (error) {
          event = document.createEvent("CustomEvent");
          event.initCustomEvent("focus-visible-polyfill-ready", false, false, {});
        }
        window.dispatchEvent(event);
      }
      if (typeof document !== "undefined") {
        applyFocusVisiblePolyfill(document);
      }
    });
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/focus-visible.js
var i2, FocusVisiblePolyfillMixin;
var init_focus_visible = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/focus-visible.js"() {
    "use strict";
    i2 = true;
    try {
      document.body.querySelector(":focus-visible");
    } catch (a5) {
      i2 = false, Promise.resolve().then(() => __toESM(require_focus_visible(), 1));
    }
    FocusVisiblePolyfillMixin = (a5) => {
      var n5;
      const s2 = (l4) => {
        if (l4.shadowRoot == null || l4.hasAttribute("data-js-focus-visible"))
          return () => {
          };
        if (self.applyFocusVisiblePolyfill)
          self.applyFocusVisiblePolyfill(l4.shadowRoot), l4.manageAutoFocus && l4.manageAutoFocus();
        else {
          const e4 = () => {
            self.applyFocusVisiblePolyfill && l4.shadowRoot && self.applyFocusVisiblePolyfill(l4.shadowRoot), l4.manageAutoFocus && l4.manageAutoFocus();
          };
          return self.addEventListener("focus-visible-polyfill-ready", e4, { once: true }), () => {
            self.removeEventListener("focus-visible-polyfill-ready", e4);
          };
        }
        return () => {
        };
      }, o6 = Symbol("endPolyfillCoordination");
      class t4 extends a5 {
        constructor() {
          super(...arguments);
          this[n5] = null;
        }
        connectedCallback() {
          super.connectedCallback && super.connectedCallback(), i2 || requestAnimationFrame(() => {
            this[o6] == null && (this[o6] = s2(this));
          });
        }
        disconnectedCallback() {
          super.disconnectedCallback && super.disconnectedCallback(), i2 || requestAnimationFrame(() => {
            this[o6] != null && (this[o6](), this[o6] = null);
          });
        }
      }
      return n5 = o6, t4;
    };
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/focusable.js
function d2() {
  return new Promise((s2) => requestAnimationFrame(() => s2()));
}
var u4, b2, n3, Focusable;
var init_focusable = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/focusable.js"() {
    "use strict";
    init_src();
    init_decorators();
    init_focus_visible();
    u4 = Object.defineProperty;
    b2 = Object.getOwnPropertyDescriptor;
    n3 = (s2, a5, e4, t4) => {
      for (var i3 = t4 > 1 ? void 0 : t4 ? b2(a5, e4) : a5, o6 = s2.length - 1, r2; o6 >= 0; o6--)
        (r2 = s2[o6]) && (i3 = (t4 ? r2(a5, e4, i3) : r2(i3)) || i3);
      return t4 && i3 && u4(a5, e4, i3), i3;
    };
    Focusable = class extends FocusVisiblePolyfillMixin(SpectrumElement) {
      constructor() {
        super(...arguments);
        this.disabled = false;
        this.autofocus = false;
        this._tabIndex = 0;
        this.manipulatingTabindex = false;
        this._recentlyConnected = false;
      }
      get tabIndex() {
        if (this.focusElement === this) {
          const t4 = this.hasAttribute("tabindex") ? Number(this.getAttribute("tabindex")) : NaN;
          return isNaN(t4) ? -1 : t4;
        }
        const e4 = parseFloat(this.hasAttribute("tabindex") && this.getAttribute("tabindex") || "0");
        return this.disabled || e4 < 0 ? -1 : this.focusElement ? this.focusElement.tabIndex : e4;
      }
      set tabIndex(e4) {
        if (this.manipulatingTabindex) {
          this.manipulatingTabindex = false;
          return;
        }
        if (this.focusElement === this) {
          if (e4 !== this._tabIndex) {
            this._tabIndex = e4;
            const t4 = this.disabled ? "-1" : "" + e4;
            this.manipulatingTabindex = true, this.setAttribute("tabindex", t4);
          }
          return;
        }
        if (e4 === -1 ? this.addEventListener("pointerdown", this.onPointerdownManagementOfTabIndex) : (this.manipulatingTabindex = true, this.removeEventListener("pointerdown", this.onPointerdownManagementOfTabIndex)), e4 === -1 || this.disabled) {
          this.setAttribute("tabindex", "-1"), this.removeAttribute("focusable"), e4 !== -1 && this.manageFocusElementTabindex(e4);
          return;
        }
        this.setAttribute("focusable", ""), this.hasAttribute("tabindex") ? this.removeAttribute("tabindex") : this.manipulatingTabindex = false, this.manageFocusElementTabindex(e4);
      }
      onPointerdownManagementOfTabIndex() {
        this.tabIndex === -1 && (this.tabIndex = 0, this.focus({ preventScroll: true }));
      }
      async manageFocusElementTabindex(e4) {
        this.focusElement || await this.updateComplete, e4 === null ? this.focusElement.removeAttribute("tabindex") : this.focusElement.tabIndex = e4;
      }
      get focusElement() {
        throw new Error("Must implement focusElement getter!");
      }
      focus(e4) {
        this.disabled || !this.focusElement || (this.focusElement !== this ? this.focusElement.focus(e4) : HTMLElement.prototype.focus.apply(this, [e4]));
      }
      blur() {
        const e4 = this.focusElement || this;
        e4 !== this ? e4.blur() : HTMLElement.prototype.blur.apply(this);
      }
      click() {
        if (this.disabled)
          return;
        const e4 = this.focusElement || this;
        e4 !== this ? e4.click() : HTMLElement.prototype.click.apply(this);
      }
      manageAutoFocus() {
        this.autofocus && (this.dispatchEvent(new KeyboardEvent("keydown", { code: "Tab" })), this.focusElement.focus());
      }
      firstUpdated(e4) {
        super.firstUpdated(e4), (!this.hasAttribute("tabindex") || this.getAttribute("tabindex") !== "-1") && this.setAttribute("focusable", "");
      }
      update(e4) {
        e4.has("disabled") && this.handleDisabledChanged(this.disabled, e4.get("disabled")), super.update(e4);
      }
      updated(e4) {
        super.updated(e4), e4.has("disabled") && this.disabled && this.blur();
      }
      async handleDisabledChanged(e4, t4) {
        const i3 = () => this.focusElement !== this && typeof this.focusElement.disabled != "undefined";
        e4 ? (this.manipulatingTabindex = true, this.setAttribute("tabindex", "-1"), await this.updateComplete, i3() ? this.focusElement.disabled = true : this.setAttribute("aria-disabled", "true")) : t4 && (this.manipulatingTabindex = true, this.focusElement === this ? this.setAttribute("tabindex", "" + this._tabIndex) : this.removeAttribute("tabindex"), await this.updateComplete, i3() ? this.focusElement.disabled = false : this.removeAttribute("aria-disabled"));
      }
      async getUpdateComplete() {
        const e4 = await super.getUpdateComplete();
        return this._recentlyConnected && (this._recentlyConnected = false, await d2(), await d2()), e4;
      }
      connectedCallback() {
        super.connectedCallback(), this._recentlyConnected = true, this.updateComplete.then(() => {
          this.manageAutoFocus();
        });
      }
    };
    n3([(0, decorators_exports.property)({ type: Boolean, reflect: true })], Focusable.prototype, "disabled", 2), n3([(0, decorators_exports.property)({ type: Boolean })], Focusable.prototype, "autofocus", 2), n3([(0, decorators_exports.property)({ type: Number })], Focusable.prototype, "tabIndex", 1);
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/get-active-element.js
var init_get_active_element = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/get-active-element.js"() {
    "use strict";
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/like-anchor.js
var init_like_anchor = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/like-anchor.js"() {
    "use strict";
  }
});

// ../../node_modules/@lit-labs/observers/mutation-controller.js
var init_mutation_controller = __esm({
  "../../node_modules/@lit-labs/observers/mutation-controller.js"() {
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/observe-slot-presence.js
var t3;
var init_observe_slot_presence = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/observe-slot-presence.js"() {
    "use strict";
    init_mutation_controller();
    t3 = Symbol("slotContentIsPresent");
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/observe-slot-text.js
var p3;
var init_observe_slot_text = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/observe-slot-text.js"() {
    "use strict";
    init_mutation_controller();
    p3 = Symbol("assignedNodes");
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/get-label-from-slot.js
var init_get_label_from_slot = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/get-label-from-slot.js"() {
    "use strict";
  }
});

// ../../node_modules/@spectrum-web-components/shared/src/index.js
var init_src2 = __esm({
  "../../node_modules/@spectrum-web-components/shared/src/index.js"() {
    "use strict";
    init_first_focusable_in();
    init_focus_visible();
    init_focusable();
    init_focusable_selectors();
    init_get_active_element();
    init_like_anchor();
    init_observe_slot_presence();
    init_observe_slot_text();
    init_platform();
    init_reparent_children();
    init_get_label_from_slot();
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/OverlayDialog.js
function OverlayDialog(a5) {
  class c5 extends a5 {
    async manageDialogOpen() {
      const e4 = this.open;
      if (await this.managePosition(), this.open !== e4 || this.open !== e4)
        return;
      const o6 = await this.dialogMakeTransition(e4);
      this.open === e4 && await this.dialogApplyFocus(e4, o6);
    }
    async dialogMakeTransition(e4) {
      let o6 = null;
      const p5 = (t4, s2) => async () => {
        if (typeof t4.open != "undefined" && (t4.open = e4), !e4) {
          const i3 = () => {
            t4.removeEventListener("close", i3), l4(t4, s2);
          };
          t4.addEventListener("close", i3);
        }
        if (s2 > 0)
          return;
        const n5 = e4 ? BeforetoggleOpenEvent : BeforetoggleClosedEvent;
        this.dispatchEvent(new n5()), e4 && (t4.matches(userFocusableSelector) && (o6 = t4), o6 = o6 || firstFocusableIn(t4), o6 || t4.querySelectorAll("slot").forEach((r2) => {
          o6 || (o6 = firstFocusableSlottedIn(r2));
        }), !(!this.isConnected || this.dialogEl.open) && this.dialogEl.showModal());
      }, l4 = (t4, s2) => () => {
        if (this.open !== e4)
          return;
        const n5 = e4 ? "sp-opened" : "sp-closed";
        if (s2 > 0) {
          t4.dispatchEvent(new CustomEvent(n5, { bubbles: false, composed: false, detail: { interaction: this.type } }));
          return;
        }
        if (!this.isConnected || e4 !== this.open)
          return;
        const i3 = () => {
          const r2 = this.triggerElement instanceof VirtualTrigger;
          this.dispatchEvent(new Event(n5, { bubbles: r2, composed: r2 })), t4.dispatchEvent(new Event(n5, { bubbles: false, composed: false })), this.triggerElement && !r2 && this.triggerElement.dispatchEvent(new CustomEvent(n5, { bubbles: true, composed: true, detail: { interaction: this.type } })), this.state = e4 ? "opened" : "closed";
        };
        !e4 && this.dialogEl.open ? (this.dialogEl.addEventListener("close", () => {
          i3();
        }, { once: true }), this.dialogEl.close()) : i3();
      };
      return this.elements.forEach((t4, s2) => {
        guaranteedAllTransitionend(t4, p5(t4, s2), l4(t4, s2));
      }), o6;
    }
    async dialogApplyFocus(e4, o6) {
      this.applyFocus(e4, o6);
    }
  }
  return c5;
}
var init_OverlayDialog = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/OverlayDialog.js"() {
    "use strict";
    init_first_focusable_in();
    init_VirtualTrigger();
    init_AbstractOverlay();
    init_src2();
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/OverlayPopover.js
function u5(l4) {
  let a5 = false;
  try {
    a5 = l4.matches(":popover-open");
  } catch (e4) {
  }
  let c5 = false;
  try {
    c5 = l4.matches(":open");
  } catch (e4) {
  }
  return a5 || c5;
}
function OverlayPopover(l4) {
  class a5 extends l4 {
    async manageDelay(e4) {
      if (e4 === false || e4 !== this.open) {
        overlayTimer.close(this);
        return;
      }
      this.delayed && await overlayTimer.openTimer(this) && (this.open = !e4);
    }
    async shouldHidePopover(e4) {
      if (e4 && this.open !== e4)
        return;
      const o6 = async ({ newState: i3 } = {}) => {
        i3 !== "open" && await this.placementController.resetOverlayPosition();
      };
      if (!u5(this.dialogEl)) {
        o6();
        return;
      }
      this.dialogEl.addEventListener("toggle", o6, { once: true });
    }
    async shouldShowPopover(e4) {
      let o6 = false;
      try {
        o6 = this.dialogEl.matches(":popover-open");
      } catch (p5) {
      }
      let i3 = false;
      try {
        i3 = this.dialogEl.matches(":open");
      } catch (p5) {
      }
      e4 && this.open === e4 && !o6 && !i3 && this.isConnected && (this.dialogEl.showPopover(), await this.managePosition());
    }
    async ensureOnDOM(e4) {
      await nextFrame(), await this.shouldHidePopover(e4), await this.shouldShowPopover(e4), await nextFrame();
    }
    async makeTransition(e4) {
      if (this.open !== e4)
        return null;
      let o6 = null;
      const i3 = (t4, s2) => () => {
        if (typeof t4.open != "undefined" && (t4.open = e4), s2 === 0) {
          const r2 = e4 ? BeforetoggleOpenEvent : BeforetoggleClosedEvent;
          this.dispatchEvent(new r2());
        }
        if (!e4 || (t4.matches(userFocusableSelector) && (o6 = t4), o6 = o6 || firstFocusableIn(t4), o6))
          return;
        t4.querySelectorAll("slot").forEach((r2) => {
          o6 || (o6 = firstFocusableSlottedIn(r2));
        });
      }, p5 = (t4, s2) => async () => {
        if (this.open !== e4)
          return;
        const n5 = e4 ? "sp-opened" : "sp-closed";
        if (s2 > 0) {
          t4.dispatchEvent(new CustomEvent(n5, { bubbles: false, composed: false, detail: { interaction: this.type } }));
          return;
        }
        const r2 = async () => {
          if (this.open !== e4)
            return;
          await nextFrame();
          const d3 = this.triggerElement instanceof VirtualTrigger;
          this.dispatchEvent(new Event(n5, { bubbles: d3, composed: d3 })), t4.dispatchEvent(new CustomEvent(n5, { bubbles: false, composed: false, detail: { interaction: this.type } })), this.triggerElement && !d3 && this.triggerElement.dispatchEvent(new CustomEvent(n5, { bubbles: true, composed: true, detail: { interaction: this.type } })), this.state = e4 ? "opened" : "closed";
        };
        if (this.open !== e4)
          return;
        const v2 = u5(this.dialogEl);
        e4 !== true && v2 && this.isConnected ? (this.dialogEl.addEventListener("beforetoggle", () => {
          r2();
        }, { once: true }), this.dialogEl.hidePopover()) : r2();
      };
      return this.elements.forEach((t4, s2) => {
        guaranteedAllTransitionend(t4, i3(t4, s2), p5(t4, s2));
      }), o6;
    }
  }
  return a5;
}
var init_OverlayPopover = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/OverlayPopover.js"() {
    "use strict";
    init_first_focusable_in();
    init_VirtualTrigger();
    init_AbstractOverlay();
    init_src2();
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/OverlayNoPopover.js
function OverlayNoPopover(l4) {
  class a5 extends l4 {
    async managePopoverOpen() {
      await this.managePosition();
    }
    async manageDelay(e4) {
      if (e4 === false || e4 !== this.open) {
        overlayTimer.close(this);
        return;
      }
      this.delayed && await overlayTimer.openTimer(this) && (this.open = !e4);
    }
    async ensureOnDOM(e4) {
      forcePaint();
    }
    async makeTransition(e4) {
      if (this.open !== e4)
        return null;
      let o6 = null;
      const c5 = (t4, n5) => () => {
        if (e4 !== this.open)
          return;
        if (typeof t4.open != "undefined" && (t4.open = e4), n5 === 0) {
          const r2 = e4 ? BeforetoggleOpenEvent : BeforetoggleClosedEvent;
          this.dispatchEvent(new r2());
        }
        if (e4 !== true || (t4.matches(userFocusableSelector) && (o6 = t4), o6 = o6 || firstFocusableIn(t4), o6))
          return;
        t4.querySelectorAll("slot").forEach((r2) => {
          o6 || (o6 = firstFocusableSlottedIn(r2));
        });
      }, m4 = (t4, n5) => () => {
        if (this.open !== e4)
          return;
        const s2 = e4 ? "sp-opened" : "sp-closed";
        if (t4.dispatchEvent(new CustomEvent(s2, { bubbles: false, composed: false, detail: { interaction: this.type } })), n5 > 0)
          return;
        const r2 = this.triggerElement instanceof VirtualTrigger;
        this.dispatchEvent(new Event(s2, { bubbles: r2, composed: r2 })), this.triggerElement && !r2 && this.triggerElement.dispatchEvent(new CustomEvent(s2, { bubbles: true, composed: true, detail: { interaction: this.type } })), this.state = e4 ? "opened" : "closed";
      };
      return this.elements.forEach((t4, n5) => {
        guaranteedAllTransitionend(t4, c5(t4, n5), m4(t4, n5));
      }), o6;
    }
  }
  return a5;
}
var init_OverlayNoPopover = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/OverlayNoPopover.js"() {
    "use strict";
    init_first_focusable_in();
    init_VirtualTrigger();
    init_AbstractOverlay();
    init_src2();
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/OverlayStack.js
var a3, c3, overlayStack;
var init_OverlayStack = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/OverlayStack.js"() {
    "use strict";
    a3 = "showPopover" in document.createElement("div");
    c3 = class {
      constructor() {
        this.root = document.body;
        this.stack = [];
        this.handlePointerdown = (t4) => {
          this.pointerdownPath = t4.composedPath();
        };
        this.handlePointerup = () => {
          var i3;
          if (!this.stack.length || !((i3 = this.pointerdownPath) != null && i3.length))
            return;
          const t4 = this.pointerdownPath;
          this.pointerdownPath = void 0;
          const e4 = this.stack.filter((n5) => !t4.find((o6) => o6 === n5 || o6 === (n5 == null ? void 0 : n5.triggerElement)) && !n5.shouldPreventClose());
          e4.reverse(), e4.forEach((n5) => {
            this.closeOverlay(n5);
            let s2 = n5.parentOverlayToForceClose;
            for (; s2; )
              this.closeOverlay(s2), s2 = s2.parentOverlayToForceClose;
          });
        };
        this.handleBeforetoggle = (t4) => {
          const { target: e4, newState: i3 } = t4;
          i3 !== "open" && this.closeOverlay(e4);
        };
        this.handleKeydown = (t4) => {
          if (t4.code !== "Escape")
            return;
          const e4 = this.stack.at(-1);
          if ((e4 == null ? void 0 : e4.type) === "page") {
            t4.preventDefault();
            return;
          }
          a3 || this.stack.length && e4 && this.closeOverlay(e4);
        };
        this.bindEvents();
      }
      get document() {
        return this.root.ownerDocument || document;
      }
      bindEvents() {
        this.document.addEventListener("pointerdown", this.handlePointerdown), this.document.addEventListener("pointerup", this.handlePointerup), this.document.addEventListener("keydown", this.handleKeydown);
      }
      closeOverlay(t4) {
        const e4 = this.stack.indexOf(t4);
        e4 > -1 && this.stack.splice(e4, 1), t4.open = false;
      }
      overlaysByTriggerElement(t4) {
        return this.stack.filter((e4) => e4.triggerElement === t4);
      }
      add(t4) {
        if (this.stack.includes(t4)) {
          const e4 = this.stack.indexOf(t4);
          e4 > -1 && (this.stack.splice(e4, 1), this.stack.push(t4));
          return;
        }
        if (t4.type === "auto" || t4.type === "modal" || t4.type === "page") {
          const e4 = "sp-overlay-query-path", i3 = new Event(e4, { composed: true, bubbles: true });
          t4.addEventListener(e4, (n5) => {
            const s2 = n5.composedPath();
            this.stack.forEach((o6) => {
              !s2.find((r2) => r2 === o6) && o6.type !== "manual" && this.closeOverlay(o6);
            });
          }, { once: true }), t4.dispatchEvent(i3);
        } else
          t4.type === "hint" && this.stack.forEach((e4) => {
            e4.type === "hint" && this.closeOverlay(e4);
          });
        requestAnimationFrame(() => {
          this.stack.push(t4), t4.addEventListener("beforetoggle", this.handleBeforetoggle, { once: true });
        });
      }
      remove(t4) {
        this.closeOverlay(t4);
      }
    };
    overlayStack = new c3();
  }
});

// ../../node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
function clamp(start, value, end) {
  return max(start, min(value, end));
}
function evaluate(value, param) {
  return typeof value === "function" ? value(param) : value;
}
function getSide(placement) {
  return placement.split("-")[0];
}
function getAlignment(placement) {
  return placement.split("-")[1];
}
function getOppositeAxis(axis) {
  return axis === "x" ? "y" : "x";
}
function getAxisLength(axis) {
  return axis === "y" ? "height" : "width";
}
function getSideAxis(placement) {
  return ["top", "bottom"].includes(getSide(placement)) ? "y" : "x";
}
function getAlignmentAxis(placement) {
  return getOppositeAxis(getSideAxis(placement));
}
function getAlignmentSides(placement, rects, rtl) {
  if (rtl === void 0) {
    rtl = false;
  }
  const alignment = getAlignment(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const length = getAxisLength(alignmentAxis);
  let mainAlignmentSide = alignmentAxis === "x" ? alignment === (rtl ? "end" : "start") ? "right" : "left" : alignment === "start" ? "bottom" : "top";
  if (rects.reference[length] > rects.floating[length]) {
    mainAlignmentSide = getOppositePlacement(mainAlignmentSide);
  }
  return [mainAlignmentSide, getOppositePlacement(mainAlignmentSide)];
}
function getExpandedPlacements(placement) {
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeAlignmentPlacement(placement), oppositePlacement, getOppositeAlignmentPlacement(oppositePlacement)];
}
function getOppositeAlignmentPlacement(placement) {
  return placement.replace(/start|end/g, (alignment) => oppositeAlignmentMap[alignment]);
}
function getSideList(side, isStart, rtl) {
  const lr2 = ["left", "right"];
  const rl2 = ["right", "left"];
  const tb = ["top", "bottom"];
  const bt2 = ["bottom", "top"];
  switch (side) {
    case "top":
    case "bottom":
      if (rtl)
        return isStart ? rl2 : lr2;
      return isStart ? lr2 : rl2;
    case "left":
    case "right":
      return isStart ? tb : bt2;
    default:
      return [];
  }
}
function getOppositeAxisPlacements(placement, flipAlignment, direction, rtl) {
  const alignment = getAlignment(placement);
  let list = getSideList(getSide(placement), direction === "start", rtl);
  if (alignment) {
    list = list.map((side) => side + "-" + alignment);
    if (flipAlignment) {
      list = list.concat(list.map(getOppositeAlignmentPlacement));
    }
  }
  return list;
}
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (side) => oppositeSideMap[side]);
}
function expandPaddingObject(padding) {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    ...padding
  };
}
function getPaddingObject(padding) {
  return typeof padding !== "number" ? expandPaddingObject(padding) : {
    top: padding,
    right: padding,
    bottom: padding,
    left: padding
  };
}
function rectToClientRect(rect) {
  return {
    ...rect,
    top: rect.y,
    left: rect.x,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  };
}
var min, max, round, floor, createCoords, oppositeSideMap, oppositeAlignmentMap;
var init_floating_ui_utils = __esm({
  "../../node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs"() {
    min = Math.min;
    max = Math.max;
    round = Math.round;
    floor = Math.floor;
    createCoords = (v2) => ({
      x: v2,
      y: v2
    });
    oppositeSideMap = {
      left: "right",
      right: "left",
      bottom: "top",
      top: "bottom"
    };
    oppositeAlignmentMap = {
      start: "end",
      end: "start"
    };
  }
});

// ../../node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function computeCoordsFromPlacement(_ref, placement, rtl) {
  let {
    reference,
    floating
  } = _ref;
  const sideAxis = getSideAxis(placement);
  const alignmentAxis = getAlignmentAxis(placement);
  const alignLength = getAxisLength(alignmentAxis);
  const side = getSide(placement);
  const isVertical = sideAxis === "y";
  const commonX = reference.x + reference.width / 2 - floating.width / 2;
  const commonY = reference.y + reference.height / 2 - floating.height / 2;
  const commonAlign = reference[alignLength] / 2 - floating[alignLength] / 2;
  let coords;
  switch (side) {
    case "top":
      coords = {
        x: commonX,
        y: reference.y - floating.height
      };
      break;
    case "bottom":
      coords = {
        x: commonX,
        y: reference.y + reference.height
      };
      break;
    case "right":
      coords = {
        x: reference.x + reference.width,
        y: commonY
      };
      break;
    case "left":
      coords = {
        x: reference.x - floating.width,
        y: commonY
      };
      break;
    default:
      coords = {
        x: reference.x,
        y: reference.y
      };
  }
  switch (getAlignment(placement)) {
    case "start":
      coords[alignmentAxis] -= commonAlign * (rtl && isVertical ? -1 : 1);
      break;
    case "end":
      coords[alignmentAxis] += commonAlign * (rtl && isVertical ? -1 : 1);
      break;
  }
  return coords;
}
async function detectOverflow(state, options) {
  var _await$platform$isEle;
  if (options === void 0) {
    options = {};
  }
  const {
    x: x2,
    y: y2,
    platform: platform2,
    rects,
    elements,
    strategy
  } = state;
  const {
    boundary = "clippingAncestors",
    rootBoundary = "viewport",
    elementContext = "floating",
    altBoundary = false,
    padding = 0
  } = evaluate(options, state);
  const paddingObject = getPaddingObject(padding);
  const altContext = elementContext === "floating" ? "reference" : "floating";
  const element = elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = rectToClientRect(await platform2.getClippingRect({
    element: ((_await$platform$isEle = await (platform2.isElement == null ? void 0 : platform2.isElement(element))) != null ? _await$platform$isEle : true) ? element : element.contextElement || await (platform2.getDocumentElement == null ? void 0 : platform2.getDocumentElement(elements.floating)),
    boundary,
    rootBoundary,
    strategy
  }));
  const rect = elementContext === "floating" ? {
    ...rects.floating,
    x: x2,
    y: y2
  } : rects.reference;
  const offsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(elements.floating));
  const offsetScale = await (platform2.isElement == null ? void 0 : platform2.isElement(offsetParent)) ? await (platform2.getScale == null ? void 0 : platform2.getScale(offsetParent)) || {
    x: 1,
    y: 1
  } : {
    x: 1,
    y: 1
  };
  const elementClientRect = rectToClientRect(platform2.convertOffsetParentRelativeRectToViewportRelativeRect ? await platform2.convertOffsetParentRelativeRectToViewportRelativeRect({
    rect,
    offsetParent,
    strategy
  }) : rect);
  return {
    top: (clippingClientRect.top - elementClientRect.top + paddingObject.top) / offsetScale.y,
    bottom: (elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom) / offsetScale.y,
    left: (clippingClientRect.left - elementClientRect.left + paddingObject.left) / offsetScale.x,
    right: (elementClientRect.right - clippingClientRect.right + paddingObject.right) / offsetScale.x
  };
}
async function convertValueToCoords(state, options) {
  const {
    placement,
    platform: platform2,
    elements
  } = state;
  const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
  const side = getSide(placement);
  const alignment = getAlignment(placement);
  const isVertical = getSideAxis(placement) === "y";
  const mainAxisMulti = ["left", "top"].includes(side) ? -1 : 1;
  const crossAxisMulti = rtl && isVertical ? -1 : 1;
  const rawValue = evaluate(options, state);
  let {
    mainAxis,
    crossAxis,
    alignmentAxis
  } = typeof rawValue === "number" ? {
    mainAxis: rawValue,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: 0,
    crossAxis: 0,
    alignmentAxis: null,
    ...rawValue
  };
  if (alignment && typeof alignmentAxis === "number") {
    crossAxis = alignment === "end" ? alignmentAxis * -1 : alignmentAxis;
  }
  return isVertical ? {
    x: crossAxis * crossAxisMulti,
    y: mainAxis * mainAxisMulti
  } : {
    x: mainAxis * mainAxisMulti,
    y: crossAxis * crossAxisMulti
  };
}
var computePosition, arrow, flip, offset, shift, size;
var init_floating_ui_core = __esm({
  "../../node_modules/@floating-ui/core/dist/floating-ui.core.mjs"() {
    init_floating_ui_utils();
    init_floating_ui_utils();
    computePosition = async (reference, floating, config) => {
      const {
        placement = "bottom",
        strategy = "absolute",
        middleware = [],
        platform: platform2
      } = config;
      const validMiddleware = middleware.filter(Boolean);
      const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(floating));
      let rects = await platform2.getElementRects({
        reference,
        floating,
        strategy
      });
      let {
        x: x2,
        y: y2
      } = computeCoordsFromPlacement(rects, placement, rtl);
      let statefulPlacement = placement;
      let middlewareData = {};
      let resetCount = 0;
      for (let i3 = 0; i3 < validMiddleware.length; i3++) {
        const {
          name,
          fn: fn2
        } = validMiddleware[i3];
        const {
          x: nextX,
          y: nextY,
          data,
          reset
        } = await fn2({
          x: x2,
          y: y2,
          initialPlacement: placement,
          placement: statefulPlacement,
          strategy,
          middlewareData,
          rects,
          platform: platform2,
          elements: {
            reference,
            floating
          }
        });
        x2 = nextX != null ? nextX : x2;
        y2 = nextY != null ? nextY : y2;
        middlewareData = {
          ...middlewareData,
          [name]: {
            ...middlewareData[name],
            ...data
          }
        };
        if (reset && resetCount <= 50) {
          resetCount++;
          if (typeof reset === "object") {
            if (reset.placement) {
              statefulPlacement = reset.placement;
            }
            if (reset.rects) {
              rects = reset.rects === true ? await platform2.getElementRects({
                reference,
                floating,
                strategy
              }) : reset.rects;
            }
            ({
              x: x2,
              y: y2
            } = computeCoordsFromPlacement(rects, statefulPlacement, rtl));
          }
          i3 = -1;
          continue;
        }
      }
      return {
        x: x2,
        y: y2,
        placement: statefulPlacement,
        strategy,
        middlewareData
      };
    };
    arrow = (options) => ({
      name: "arrow",
      options,
      async fn(state) {
        const {
          x: x2,
          y: y2,
          placement,
          rects,
          platform: platform2,
          elements,
          middlewareData
        } = state;
        const {
          element,
          padding = 0
        } = evaluate(options, state) || {};
        if (element == null) {
          return {};
        }
        const paddingObject = getPaddingObject(padding);
        const coords = {
          x: x2,
          y: y2
        };
        const axis = getAlignmentAxis(placement);
        const length = getAxisLength(axis);
        const arrowDimensions = await platform2.getDimensions(element);
        const isYAxis = axis === "y";
        const minProp = isYAxis ? "top" : "left";
        const maxProp = isYAxis ? "bottom" : "right";
        const clientProp = isYAxis ? "clientHeight" : "clientWidth";
        const endDiff = rects.reference[length] + rects.reference[axis] - coords[axis] - rects.floating[length];
        const startDiff = coords[axis] - rects.reference[axis];
        const arrowOffsetParent = await (platform2.getOffsetParent == null ? void 0 : platform2.getOffsetParent(element));
        let clientSize = arrowOffsetParent ? arrowOffsetParent[clientProp] : 0;
        if (!clientSize || !await (platform2.isElement == null ? void 0 : platform2.isElement(arrowOffsetParent))) {
          clientSize = elements.floating[clientProp] || rects.floating[length];
        }
        const centerToReference = endDiff / 2 - startDiff / 2;
        const largestPossiblePadding = clientSize / 2 - arrowDimensions[length] / 2 - 1;
        const minPadding = min(paddingObject[minProp], largestPossiblePadding);
        const maxPadding = min(paddingObject[maxProp], largestPossiblePadding);
        const min$1 = minPadding;
        const max2 = clientSize - arrowDimensions[length] - maxPadding;
        const center = clientSize / 2 - arrowDimensions[length] / 2 + centerToReference;
        const offset2 = clamp(min$1, center, max2);
        const shouldAddOffset = !middlewareData.arrow && getAlignment(placement) != null && center != offset2 && rects.reference[length] / 2 - (center < min$1 ? minPadding : maxPadding) - arrowDimensions[length] / 2 < 0;
        const alignmentOffset = shouldAddOffset ? center < min$1 ? center - min$1 : center - max2 : 0;
        return {
          [axis]: coords[axis] + alignmentOffset,
          data: {
            [axis]: offset2,
            centerOffset: center - offset2 - alignmentOffset,
            ...shouldAddOffset && {
              alignmentOffset
            }
          },
          reset: shouldAddOffset
        };
      }
    });
    flip = function(options) {
      if (options === void 0) {
        options = {};
      }
      return {
        name: "flip",
        options,
        async fn(state) {
          var _middlewareData$arrow, _middlewareData$flip;
          const {
            placement,
            middlewareData,
            rects,
            initialPlacement,
            platform: platform2,
            elements
          } = state;
          const {
            mainAxis: checkMainAxis = true,
            crossAxis: checkCrossAxis = true,
            fallbackPlacements: specifiedFallbackPlacements,
            fallbackStrategy = "bestFit",
            fallbackAxisSideDirection = "none",
            flipAlignment = true,
            ...detectOverflowOptions
          } = evaluate(options, state);
          if ((_middlewareData$arrow = middlewareData.arrow) != null && _middlewareData$arrow.alignmentOffset) {
            return {};
          }
          const side = getSide(placement);
          const isBasePlacement = getSide(initialPlacement) === initialPlacement;
          const rtl = await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating));
          const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipAlignment ? [getOppositePlacement(initialPlacement)] : getExpandedPlacements(initialPlacement));
          if (!specifiedFallbackPlacements && fallbackAxisSideDirection !== "none") {
            fallbackPlacements.push(...getOppositeAxisPlacements(initialPlacement, flipAlignment, fallbackAxisSideDirection, rtl));
          }
          const placements2 = [initialPlacement, ...fallbackPlacements];
          const overflow = await detectOverflow(state, detectOverflowOptions);
          const overflows = [];
          let overflowsData = ((_middlewareData$flip = middlewareData.flip) == null ? void 0 : _middlewareData$flip.overflows) || [];
          if (checkMainAxis) {
            overflows.push(overflow[side]);
          }
          if (checkCrossAxis) {
            const sides2 = getAlignmentSides(placement, rects, rtl);
            overflows.push(overflow[sides2[0]], overflow[sides2[1]]);
          }
          overflowsData = [...overflowsData, {
            placement,
            overflows
          }];
          if (!overflows.every((side2) => side2 <= 0)) {
            var _middlewareData$flip2, _overflowsData$filter;
            const nextIndex = (((_middlewareData$flip2 = middlewareData.flip) == null ? void 0 : _middlewareData$flip2.index) || 0) + 1;
            const nextPlacement = placements2[nextIndex];
            if (nextPlacement) {
              return {
                data: {
                  index: nextIndex,
                  overflows: overflowsData
                },
                reset: {
                  placement: nextPlacement
                }
              };
            }
            let resetPlacement = (_overflowsData$filter = overflowsData.filter((d3) => d3.overflows[0] <= 0).sort((a5, b3) => a5.overflows[1] - b3.overflows[1])[0]) == null ? void 0 : _overflowsData$filter.placement;
            if (!resetPlacement) {
              switch (fallbackStrategy) {
                case "bestFit": {
                  var _overflowsData$map$so;
                  const placement2 = (_overflowsData$map$so = overflowsData.map((d3) => [d3.placement, d3.overflows.filter((overflow2) => overflow2 > 0).reduce((acc, overflow2) => acc + overflow2, 0)]).sort((a5, b3) => a5[1] - b3[1])[0]) == null ? void 0 : _overflowsData$map$so[0];
                  if (placement2) {
                    resetPlacement = placement2;
                  }
                  break;
                }
                case "initialPlacement":
                  resetPlacement = initialPlacement;
                  break;
              }
            }
            if (placement !== resetPlacement) {
              return {
                reset: {
                  placement: resetPlacement
                }
              };
            }
          }
          return {};
        }
      };
    };
    offset = function(options) {
      if (options === void 0) {
        options = 0;
      }
      return {
        name: "offset",
        options,
        async fn(state) {
          const {
            x: x2,
            y: y2
          } = state;
          const diffCoords = await convertValueToCoords(state, options);
          return {
            x: x2 + diffCoords.x,
            y: y2 + diffCoords.y,
            data: diffCoords
          };
        }
      };
    };
    shift = function(options) {
      if (options === void 0) {
        options = {};
      }
      return {
        name: "shift",
        options,
        async fn(state) {
          const {
            x: x2,
            y: y2,
            placement
          } = state;
          const {
            mainAxis: checkMainAxis = true,
            crossAxis: checkCrossAxis = false,
            limiter = {
              fn: (_ref) => {
                let {
                  x: x3,
                  y: y3
                } = _ref;
                return {
                  x: x3,
                  y: y3
                };
              }
            },
            ...detectOverflowOptions
          } = evaluate(options, state);
          const coords = {
            x: x2,
            y: y2
          };
          const overflow = await detectOverflow(state, detectOverflowOptions);
          const crossAxis = getSideAxis(getSide(placement));
          const mainAxis = getOppositeAxis(crossAxis);
          let mainAxisCoord = coords[mainAxis];
          let crossAxisCoord = coords[crossAxis];
          if (checkMainAxis) {
            const minSide = mainAxis === "y" ? "top" : "left";
            const maxSide = mainAxis === "y" ? "bottom" : "right";
            const min2 = mainAxisCoord + overflow[minSide];
            const max2 = mainAxisCoord - overflow[maxSide];
            mainAxisCoord = clamp(min2, mainAxisCoord, max2);
          }
          if (checkCrossAxis) {
            const minSide = crossAxis === "y" ? "top" : "left";
            const maxSide = crossAxis === "y" ? "bottom" : "right";
            const min2 = crossAxisCoord + overflow[minSide];
            const max2 = crossAxisCoord - overflow[maxSide];
            crossAxisCoord = clamp(min2, crossAxisCoord, max2);
          }
          const limitedCoords = limiter.fn({
            ...state,
            [mainAxis]: mainAxisCoord,
            [crossAxis]: crossAxisCoord
          });
          return {
            ...limitedCoords,
            data: {
              x: limitedCoords.x - x2,
              y: limitedCoords.y - y2
            }
          };
        }
      };
    };
    size = function(options) {
      if (options === void 0) {
        options = {};
      }
      return {
        name: "size",
        options,
        async fn(state) {
          const {
            placement,
            rects,
            platform: platform2,
            elements
          } = state;
          const {
            apply = () => {
            },
            ...detectOverflowOptions
          } = evaluate(options, state);
          const overflow = await detectOverflow(state, detectOverflowOptions);
          const side = getSide(placement);
          const alignment = getAlignment(placement);
          const isYAxis = getSideAxis(placement) === "y";
          const {
            width,
            height
          } = rects.floating;
          let heightSide;
          let widthSide;
          if (side === "top" || side === "bottom") {
            heightSide = side;
            widthSide = alignment === (await (platform2.isRTL == null ? void 0 : platform2.isRTL(elements.floating)) ? "start" : "end") ? "left" : "right";
          } else {
            widthSide = side;
            heightSide = alignment === "end" ? "top" : "bottom";
          }
          const overflowAvailableHeight = height - overflow[heightSide];
          const overflowAvailableWidth = width - overflow[widthSide];
          const noShift = !state.middlewareData.shift;
          let availableHeight = overflowAvailableHeight;
          let availableWidth = overflowAvailableWidth;
          if (isYAxis) {
            const maximumClippingWidth = width - overflow.left - overflow.right;
            availableWidth = alignment || noShift ? min(overflowAvailableWidth, maximumClippingWidth) : maximumClippingWidth;
          } else {
            const maximumClippingHeight = height - overflow.top - overflow.bottom;
            availableHeight = alignment || noShift ? min(overflowAvailableHeight, maximumClippingHeight) : maximumClippingHeight;
          }
          if (noShift && !alignment) {
            const xMin = max(overflow.left, 0);
            const xMax = max(overflow.right, 0);
            const yMin = max(overflow.top, 0);
            const yMax = max(overflow.bottom, 0);
            if (isYAxis) {
              availableWidth = width - 2 * (xMin !== 0 || xMax !== 0 ? xMin + xMax : max(overflow.left, overflow.right));
            } else {
              availableHeight = height - 2 * (yMin !== 0 || yMax !== 0 ? yMin + yMax : max(overflow.top, overflow.bottom));
            }
          }
          await apply({
            ...state,
            availableWidth,
            availableHeight
          });
          const nextDimensions = await platform2.getDimensions(elements.floating);
          if (width !== nextDimensions.width || height !== nextDimensions.height) {
            return {
              reset: {
                rects: true
              }
            };
          }
          return {};
        }
      };
    };
  }
});

// ../../node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.mjs
function getNodeName(node) {
  if (isNode(node)) {
    return (node.nodeName || "").toLowerCase();
  }
  return "#document";
}
function getWindow(node) {
  var _node$ownerDocument;
  return (node == null ? void 0 : (_node$ownerDocument = node.ownerDocument) == null ? void 0 : _node$ownerDocument.defaultView) || window;
}
function getDocumentElement(node) {
  var _ref;
  return (_ref = (isNode(node) ? node.ownerDocument : node.document) || window.document) == null ? void 0 : _ref.documentElement;
}
function isNode(value) {
  return value instanceof Node || value instanceof getWindow(value).Node;
}
function isElement(value) {
  return value instanceof Element || value instanceof getWindow(value).Element;
}
function isHTMLElement(value) {
  return value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement;
}
function isShadowRoot(value) {
  if (typeof ShadowRoot === "undefined") {
    return false;
  }
  return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
}
function isOverflowElement(element) {
  const {
    overflow,
    overflowX,
    overflowY,
    display
  } = getComputedStyle2(element);
  return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) && !["inline", "contents"].includes(display);
}
function isTableElement(element) {
  return ["table", "td", "th"].includes(getNodeName(element));
}
function isContainingBlock(element) {
  const webkit = isWebKit();
  const css6 = getComputedStyle2(element);
  return css6.transform !== "none" || css6.perspective !== "none" || (css6.containerType ? css6.containerType !== "normal" : false) || !webkit && (css6.backdropFilter ? css6.backdropFilter !== "none" : false) || !webkit && (css6.filter ? css6.filter !== "none" : false) || ["transform", "perspective", "filter"].some((value) => (css6.willChange || "").includes(value)) || ["paint", "layout", "strict", "content"].some((value) => (css6.contain || "").includes(value));
}
function getContainingBlock(element) {
  let currentNode = getParentNode(element);
  while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
    if (isContainingBlock(currentNode)) {
      return currentNode;
    } else {
      currentNode = getParentNode(currentNode);
    }
  }
  return null;
}
function isWebKit() {
  if (typeof CSS === "undefined" || !CSS.supports)
    return false;
  return CSS.supports("-webkit-backdrop-filter", "none");
}
function isLastTraversableNode(node) {
  return ["html", "body", "#document"].includes(getNodeName(node));
}
function getComputedStyle2(element) {
  return getWindow(element).getComputedStyle(element);
}
function getNodeScroll(element) {
  if (isElement(element)) {
    return {
      scrollLeft: element.scrollLeft,
      scrollTop: element.scrollTop
    };
  }
  return {
    scrollLeft: element.pageXOffset,
    scrollTop: element.pageYOffset
  };
}
function getParentNode(node) {
  if (getNodeName(node) === "html") {
    return node;
  }
  const result = (
    // Step into the shadow DOM of the parent of a slotted node.
    node.assignedSlot || // DOM Element detected.
    node.parentNode || // ShadowRoot detected.
    isShadowRoot(node) && node.host || // Fallback.
    getDocumentElement(node)
  );
  return isShadowRoot(result) ? result.host : result;
}
function getNearestOverflowAncestor(node) {
  const parentNode = getParentNode(node);
  if (isLastTraversableNode(parentNode)) {
    return node.ownerDocument ? node.ownerDocument.body : node.body;
  }
  if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
    return parentNode;
  }
  return getNearestOverflowAncestor(parentNode);
}
function getOverflowAncestors(node, list, traverseIframes) {
  var _node$ownerDocument2;
  if (list === void 0) {
    list = [];
  }
  if (traverseIframes === void 0) {
    traverseIframes = true;
  }
  const scrollableAncestor = getNearestOverflowAncestor(node);
  const isBody = scrollableAncestor === ((_node$ownerDocument2 = node.ownerDocument) == null ? void 0 : _node$ownerDocument2.body);
  const win = getWindow(scrollableAncestor);
  if (isBody) {
    return list.concat(win, win.visualViewport || [], isOverflowElement(scrollableAncestor) ? scrollableAncestor : [], win.frameElement && traverseIframes ? getOverflowAncestors(win.frameElement) : []);
  }
  return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
}
var init_floating_ui_utils_dom = __esm({
  "../../node_modules/@floating-ui/utils/dom/dist/floating-ui.utils.dom.mjs"() {
  }
});

// ../../node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function getCssDimensions(element) {
  const css6 = getComputedStyle2(element);
  let width = parseFloat(css6.width) || 0;
  let height = parseFloat(css6.height) || 0;
  const hasOffset = isHTMLElement(element);
  const offsetWidth = hasOffset ? element.offsetWidth : width;
  const offsetHeight = hasOffset ? element.offsetHeight : height;
  const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
  if (shouldFallback) {
    width = offsetWidth;
    height = offsetHeight;
  }
  return {
    width,
    height,
    $: shouldFallback
  };
}
function unwrapElement(element) {
  return !isElement(element) ? element.contextElement : element;
}
function getScale(element) {
  const domElement = unwrapElement(element);
  if (!isHTMLElement(domElement)) {
    return createCoords(1);
  }
  const rect = domElement.getBoundingClientRect();
  const {
    width,
    height,
    $: $2
  } = getCssDimensions(domElement);
  let x2 = ($2 ? round(rect.width) : rect.width) / width;
  let y2 = ($2 ? round(rect.height) : rect.height) / height;
  if (!x2 || !Number.isFinite(x2)) {
    x2 = 1;
  }
  if (!y2 || !Number.isFinite(y2)) {
    y2 = 1;
  }
  return {
    x: x2,
    y: y2
  };
}
function getVisualOffsets(element) {
  const win = getWindow(element);
  if (!isWebKit() || !win.visualViewport) {
    return noOffsets;
  }
  return {
    x: win.visualViewport.offsetLeft,
    y: win.visualViewport.offsetTop
  };
}
function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
  if (isFixed === void 0) {
    isFixed = false;
  }
  if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
    return false;
  }
  return isFixed;
}
function getBoundingClientRect(element, includeScale, isFixedStrategy, offsetParent) {
  if (includeScale === void 0) {
    includeScale = false;
  }
  if (isFixedStrategy === void 0) {
    isFixedStrategy = false;
  }
  const clientRect = element.getBoundingClientRect();
  const domElement = unwrapElement(element);
  let scale = createCoords(1);
  if (includeScale) {
    if (offsetParent) {
      if (isElement(offsetParent)) {
        scale = getScale(offsetParent);
      }
    } else {
      scale = getScale(element);
    }
  }
  const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? getVisualOffsets(domElement) : createCoords(0);
  let x2 = (clientRect.left + visualOffsets.x) / scale.x;
  let y2 = (clientRect.top + visualOffsets.y) / scale.y;
  let width = clientRect.width / scale.x;
  let height = clientRect.height / scale.y;
  if (domElement) {
    const win = getWindow(domElement);
    const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
    let currentIFrame = win.frameElement;
    while (currentIFrame && offsetParent && offsetWin !== win) {
      const iframeScale = getScale(currentIFrame);
      const iframeRect = currentIFrame.getBoundingClientRect();
      const css6 = getComputedStyle2(currentIFrame);
      const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css6.paddingLeft)) * iframeScale.x;
      const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css6.paddingTop)) * iframeScale.y;
      x2 *= iframeScale.x;
      y2 *= iframeScale.y;
      width *= iframeScale.x;
      height *= iframeScale.y;
      x2 += left;
      y2 += top;
      currentIFrame = getWindow(currentIFrame).frameElement;
    }
  }
  return rectToClientRect({
    width,
    height,
    x: x2,
    y: y2
  });
}
function convertOffsetParentRelativeRectToViewportRelativeRect(_ref) {
  let {
    rect,
    offsetParent,
    strategy
  } = _ref;
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  if (offsetParent === documentElement) {
    return rect;
  }
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  let scale = createCoords(1);
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && strategy !== "fixed") {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      const offsetRect = getBoundingClientRect(offsetParent);
      scale = getScale(offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    }
  }
  return {
    width: rect.width * scale.x,
    height: rect.height * scale.y,
    x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
    y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
  };
}
function getClientRects(element) {
  return Array.from(element.getClientRects());
}
function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getNodeScroll(element).scrollLeft;
}
function getDocumentRect(element) {
  const html5 = getDocumentElement(element);
  const scroll = getNodeScroll(element);
  const body = element.ownerDocument.body;
  const width = max(html5.scrollWidth, html5.clientWidth, body.scrollWidth, body.clientWidth);
  const height = max(html5.scrollHeight, html5.clientHeight, body.scrollHeight, body.clientHeight);
  let x2 = -scroll.scrollLeft + getWindowScrollBarX(element);
  const y2 = -scroll.scrollTop;
  if (getComputedStyle2(body).direction === "rtl") {
    x2 += max(html5.clientWidth, body.clientWidth) - width;
  }
  return {
    width,
    height,
    x: x2,
    y: y2
  };
}
function getViewportRect(element, strategy) {
  const win = getWindow(element);
  const html5 = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html5.clientWidth;
  let height = html5.clientHeight;
  let x2 = 0;
  let y2 = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    const visualViewportBased = isWebKit();
    if (!visualViewportBased || visualViewportBased && strategy === "fixed") {
      x2 = visualViewport.offsetLeft;
      y2 = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x2,
    y: y2
  };
}
function getInnerBoundingClientRect(element, strategy) {
  const clientRect = getBoundingClientRect(element, true, strategy === "fixed");
  const top = clientRect.top + element.clientTop;
  const left = clientRect.left + element.clientLeft;
  const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
  const width = element.clientWidth * scale.x;
  const height = element.clientHeight * scale.y;
  const x2 = left * scale.x;
  const y2 = top * scale.y;
  return {
    width,
    height,
    x: x2,
    y: y2
  };
}
function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
  let rect;
  if (clippingAncestor === "viewport") {
    rect = getViewportRect(element, strategy);
  } else if (clippingAncestor === "document") {
    rect = getDocumentRect(getDocumentElement(element));
  } else if (isElement(clippingAncestor)) {
    rect = getInnerBoundingClientRect(clippingAncestor, strategy);
  } else {
    const visualOffsets = getVisualOffsets(element);
    rect = {
      ...clippingAncestor,
      x: clippingAncestor.x - visualOffsets.x,
      y: clippingAncestor.y - visualOffsets.y
    };
  }
  return rectToClientRect(rect);
}
function hasFixedPositionAncestor(element, stopNode) {
  const parentNode = getParentNode(element);
  if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
    return false;
  }
  return getComputedStyle2(parentNode).position === "fixed" || hasFixedPositionAncestor(parentNode, stopNode);
}
function getClippingElementAncestors(element, cache) {
  const cachedResult = cache.get(element);
  if (cachedResult) {
    return cachedResult;
  }
  let result = getOverflowAncestors(element, [], false).filter((el2) => isElement(el2) && getNodeName(el2) !== "body");
  let currentContainingBlockComputedStyle = null;
  const elementIsFixed = getComputedStyle2(element).position === "fixed";
  let currentNode = elementIsFixed ? getParentNode(element) : element;
  while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
    const computedStyle = getComputedStyle2(currentNode);
    const currentNodeIsContaining = isContainingBlock(currentNode);
    if (!currentNodeIsContaining && computedStyle.position === "fixed") {
      currentContainingBlockComputedStyle = null;
    }
    const shouldDropCurrentNode = elementIsFixed ? !currentNodeIsContaining && !currentContainingBlockComputedStyle : !currentNodeIsContaining && computedStyle.position === "static" && !!currentContainingBlockComputedStyle && ["absolute", "fixed"].includes(currentContainingBlockComputedStyle.position) || isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
    if (shouldDropCurrentNode) {
      result = result.filter((ancestor) => ancestor !== currentNode);
    } else {
      currentContainingBlockComputedStyle = computedStyle;
    }
    currentNode = getParentNode(currentNode);
  }
  cache.set(element, result);
  return result;
}
function getClippingRect(_ref) {
  let {
    element,
    boundary,
    rootBoundary,
    strategy
  } = _ref;
  const elementClippingAncestors = boundary === "clippingAncestors" ? getClippingElementAncestors(element, this._c) : [].concat(boundary);
  const clippingAncestors = [...elementClippingAncestors, rootBoundary];
  const firstClippingAncestor = clippingAncestors[0];
  const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
    const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
  return {
    width: clippingRect.right - clippingRect.left,
    height: clippingRect.bottom - clippingRect.top,
    x: clippingRect.left,
    y: clippingRect.top
  };
}
function getDimensions(element) {
  return getCssDimensions(element);
}
function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === "fixed";
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
  let scroll = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const offsets = createCoords(0);
  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== "body" || isOverflowElement(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }
  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}
function getTrueOffsetParent(element, polyfill) {
  if (!isHTMLElement(element) || getComputedStyle2(element).position === "fixed") {
    return null;
  }
  if (polyfill) {
    return polyfill(element);
  }
  return element.offsetParent;
}
function getOffsetParent(element, polyfill) {
  const window2 = getWindow(element);
  if (!isHTMLElement(element)) {
    return window2;
  }
  let offsetParent = getTrueOffsetParent(element, polyfill);
  while (offsetParent && isTableElement(offsetParent) && getComputedStyle2(offsetParent).position === "static") {
    offsetParent = getTrueOffsetParent(offsetParent, polyfill);
  }
  if (offsetParent && (getNodeName(offsetParent) === "html" || getNodeName(offsetParent) === "body" && getComputedStyle2(offsetParent).position === "static" && !isContainingBlock(offsetParent))) {
    return window2;
  }
  return offsetParent || getContainingBlock(element) || window2;
}
function isRTL(element) {
  return getComputedStyle2(element).direction === "rtl";
}
function observeMove(element, onMove) {
  let io2 = null;
  let timeoutId;
  const root = getDocumentElement(element);
  function cleanup() {
    clearTimeout(timeoutId);
    io2 && io2.disconnect();
    io2 = null;
  }
  function refresh(skip, threshold) {
    if (skip === void 0) {
      skip = false;
    }
    if (threshold === void 0) {
      threshold = 1;
    }
    cleanup();
    const {
      left,
      top,
      width,
      height
    } = element.getBoundingClientRect();
    if (!skip) {
      onMove();
    }
    if (!width || !height) {
      return;
    }
    const insetTop = floor(top);
    const insetRight = floor(root.clientWidth - (left + width));
    const insetBottom = floor(root.clientHeight - (top + height));
    const insetLeft = floor(left);
    const rootMargin = -insetTop + "px " + -insetRight + "px " + -insetBottom + "px " + -insetLeft + "px";
    const options = {
      rootMargin,
      threshold: max(0, min(1, threshold)) || 1
    };
    let isFirstUpdate = true;
    function handleObserve(entries) {
      const ratio = entries[0].intersectionRatio;
      if (ratio !== threshold) {
        if (!isFirstUpdate) {
          return refresh();
        }
        if (!ratio) {
          timeoutId = setTimeout(() => {
            refresh(false, 1e-7);
          }, 100);
        } else {
          refresh(false, ratio);
        }
      }
      isFirstUpdate = false;
    }
    try {
      io2 = new IntersectionObserver(handleObserve, {
        ...options,
        // Handle <iframe>s
        root: root.ownerDocument
      });
    } catch (e4) {
      io2 = new IntersectionObserver(handleObserve, options);
    }
    io2.observe(element);
  }
  refresh(true);
  return cleanup;
}
function autoUpdate(reference, floating, update, options) {
  if (options === void 0) {
    options = {};
  }
  const {
    ancestorScroll = true,
    ancestorResize = true,
    elementResize = typeof ResizeObserver === "function",
    layoutShift = typeof IntersectionObserver === "function",
    animationFrame = false
  } = options;
  const referenceEl = unwrapElement(reference);
  const ancestors = ancestorScroll || ancestorResize ? [...referenceEl ? getOverflowAncestors(referenceEl) : [], ...getOverflowAncestors(floating)] : [];
  ancestors.forEach((ancestor) => {
    ancestorScroll && ancestor.addEventListener("scroll", update, {
      passive: true
    });
    ancestorResize && ancestor.addEventListener("resize", update);
  });
  const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
  let reobserveFrame = -1;
  let resizeObserver = null;
  if (elementResize) {
    resizeObserver = new ResizeObserver((_ref) => {
      let [firstEntry] = _ref;
      if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
        resizeObserver.unobserve(floating);
        cancelAnimationFrame(reobserveFrame);
        reobserveFrame = requestAnimationFrame(() => {
          resizeObserver && resizeObserver.observe(floating);
        });
      }
      update();
    });
    if (referenceEl && !animationFrame) {
      resizeObserver.observe(referenceEl);
    }
    resizeObserver.observe(floating);
  }
  let frameId;
  let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
  if (animationFrame) {
    frameLoop();
  }
  function frameLoop() {
    const nextRefRect = getBoundingClientRect(reference);
    if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
      update();
    }
    prevRefRect = nextRefRect;
    frameId = requestAnimationFrame(frameLoop);
  }
  update();
  return () => {
    ancestors.forEach((ancestor) => {
      ancestorScroll && ancestor.removeEventListener("scroll", update);
      ancestorResize && ancestor.removeEventListener("resize", update);
    });
    cleanupIo && cleanupIo();
    resizeObserver && resizeObserver.disconnect();
    resizeObserver = null;
    if (animationFrame) {
      cancelAnimationFrame(frameId);
    }
  };
}
var noOffsets, getElementRects, platform, computePosition2;
var init_floating_ui_dom = __esm({
  "../../node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs"() {
    init_floating_ui_core();
    init_floating_ui_core();
    init_floating_ui_utils();
    init_floating_ui_utils_dom();
    noOffsets = /* @__PURE__ */ createCoords(0);
    getElementRects = async function(_ref) {
      let {
        reference,
        floating,
        strategy
      } = _ref;
      const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
      const getDimensionsFn = this.getDimensions;
      return {
        reference: getRectRelativeToOffsetParent(reference, await getOffsetParentFn(floating), strategy),
        floating: {
          x: 0,
          y: 0,
          ...await getDimensionsFn(floating)
        }
      };
    };
    platform = {
      convertOffsetParentRelativeRectToViewportRelativeRect,
      getDocumentElement,
      getClippingRect,
      getOffsetParent,
      getElementRects,
      getClientRects,
      getDimensions,
      getScale,
      isElement,
      isRTL
    };
    computePosition2 = (reference, floating, options) => {
      const cache = /* @__PURE__ */ new Map();
      const mergedOptions = {
        platform,
        ...options
      };
      const platformWithCache = {
        ...mergedOptions.platform,
        _c: cache
      };
      return computePosition(reference, floating, {
        ...mergedOptions,
        platform: platformWithCache
      });
    };
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/topLayerOverTransforms.js
var topLayerOverTransforms;
var init_topLayerOverTransforms = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/topLayerOverTransforms.js"() {
    "use strict";
    init_floating_ui_utils_dom();
    init_VirtualTrigger();
    topLayerOverTransforms = () => ({ name: "topLayer", async fn(g2) {
      const { x: s2, y: l4, elements: { reference: c5, floating: o6 } } = g2;
      let e4 = false, f3 = false, d3 = false;
      const r2 = { x: 0, y: 0 };
      try {
        e4 = e4 || o6.matches(":popover-open");
      } catch (a5) {
      }
      try {
        e4 = e4 || o6.matches(":open");
      } catch (a5) {
      }
      try {
        e4 = e4 || o6.matches(":modal");
      } catch (a5) {
      }
      f3 = e4;
      const p5 = new Event("floating-ui-dialog-test", { composed: true, bubbles: true });
      o6.addEventListener("floating-ui-dialog-test", (a5) => {
        a5.composedPath().forEach((n5) => {
          if (d3 = d3 || n5 === c5, !(n5 === o6 || n5.localName !== "dialog"))
            try {
              e4 = e4 || n5.matches(":modal");
            } catch (t4) {
            }
        });
      }, { once: true }), o6.dispatchEvent(p5);
      let m4 = false;
      if (!(c5 instanceof VirtualTrigger)) {
        const a5 = d3 ? c5 : o6, n5 = isContainingBlock(a5) ? a5 : getContainingBlock(a5);
        let t4 = {};
        if (n5 !== null && getWindow(n5) !== n5 && (t4 = getComputedStyle(n5), m4 = t4.transform !== "none" || t4.translate !== "none" || (t4.backdropFilter ? t4.backdropFilter !== "none" : false) || (t4.filter ? t4.filter !== "none" : false) || t4.willChange.search("transform") > -1 || t4.willChange.search("translate") > -1 || ["paint", "layout", "strict", "content"].some((i3) => (t4.contain || "").includes(i3))), e4 && m4 && n5) {
          const i3 = n5.getBoundingClientRect(), { marginInlineStart: y2 = "0", marginBlockStart: u7 = "0" } = t4;
          r2.x = i3.x + parseFloat(y2), r2.y = i3.y + parseFloat(u7);
        }
      }
      return e4 && f3 ? { x: s2 + r2.x, y: l4 + r2.y, data: r2 } : e4 ? { x: s2, y: l4, data: r2 } : { x: s2 - r2.x, y: l4 - r2.y, data: r2 };
    } });
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/PlacementController.js
function p4(o6) {
  if (typeof o6 == "undefined")
    return 0;
  const t4 = window.devicePixelRatio || 1;
  return Math.round(o6 * t4) / t4;
}
var m3, L2, A2, placementUpdatedSymbol, PlacementController;
var init_PlacementController = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/PlacementController.js"() {
    "use strict";
    init_floating_ui_dom();
    init_topLayerOverTransforms();
    m3 = 8;
    L2 = 100;
    A2 = (o6) => {
      var e4;
      return (e4 = { left: ["right", "bottom", "top"], "left-start": ["right-start", "bottom", "top"], "left-end": ["right-end", "bottom", "top"], right: ["left", "bottom", "top"], "right-start": ["left-start", "bottom", "top"], "right-end": ["left-end", "bottom", "top"], top: ["bottom", "left", "right"], "top-start": ["bottom-start", "left", "right"], "top-end": ["bottom-end", "left", "right"], bottom: ["top", "left", "right"], "bottom-start": ["top-start", "left", "right"], "bottom-end": ["top-end", "left", "right"] }[o6]) != null ? e4 : [o6];
    };
    placementUpdatedSymbol = Symbol("placement updated");
    PlacementController = class {
      constructor(t4) {
        this.originalPlacements = /* @__PURE__ */ new WeakMap();
        this.allowPlacementUpdate = false;
        this.updatePlacement = () => {
          if (!this.allowPlacementUpdate && this.options.type !== "modal" && this.cleanup) {
            this.target.dispatchEvent(new Event("close", { bubbles: true }));
            return;
          }
          this.computePlacement(), this.allowPlacementUpdate = false;
        };
        this.resetOverlayPosition = () => {
          !this.target || !this.options || (this.target.style.removeProperty("max-height"), this.target.style.removeProperty("height"), this.initialHeight = void 0, this.isConstrained = false, this.host.offsetHeight, this.computePlacement());
        };
        this.host = t4, this.host.addController(this);
      }
      async placeOverlay(t4 = this.target, e4 = this.options) {
        if (this.target = t4, this.options = e4, !t4 || !e4)
          return;
        const c5 = autoUpdate(e4.trigger, t4, this.updatePlacement, { elementResize: false, layoutShift: false });
        this.cleanup = () => {
          var r2;
          (r2 = this.host.elements) == null || r2.forEach((s2) => {
            s2.addEventListener("sp-closed", () => {
              const a5 = this.originalPlacements.get(s2);
              a5 && s2.setAttribute("placement", a5), this.originalPlacements.delete(s2);
            }, { once: true });
          }), c5();
        };
      }
      async computePlacement() {
        var f3, g2;
        const { options: t4, target: e4 } = this;
        await (document.fonts ? document.fonts.ready : Promise.resolve());
        const c5 = t4.trigger instanceof HTMLElement ? flip() : flip({ padding: m3, fallbackPlacements: A2(t4.placement) }), [r2 = 0, s2 = 0] = Array.isArray(t4 == null ? void 0 : t4.offset) ? t4.offset : [t4.offset, 0], a5 = (f3 = this.host.elements.find((i3) => i3.tipElement)) == null ? void 0 : f3.tipElement, v2 = [offset({ mainAxis: r2, crossAxis: s2 }), shift({ padding: m3 }), c5, size({ padding: m3, apply: ({ availableWidth: i3, availableHeight: h3, rects: { floating: x2 } }) => {
          const u7 = Math.max(L2, Math.floor(h3)), l4 = x2.height;
          this.initialHeight = this.isConstrained && this.initialHeight || l4, this.isConstrained = l4 < this.initialHeight || u7 <= l4;
          const b3 = this.isConstrained ? `${u7}px` : "";
          Object.assign(e4.style, { maxWidth: `${Math.floor(i3)}px`, maxHeight: b3, height: b3 });
        } }), ...a5 ? [arrow({ element: a5, padding: t4.tipPadding || m3 })] : [], topLayerOverTransforms()], { x: P3, y: E2, placement: n5, middlewareData: d3 } = await computePosition2(t4.trigger, e4, { placement: t4.placement, middleware: v2, strategy: "fixed" });
        if (Object.assign(e4.style, { top: "0px", left: "0px", translate: `${p4(P3)}px ${p4(E2)}px` }), e4.setAttribute("actual-placement", n5), (g2 = this.host.elements) == null || g2.forEach((i3) => {
          this.originalPlacements.set(i3, i3.getAttribute("placement")), i3.setAttribute("placement", n5);
        }), a5 && d3.arrow) {
          const { x: i3, y: h3 } = d3.arrow;
          Object.assign(a5.style, { top: n5.startsWith("right") || n5.startsWith("left") ? "0px" : "", left: n5.startsWith("bottom") || n5.startsWith("top") ? "0px" : "", translate: `${p4(i3)}px ${p4(h3)}px` });
        }
      }
      hostConnected() {
        document.addEventListener("sp-update-overlays", this.resetOverlayPosition);
      }
      hostUpdated() {
        var t4;
        this.host.open || ((t4 = this.cleanup) == null || t4.call(this), this.cleanup = void 0);
      }
      hostDisconnected() {
        var t4;
        (t4 = this.cleanup) == null || t4.call(this), this.cleanup = void 0, document.removeEventListener("sp-update-overlays", this.resetOverlayPosition);
      }
    };
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/overlay.css.js
var o3, overlay_css_default;
var init_overlay_css = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/overlay.css.js"() {
    "use strict";
    init_src();
    o3 = src_exports.css`
:host{--swc-overlay-animation-distance:var(
--spectrum-picker-m-texticon-popover-offset-y,var(--spectrum-global-dimension-size-75)
);display:contents;pointer-events:none}.dialog{--sp-overlay-open:true;background:none;border:0;box-sizing:border-box;display:flex;height:auto;inset:auto;left:0;margin:0;max-height:calc(100vh - 16px);max-height:calc(100dvh - 16px);max-width:calc(100vw - 16px);opacity:1!important;overflow:visible;padding:0;position:fixed;top:0}.dialog:not([is-visible]){translate:-999em -999em!important}.dialog:focus{outline:none}dialog:modal{--mod-popover-filter:var(--spectrum-popover-filter)}:host(:not([open])) .dialog{--sp-overlay-open:false}.dialog::backdrop{display:none}.dialog:before{content:"";inset:-999em;pointer-events:auto!important;position:absolute}.dialog:not(.not-immediately-closable):before{display:none}.dialog>div{width:100%}::slotted(*){pointer-events:auto}::slotted(sp-popover){position:static}::slotted(sp-tooltip){--swc-tooltip-margin:0}.dialog:not([actual-placement])[placement*=top]{margin-top:var(--swc-overlay-animation-distance);padding-block:var(--swc-overlay-animation-distance)}.dialog:not([actual-placement])[placement*=right]{margin-left:calc(var(--swc-overlay-animation-distance)*-1);padding-inline:var(--swc-overlay-animation-distance)}.dialog:not([actual-placement])[placement*=bottom]{margin-top:calc(var(--swc-overlay-animation-distance)*-1);padding-block:var(--swc-overlay-animation-distance)}.dialog:not([actual-placement])[placement*=left]{margin-left:var(--swc-overlay-animation-distance);padding-inline:var(--swc-overlay-animation-distance)}.dialog[actual-placement*=top]{margin-top:var(--swc-overlay-animation-distance);padding-block:var(--swc-overlay-animation-distance)}.dialog[actual-placement*=right]{margin-left:calc(var(--swc-overlay-animation-distance)*-1);padding-inline:var(--swc-overlay-animation-distance)}.dialog[actual-placement*=bottom]{margin-top:calc(var(--swc-overlay-animation-distance)*-1);padding-block:var(--swc-overlay-animation-distance)}.dialog[actual-placement*=left]{margin-left:var(--swc-overlay-animation-distance);padding-inline:var(--swc-overlay-animation-distance)}slot[name=longpress-describedby-descriptor]{display:none}@supports selector(:open){.dialog{opacity:0}.dialog:open{--mod-popover-filter:var(--spectrum-popover-filter);opacity:1}}@supports selector(:popover-open){.dialog{opacity:0}.dialog:popover-open{--mod-popover-filter:var(--spectrum-popover-filter);opacity:1}}@supports (not selector(:open)) and (not selector(:popover-open)){:host:not([open]) .dialog{pointer-events:none}.dialog[actual-placement]{z-index:calc(var(--swc-overlay-z-index-base, 1000) + var(--swc-overlay-open-count))}}
`;
    overlay_css_default = o3;
  }
});

// ../../node_modules/@spectrum-web-components/overlay/src/Overlay.js
var P2, w3, n4, V2, F2, LONGPRESS_INSTRUCTIONS, U2, c4, o4, Overlay;
var init_Overlay = __esm({
  "../../node_modules/@spectrum-web-components/overlay/src/Overlay.js"() {
    "use strict";
    init_src();
    init_decorators();
    init_platform();
    init_ElementResolution();
    init_condition_attribute_with_id();
    init_directives();
    init_AbstractOverlay();
    init_OverlayDialog();
    init_OverlayPopover();
    init_OverlayNoPopover();
    init_OverlayStack();
    init_AbstractOverlay();
    init_VirtualTrigger();
    init_PlacementController();
    init_overlay_css();
    P2 = Object.defineProperty;
    w3 = Object.getOwnPropertyDescriptor;
    n4 = (v2, h3, e4, t4) => {
      for (var i3 = t4 > 1 ? void 0 : t4 ? w3(h3, e4) : h3, r2 = v2.length - 1, s2; r2 >= 0; r2--)
        (s2 = v2[r2]) && (i3 = (t4 ? s2(h3, e4, i3) : s2(i3)) || i3);
      return t4 && i3 && P2(h3, e4, i3), i3;
    };
    V2 = 300;
    F2 = 300;
    LONGPRESS_INSTRUCTIONS = { touch: "Double tap and long press for additional options", keyboard: "Press Space or Alt+Down Arrow for additional options", mouse: "Click and hold for additional options" };
    U2 = "showPopover" in document.createElement("div");
    c4 = OverlayDialog(AbstractOverlay);
    U2 ? c4 = OverlayPopover(c4) : c4 = OverlayNoPopover(c4);
    o4 = class o5 extends c4 {
      constructor() {
        super(...arguments);
        this._delayed = false;
        this._disabled = false;
        this.longpressState = "null";
        this.offset = 6;
        this.placementController = new PlacementController(this);
        this._open = false;
        this.receivesFocus = "auto";
        this.releaseAriaDescribedby = noop;
        this.releaseLongpressDescribedby = noop;
        this._state = "closed";
        this.triggerElement = null;
        this.type = "auto";
        this.wasOpen = false;
        this.elementResolver = new ElementResolutionController(this);
        this.closeOnFocusOut = (e4) => {
          if (!e4.relatedTarget)
            return;
          const t4 = new Event("overlay-relation-query", { bubbles: true, composed: true });
          e4.relatedTarget.addEventListener(t4.type, (i3) => {
            i3.composedPath().includes(this) || (this.open = false);
          }), e4.relatedTarget.dispatchEvent(t4);
        };
        this.elementIds = [];
        this.handlePointerdown = (e4) => {
          if (!this.triggerElement || e4.button !== 0)
            return;
          const t4 = this.triggerElement;
          this.longpressState = "potential", document.addEventListener("pointerup", this.handlePointerup), document.addEventListener("pointercancel", this.handlePointerup), !t4.holdAffordance && (this.longressTimeout = setTimeout(() => {
            t4 && t4.dispatchEvent(new CustomEvent("longpress", { bubbles: true, composed: true, detail: { source: "pointer" } }));
          }, V2));
        };
        this.handlePointerup = () => {
          clearTimeout(this.longressTimeout), this.triggerElement && (this.longpressState = this.state === "opening" ? "pressed" : "null", document.removeEventListener("pointerup", this.handlePointerup), document.removeEventListener("pointercancel", this.handlePointerup));
        };
        this.handleKeydown = (e4) => {
          const { code: t4, altKey: i3 } = e4;
          (t4 === "Space" || i3 && t4 === "ArrowDown") && t4 === "ArrowDown" && (e4.stopPropagation(), e4.stopImmediatePropagation());
        };
        this.handleKeyup = (e4) => {
          const { code: t4, altKey: i3 } = e4;
          if (t4 === "Space" || i3 && t4 === "ArrowDown") {
            if (!this.triggerElement || !this.hasNonVirtualTrigger)
              return;
            e4.stopPropagation(), this.triggerElement.dispatchEvent(new CustomEvent("longpress", { bubbles: true, composed: true, detail: { source: "keyboard" } })), setTimeout(() => {
              this.longpressState = "null";
            });
          }
        };
        this.preventNextToggle = false;
        this.handlePointerdownForClick = () => {
          this.preventNextToggle = this.open;
        };
        this.handleClick = () => {
          this.longpressState === "opening" || this.longpressState === "pressed" || (this.preventNextToggle || (this.open = !this.open), this.preventNextToggle = false);
        };
        this.focusedin = false;
        this.handleFocusin = () => {
          this.open = true, this.focusedin = true;
        };
        this.handleFocusout = () => {
          this.focusedin = false, !this.pointerentered && (this.open = false);
        };
        this.pointerentered = false;
        this.handlePointerenter = () => {
          this.hoverTimeout && (clearTimeout(this.hoverTimeout), delete this.hoverTimeout), !this.disabled && (this.open = true, this.pointerentered = true);
        };
        this.handleOverlayPointerenter = () => {
          this.hoverTimeout && (clearTimeout(this.hoverTimeout), delete this.hoverTimeout);
        };
        this.handlePointerleave = () => {
          this.doPointerleave();
        };
        this.handleOverlayPointerleave = () => {
          this.doPointerleave();
        };
        this.handleLongpress = () => {
          this.open = true, this.longpressState = this.longpressState === "potential" ? "opening" : "pressed";
        };
      }
      get delayed() {
        var e4;
        return ((e4 = this.elements.at(-1)) == null ? void 0 : e4.hasAttribute("delayed")) || this._delayed;
      }
      set delayed(e4) {
        this._delayed = e4;
      }
      get disabled() {
        return this._disabled;
      }
      set disabled(e4) {
        this._disabled = e4, e4 ? (this.hasNonVirtualTrigger && this.unbindEvents(), this.wasOpen = this.open, this.open = false) : (this.bindEvents(), this.open = this.open || this.wasOpen, this.wasOpen = false);
      }
      get hasNonVirtualTrigger() {
        return !!this.triggerElement && !(this.triggerElement instanceof VirtualTrigger);
      }
      get open() {
        return this._open;
      }
      set open(e4) {
        e4 && this.disabled || e4 !== this.open && ((this.longpressState === "opening" || this.longpressState === "pressed") && !e4 || (this._open = e4, this.open && (o5.openCount += 1), this.requestUpdate("open", !this.open)));
      }
      get state() {
        return this._state;
      }
      set state(e4) {
        if (e4 === this.state)
          return;
        const t4 = this.state;
        this._state = e4, (this.state === "opened" || this.state === "closed") && (this.longpressState = this.longpressState === "pressed" ? "null" : this.longpressState), this.requestUpdate("state", t4);
      }
      get usesDialog() {
        return this.type === "modal" || this.type === "page";
      }
      get popoverValue() {
        if ("popover" in this)
          switch (this.type) {
            case "modal":
            case "page":
              return;
            case "hint":
              return "manual";
            default:
              return this.type;
          }
      }
      get requiresPosition() {
        return !(this.type === "page" || !this.open || !this.triggerElement || !this.placement && this.type !== "hint");
      }
      managePosition() {
        if (!this.requiresPosition || !this.open)
          return;
        const e4 = this.offset || 0, t4 = this.triggerElement, i3 = this.placement || "right", r2 = this.tipPadding;
        this.placementController.placeOverlay(this.dialogEl, { offset: e4, placement: i3, tipPadding: r2, trigger: t4, type: this.type });
      }
      async managePopoverOpen() {
        super.managePopoverOpen();
        const e4 = this.open;
        if (this.open !== e4 || (await this.manageDelay(e4), this.open !== e4) || (await this.ensureOnDOM(e4), this.open !== e4))
          return;
        const t4 = await this.makeTransition(e4);
        this.open === e4 && await this.applyFocus(e4, t4);
      }
      async applyFocus(e4, t4) {
        if (!(this.receivesFocus === "false" || this.type === "hint")) {
          if (await nextFrame(), await nextFrame(), e4 === this.open && !this.open) {
            this.hasNonVirtualTrigger && this.contains(this.getRootNode().activeElement) && this.triggerElement.focus();
            return;
          }
          t4 == null || t4.focus();
        }
      }
      async manageOpen(e4) {
        var t4;
        if (!(!this.isConnected && this.open)) {
          if (this.hasUpdated || await this.updateComplete, this.open ? (overlayStack.add(this), this.willPreventClose && (document.addEventListener("pointerup", () => {
            this.dialogEl.classList.toggle("not-immediately-closable", false), this.willPreventClose = false;
          }, { once: true }), this.dialogEl.classList.toggle("not-immediately-closable", true))) : (e4 && this.dispose(), overlayStack.remove(this)), this.open && this.state !== "opened" ? this.state = "opening" : !this.open && this.state !== "closed" && (this.state = "closing"), this.usesDialog ? this.manageDialogOpen() : this.managePopoverOpen(), this.type === "auto") {
            const i3 = this.getRootNode();
            this.open ? i3.addEventListener("focusout", this.closeOnFocusOut, { capture: true }) : i3.removeEventListener("focusout", this.closeOnFocusOut, { capture: true });
          }
          if (!this.open && this.type !== "hint") {
            const i3 = () => {
              var p5;
              const r2 = [];
              let s2 = document.activeElement;
              for (; s2 != null && s2.shadowRoot && s2.shadowRoot.activeElement; )
                s2 = s2.shadowRoot.activeElement;
              for (; s2; ) {
                const a5 = s2.assignedSlot || s2.parentElement || ((p5 = s2.getRootNode()) == null ? void 0 : p5.host);
                a5 && r2.push(a5), s2 = a5;
              }
              return r2;
            };
            (t4 = this.triggerElement) != null && t4.focus && (this.contains(this.getRootNode().activeElement) || i3().includes(this)) && this.triggerElement.focus();
          }
        }
      }
      unbindEvents() {
        var e4;
        (e4 = this.abortController) == null || e4.abort();
      }
      bindEvents() {
        if (!this.hasNonVirtualTrigger)
          return;
        this.abortController = new AbortController();
        const e4 = this.triggerElement;
        switch (this.triggerInteraction) {
          case "click":
            this.bindClickEvents(e4);
            return;
          case "longpress":
            this.bindLongpressEvents(e4);
            return;
          case "hover":
            this.bindHoverEvents(e4);
            return;
        }
      }
      bindClickEvents(e4) {
        const t4 = { signal: this.abortController.signal };
        e4.addEventListener("click", this.handleClick, t4), e4.addEventListener("pointerdown", this.handlePointerdownForClick, t4);
      }
      bindLongpressEvents(e4) {
        const t4 = { signal: this.abortController.signal };
        e4.addEventListener("longpress", this.handleLongpress, t4), e4.addEventListener("pointerdown", this.handlePointerdown, t4), this.prepareLongpressDescription(e4), !e4.holdAffordance && (e4.addEventListener("keydown", this.handleKeydown, t4), e4.addEventListener("keyup", this.handleKeyup, t4));
      }
      bindHoverEvents(e4) {
        const t4 = { signal: this.abortController.signal };
        e4.addEventListener("focusin", this.handleFocusin, t4), e4.addEventListener("focusout", this.handleFocusout, t4), e4.addEventListener("pointerenter", this.handlePointerenter, t4), e4.addEventListener("pointerleave", this.handlePointerleave, t4), this.addEventListener("pointerenter", this.handleOverlayPointerenter, t4), this.addEventListener("pointerleave", this.handleOverlayPointerleave, t4);
      }
      manageTriggerElement(e4) {
        e4 && (this.unbindEvents(), this.releaseAriaDescribedby()), !(!this.triggerElement || this.triggerElement instanceof VirtualTrigger) && (this.bindEvents(), this.receivesFocus !== "true" && this.prepareAriaDescribedby());
      }
      prepareLongpressDescription(e4) {
        if (this.triggerInteraction !== "longpress" || this.releaseLongpressDescribedby !== noop || !this.elements.length)
          return;
        const t4 = document.createElement("div");
        t4.id = `longpress-describedby-descriptor-${crypto.randomUUID().slice(0, 8)}`;
        const i3 = isIOS() || isAndroid() ? "touch" : "keyboard";
        t4.textContent = LONGPRESS_INSTRUCTIONS[i3], t4.slot = "longpress-describedby-descriptor";
        const r2 = e4.getRootNode(), s2 = this.getRootNode();
        r2 === s2 ? this.append(t4) : (t4.hidden = !("host" in r2), e4.insertAdjacentElement("afterend", t4));
        const p5 = conditionAttributeWithId(e4, "aria-describedby", [t4.id]);
        this.releaseLongpressDescribedby = () => {
          p5(), t4.remove(), this.releaseLongpressDescribedby = noop;
        };
      }
      prepareAriaDescribedby() {
        if (this.triggerInteraction !== "hover" || this.releaseAriaDescribedby !== noop || !this.elements.length || !this.hasNonVirtualTrigger)
          return;
        const e4 = this.triggerElement, t4 = e4.getRootNode(), i3 = this.elements[0].getRootNode(), r2 = this.getRootNode();
        if (t4 == r2) {
          const s2 = conditionAttributeWithId(e4, "aria-describedby", [this.id]);
          this.releaseAriaDescribedby = () => {
            s2(), this.releaseAriaDescribedby = noop;
          };
        } else if (t4 === i3) {
          this.elementIds = this.elements.map((a5) => a5.id);
          const s2 = this.elements.map((a5) => (a5.id || (a5.id = `${this.tagName.toLowerCase()}-helper-${crypto.randomUUID().slice(0, 8)}`), a5.id)), p5 = conditionAttributeWithId(e4, "aria-describedby", s2);
          this.releaseAriaDescribedby = () => {
            p5(), this.elements.map((a5, L3) => {
              a5.id = this.elementIds[L3];
            }), this.releaseAriaDescribedby = noop;
          };
        }
      }
      doPointerleave() {
        this.pointerentered = false;
        const e4 = this.triggerElement;
        this.focusedin && e4.matches(":focus-visible") || (this.hoverTimeout = setTimeout(() => {
          this.open = false;
        }, F2));
      }
      handleBeforetoggle(e4) {
        e4.newState !== "open" && this.handleBrowserClose();
      }
      handleBrowserClose() {
        if (this.longpressState !== "opening" && this.longpressState !== "pressed") {
          this.open = false;
          return;
        }
        this.manuallyKeepOpen();
      }
      manuallyKeepOpen() {
        super.manuallyKeepOpen(), this.open = true, this.placementController.allowPlacementUpdate = true, this.manageOpen(false);
      }
      handleSlotchange() {
        this.triggerElement && this.prepareAriaDescribedby(), this.elements.length ? this.hasNonVirtualTrigger && this.prepareLongpressDescription(this.triggerElement) : this.releaseLongpressDescribedby();
      }
      shouldPreventClose() {
        const e4 = this.willPreventClose;
        return this.willPreventClose = false, e4;
      }
      willUpdate(e4) {
        var i3;
        if (this.hasAttribute("id") || this.setAttribute("id", `${this.tagName.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`), e4.has("open") && (typeof e4.get("open") != "undefined" || this.open) && this.manageOpen(e4.get("open")), e4.has("trigger")) {
          const [r2, s2] = ((i3 = this.trigger) == null ? void 0 : i3.split("@")) || [];
          this.elementResolver.selector = r2 ? `#${r2}` : "", this.triggerInteraction = s2;
        }
        const t4 = this.triggerElement;
        e4.has(elementResolverUpdatedSymbol) && (this.triggerElement = this.elementResolver.element, this.manageTriggerElement(t4)), e4.has("triggerElement") && this.manageTriggerElement(e4.get("triggerElement"));
      }
      updated(e4) {
        super.updated(e4), e4.has("placement") && (this.placement ? this.dialogEl.setAttribute("actual-placement", this.placement) : this.dialogEl.removeAttribute("actual-placement"), this.open && typeof e4.get("placement") != "undefined" && this.placementController.resetOverlayPosition());
      }
      renderContent() {
        return src_exports.html`
            <slot @slotchange=${this.handleSlotchange}></slot>
        `;
      }
      get dialogStyleMap() {
        return { "--swc-overlay-open-count": o5.openCount.toString() };
      }
      renderDialog() {
        return src_exports.html`
            <dialog
                class="dialog"
                part="dialog"
                placement=${ifDefined(this.requiresPosition ? this.placement || "right" : void 0)}
                style=${styleMap(this.dialogStyleMap)}
                @close=${this.handleBrowserClose}
                @cancel=${this.handleBrowserClose}
                @beforetoggle=${this.handleBeforetoggle}
                ?is-visible=${this.state !== "closed"}
            >
                ${this.renderContent()}
            </dialog>
        `;
      }
      renderPopover() {
        return src_exports.html`
            <div
                class="dialog"
                part="dialog"
                placement=${ifDefined(this.requiresPosition ? this.placement || "right" : void 0)}
                popover=${ifDefined(this.popoverValue)}
                style=${styleMap(this.dialogStyleMap)}
                @beforetoggle=${this.handleBeforetoggle}
                @close=${this.handleBrowserClose}
                ?is-visible=${this.state !== "closed"}
            >
                ${this.renderContent()}
            </div>
        `;
      }
      render() {
        const e4 = this.type === "modal" || this.type === "page";
        return src_exports.html`
            ${e4 ? this.renderDialog() : this.renderPopover()}
            <slot name="longpress-describedby-descriptor"></slot>
        `;
      }
      connectedCallback() {
        super.connectedCallback(), this.addEventListener("close", () => {
          this.open = false;
        }), this.hasNonVirtualTrigger && this.bindEvents();
      }
      disconnectedCallback() {
        this.hasNonVirtualTrigger && this.unbindEvents(), this.releaseAriaDescribedby(), this.releaseLongpressDescribedby(), this.open = false, super.disconnectedCallback();
      }
    };
    o4.styles = [overlay_css_default], o4.openCount = 1, n4([(0, decorators_exports.property)({ type: Boolean })], o4.prototype, "delayed", 1), n4([(0, decorators_exports.query)(".dialog")], o4.prototype, "dialogEl", 2), n4([(0, decorators_exports.property)({ type: Boolean })], o4.prototype, "disabled", 1), n4([(0, decorators_exports.queryAssignedElements)({ flatten: true, selector: ':not([slot="longpress-describedby-descriptor"], slot)' })], o4.prototype, "elements", 2), n4([(0, decorators_exports.property)({ type: Number })], o4.prototype, "offset", 2), n4([(0, decorators_exports.property)({ type: Boolean, reflect: true })], o4.prototype, "open", 1), n4([(0, decorators_exports.property)()], o4.prototype, "placement", 2), n4([(0, decorators_exports.property)({ attribute: "receives-focus" })], o4.prototype, "receivesFocus", 2), n4([(0, decorators_exports.query)("slot")], o4.prototype, "slotEl", 2), n4([(0, decorators_exports.state)()], o4.prototype, "state", 1), n4([(0, decorators_exports.property)({ type: Number, attribute: "tip-padding" })], o4.prototype, "tipPadding", 2), n4([(0, decorators_exports.property)()], o4.prototype, "trigger", 2), n4([(0, decorators_exports.property)({ attribute: false })], o4.prototype, "triggerElement", 2), n4([(0, decorators_exports.property)({ attribute: false })], o4.prototype, "triggerInteraction", 2), n4([(0, decorators_exports.property)()], o4.prototype, "type", 2);
    Overlay = o4;
  }
});

// src/sidenav/merch-sidenav.js
import { html as html4, css as css5, LitElement as LitElement4 } from "./lit-all.min.js";

// ../../node_modules/@spectrum-web-components/reactive-controllers/src/MatchMedia.js
var MatchMediaController = class {
  constructor(e4, t4) {
    this.key = Symbol("match-media-key");
    this.matches = false;
    this.host = e4, this.host.addController(this), this.media = window.matchMedia(t4), this.matches = this.media.matches, this.onChange = this.onChange.bind(this), e4.addController(this);
  }
  hostConnected() {
    var e4;
    (e4 = this.media) == null || e4.addEventListener("change", this.onChange);
  }
  hostDisconnected() {
    var e4;
    (e4 = this.media) == null || e4.removeEventListener("change", this.onChange);
  }
  onChange(e4) {
    this.matches !== e4.matches && (this.matches = e4.matches, this.host.requestUpdate(this.key, !this.matches));
  }
};

// src/sidenav/merch-sidenav-heading.css.js
import { css } from "./lit-all.min.js";
var headingStyles = css`
    h2 {
        font-size: 11px;
        font-style: normal;
        font-weight: 500;
        height: 32px;
        letter-spacing: 0.06em;
        padding: 0 12px;
        line-height: 32px;
        color: #747474;
    }
`;

// src/merch-search.js
import { html, LitElement, css as css2 } from "./lit-all.min.js";

// src/deeplink.js
function parseState(hash = window.location.hash) {
  const result = [];
  const keyValuePairs = hash.replace(/^#/, "").split("&");
  for (const pair of keyValuePairs) {
    const [key, value = ""] = pair.split("=");
    if (key) {
      result.push([key, decodeURIComponent(value)]);
    }
  }
  return Object.fromEntries(result);
}
function pushStateFromComponent(component, value) {
  if (component.deeplink) {
    const state = {};
    state[component.deeplink] = value;
    pushState(state);
  }
}
function pushState(state) {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  Object.entries(state).forEach(([key, value]) => {
    if (value) {
      hash.set(key, value);
    } else {
      hash.delete(key);
    }
  });
  hash.sort();
  window.location.hash = decodeURIComponent(hash.toString());
}

// ../../node_modules/@esm-bundle/lodash/esm/index.js
var t = "object" == typeof global && global && global.Object === Object && global;
var n = "object" == typeof self && self && self.Object === Object && self;
var r = t || n || Function("return this")();
var e = r.Symbol;
var i = Object.prototype;
var o = i.hasOwnProperty;
var u = i.toString;
var a = e ? e.toStringTag : void 0;
var f = Object.prototype.toString;
var c = e ? e.toStringTag : void 0;
function l(t4) {
  return null == t4 ? void 0 === t4 ? "[object Undefined]" : "[object Null]" : c && c in Object(t4) ? function(t5) {
    var n5 = o.call(t5, a), r2 = t5[a];
    try {
      t5[a] = void 0;
      var e4 = true;
    } catch (t6) {
    }
    var i3 = u.call(t5);
    return e4 && (n5 ? t5[a] = r2 : delete t5[a]), i3;
  }(t4) : function(t5) {
    return f.call(t5);
  }(t4);
}
function s(t4) {
  return null != t4 && "object" == typeof t4;
}
function p(t4) {
  return "symbol" == typeof t4 || s(t4) && "[object Symbol]" == l(t4);
}
function v(t4) {
  return "number" == typeof t4 ? t4 : p(t4) ? NaN : +t4;
}
function h(t4, n5) {
  for (var r2 = -1, e4 = null == t4 ? 0 : t4.length, i3 = Array(e4); ++r2 < e4; )
    i3[r2] = n5(t4[r2], r2, t4);
  return i3;
}
var d = Array.isArray;
var y = e ? e.prototype : void 0;
var _ = y ? y.toString : void 0;
function g(t4) {
  if ("string" == typeof t4)
    return t4;
  if (d(t4))
    return h(t4, g) + "";
  if (p(t4))
    return _ ? _.call(t4) : "";
  var n5 = t4 + "";
  return "0" == n5 && 1 / t4 == -Infinity ? "-0" : n5;
}
function b(t4, n5) {
  return function(r2, e4) {
    var i3;
    if (void 0 === r2 && void 0 === e4)
      return n5;
    if (void 0 !== r2 && (i3 = r2), void 0 !== e4) {
      if (void 0 === i3)
        return e4;
      "string" == typeof r2 || "string" == typeof e4 ? (r2 = g(r2), e4 = g(e4)) : (r2 = v(r2), e4 = v(e4)), i3 = t4(r2, e4);
    }
    return i3;
  };
}
var m = b(function(t4, n5) {
  return t4 + n5;
}, 0);
var j = /\s/;
function w(t4) {
  for (var n5 = t4.length; n5-- && j.test(t4.charAt(n5)); )
    ;
  return n5;
}
var x = /^\s+/;
function O(t4) {
  return t4 ? t4.slice(0, w(t4) + 1).replace(x, "") : t4;
}
function A(t4) {
  var n5 = typeof t4;
  return null != t4 && ("object" == n5 || "function" == n5);
}
var I = /^[-+]0x[0-9a-f]+$/i;
var E = /^0b[01]+$/i;
var k = /^0o[0-7]+$/i;
var S = parseInt;
function W(t4) {
  if ("number" == typeof t4)
    return t4;
  if (p(t4))
    return NaN;
  if (A(t4)) {
    var n5 = "function" == typeof t4.valueOf ? t4.valueOf() : t4;
    t4 = A(n5) ? n5 + "" : n5;
  }
  if ("string" != typeof t4)
    return 0 === t4 ? t4 : +t4;
  t4 = O(t4);
  var r2 = E.test(t4);
  return r2 || k.test(t4) ? S(t4.slice(2), r2 ? 2 : 8) : I.test(t4) ? NaN : +t4;
}
function M(t4) {
  return t4 ? Infinity === (t4 = W(t4)) || -Infinity === t4 ? 17976931348623157e292 * (t4 < 0 ? -1 : 1) : t4 == t4 ? t4 : 0 : 0 === t4 ? t4 : 0;
}
function R(t4) {
  var n5 = M(t4), r2 = n5 % 1;
  return n5 == n5 ? r2 ? n5 - r2 : n5 : 0;
}
function B(t4, n5) {
  if ("function" != typeof n5)
    throw new TypeError("Expected a function");
  return t4 = R(t4), function() {
    if (--t4 < 1)
      return n5.apply(this, arguments);
  };
}
function z(t4) {
  return t4;
}
function L(t4) {
  if (!A(t4))
    return false;
  var n5 = l(t4);
  return "[object Function]" == n5 || "[object GeneratorFunction]" == n5 || "[object AsyncFunction]" == n5 || "[object Proxy]" == n5;
}
var P;
var T = r["__core-js_shared__"];
var D = (P = /[^.]+$/.exec(T && T.keys && T.keys.IE_PROTO || "")) ? "Symbol(src)_1." + P : "";
var C = Function.prototype.toString;
function N(t4) {
  if (null != t4) {
    try {
      return C.call(t4);
    } catch (t5) {
    }
    try {
      return t4 + "";
    } catch (t5) {
    }
  }
  return "";
}
var U = /^\[object .+?Constructor\]$/;
var F = Function.prototype;
var q = Object.prototype;
var $ = F.toString;
var K = q.hasOwnProperty;
var V = RegExp("^" + $.call(K).replace(/[\\^$.*+?()[\]{}|]/g, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$");
function Z(t4) {
  return !(!A(t4) || function(t5) {
    return !!D && D in t5;
  }(t4)) && (L(t4) ? V : U).test(N(t4));
}
function G(t4, n5) {
  var r2 = function(t5, n6) {
    return null == t5 ? void 0 : t5[n6];
  }(t4, n5);
  return Z(r2) ? r2 : void 0;
}
var J = G(r, "WeakMap");
var H = J && new J();
var Y = H ? function(t4, n5) {
  return H.set(t4, n5), t4;
} : z;
var Q = Object.create;
var X = function() {
  function t4() {
  }
  return function(n5) {
    if (!A(n5))
      return {};
    if (Q)
      return Q(n5);
    t4.prototype = n5;
    var r2 = new t4();
    return t4.prototype = void 0, r2;
  };
}();
function tt(t4) {
  return function() {
    var n5 = arguments;
    switch (n5.length) {
      case 0:
        return new t4();
      case 1:
        return new t4(n5[0]);
      case 2:
        return new t4(n5[0], n5[1]);
      case 3:
        return new t4(n5[0], n5[1], n5[2]);
      case 4:
        return new t4(n5[0], n5[1], n5[2], n5[3]);
      case 5:
        return new t4(n5[0], n5[1], n5[2], n5[3], n5[4]);
      case 6:
        return new t4(n5[0], n5[1], n5[2], n5[3], n5[4], n5[5]);
      case 7:
        return new t4(n5[0], n5[1], n5[2], n5[3], n5[4], n5[5], n5[6]);
    }
    var r2 = X(t4.prototype), e4 = t4.apply(r2, n5);
    return A(e4) ? e4 : r2;
  };
}
function nt(t4, n5, r2) {
  switch (r2.length) {
    case 0:
      return t4.call(n5);
    case 1:
      return t4.call(n5, r2[0]);
    case 2:
      return t4.call(n5, r2[0], r2[1]);
    case 3:
      return t4.call(n5, r2[0], r2[1], r2[2]);
  }
  return t4.apply(n5, r2);
}
var rt = Math.max;
function et(t4, n5, r2, e4) {
  for (var i3 = -1, o6 = t4.length, u7 = r2.length, a5 = -1, f3 = n5.length, c5 = rt(o6 - u7, 0), l4 = Array(f3 + c5), s2 = !e4; ++a5 < f3; )
    l4[a5] = n5[a5];
  for (; ++i3 < u7; )
    (s2 || i3 < o6) && (l4[r2[i3]] = t4[i3]);
  for (; c5--; )
    l4[a5++] = t4[i3++];
  return l4;
}
var it = Math.max;
function ot(t4, n5, r2, e4) {
  for (var i3 = -1, o6 = t4.length, u7 = -1, a5 = r2.length, f3 = -1, c5 = n5.length, l4 = it(o6 - a5, 0), s2 = Array(l4 + c5), p5 = !e4; ++i3 < l4; )
    s2[i3] = t4[i3];
  for (var v2 = i3; ++f3 < c5; )
    s2[v2 + f3] = n5[f3];
  for (; ++u7 < a5; )
    (p5 || i3 < o6) && (s2[v2 + r2[u7]] = t4[i3++]);
  return s2;
}
function ut(t4, n5) {
  for (var r2 = t4.length, e4 = 0; r2--; )
    t4[r2] === n5 && ++e4;
  return e4;
}
function at() {
}
function ft(t4) {
  this.__wrapped__ = t4, this.__actions__ = [], this.__dir__ = 1, this.__filtered__ = false, this.__iteratees__ = [], this.__takeCount__ = 4294967295, this.__views__ = [];
}
function ct() {
}
ft.prototype = X(at.prototype), ft.prototype.constructor = ft;
var lt = H ? function(t4) {
  return H.get(t4);
} : ct;
var st = {};
var pt = Object.prototype.hasOwnProperty;
function vt(t4) {
  for (var n5 = t4.name + "", r2 = st[n5], e4 = pt.call(st, n5) ? r2.length : 0; e4--; ) {
    var i3 = r2[e4], o6 = i3.func;
    if (null == o6 || o6 == t4)
      return i3.name;
  }
  return n5;
}
function ht(t4, n5) {
  this.__wrapped__ = t4, this.__actions__ = [], this.__chain__ = !!n5, this.__index__ = 0, this.__values__ = void 0;
}
function dt(t4, n5) {
  var r2 = -1, e4 = t4.length;
  for (n5 || (n5 = Array(e4)); ++r2 < e4; )
    n5[r2] = t4[r2];
  return n5;
}
function yt(t4) {
  if (t4 instanceof ft)
    return t4.clone();
  var n5 = new ht(t4.__wrapped__, t4.__chain__);
  return n5.__actions__ = dt(t4.__actions__), n5.__index__ = t4.__index__, n5.__values__ = t4.__values__, n5;
}
ht.prototype = X(at.prototype), ht.prototype.constructor = ht;
var _t = Object.prototype.hasOwnProperty;
function gt(t4) {
  if (s(t4) && !d(t4) && !(t4 instanceof ft)) {
    if (t4 instanceof ht)
      return t4;
    if (_t.call(t4, "__wrapped__"))
      return yt(t4);
  }
  return new ht(t4);
}
function bt(t4) {
  var n5 = vt(t4), r2 = gt[n5];
  if ("function" != typeof r2 || !(n5 in ft.prototype))
    return false;
  if (t4 === r2)
    return true;
  var e4 = lt(r2);
  return !!e4 && t4 === e4[0];
}
gt.prototype = at.prototype, gt.prototype.constructor = gt;
var mt = Date.now;
function jt(t4) {
  var n5 = 0, r2 = 0;
  return function() {
    var e4 = mt(), i3 = 16 - (e4 - r2);
    if (r2 = e4, i3 > 0) {
      if (++n5 >= 800)
        return arguments[0];
    } else
      n5 = 0;
    return t4.apply(void 0, arguments);
  };
}
var wt = jt(Y);
var xt = /\{\n\/\* \[wrapped with (.+)\] \*/;
var Ot = /,? & /;
var At = /\{(?:\n\/\* \[wrapped with .+\] \*\/)?\n?/;
function It(t4) {
  return function() {
    return t4;
  };
}
var Et = function() {
  try {
    var t4 = G(Object, "defineProperty");
    return t4({}, "", {}), t4;
  } catch (t5) {
  }
}();
var kt = jt(Et ? function(t4, n5) {
  return Et(t4, "toString", { configurable: true, enumerable: false, value: It(n5), writable: true });
} : z);
function St(t4, n5) {
  for (var r2 = -1, e4 = null == t4 ? 0 : t4.length; ++r2 < e4 && false !== n5(t4[r2], r2, t4); )
    ;
  return t4;
}
function Wt(t4, n5, r2, e4) {
  for (var i3 = t4.length, o6 = r2 + (e4 ? 1 : -1); e4 ? o6-- : ++o6 < i3; )
    if (n5(t4[o6], o6, t4))
      return o6;
  return -1;
}
function Mt(t4) {
  return t4 != t4;
}
function Rt(t4, n5, r2) {
  return n5 == n5 ? function(t5, n6, r3) {
    for (var e4 = r3 - 1, i3 = t5.length; ++e4 < i3; )
      if (t5[e4] === n6)
        return e4;
    return -1;
  }(t4, n5, r2) : Wt(t4, Mt, r2);
}
function Bt(t4, n5) {
  return !!(null == t4 ? 0 : t4.length) && Rt(t4, n5, 0) > -1;
}
var zt = [["ary", 128], ["bind", 1], ["bindKey", 2], ["curry", 8], ["curryRight", 16], ["flip", 512], ["partial", 32], ["partialRight", 64], ["rearg", 256]];
function Lt(t4, n5, r2) {
  var e4 = n5 + "";
  return kt(t4, function(t5, n6) {
    var r3 = n6.length;
    if (!r3)
      return t5;
    var e5 = r3 - 1;
    return n6[e5] = (r3 > 1 ? "& " : "") + n6[e5], n6 = n6.join(r3 > 2 ? ", " : " "), t5.replace(At, "{\n/* [wrapped with " + n6 + "] */\n");
  }(e4, function(t5, n6) {
    return St(zt, function(r3) {
      var e5 = "_." + r3[0];
      n6 & r3[1] && !Bt(t5, e5) && t5.push(e5);
    }), t5.sort();
  }(function(t5) {
    var n6 = t5.match(xt);
    return n6 ? n6[1].split(Ot) : [];
  }(e4), r2)));
}
function Pt(t4, n5, r2, e4, i3, o6, u7, a5, f3, c5) {
  var l4 = 8 & n5;
  n5 |= l4 ? 32 : 64, 4 & (n5 &= ~(l4 ? 64 : 32)) || (n5 &= -4);
  var s2 = [t4, n5, i3, l4 ? o6 : void 0, l4 ? u7 : void 0, l4 ? void 0 : o6, l4 ? void 0 : u7, a5, f3, c5], p5 = r2.apply(void 0, s2);
  return bt(t4) && wt(p5, s2), p5.placeholder = e4, Lt(p5, t4, n5);
}
function Tt(t4) {
  return t4.placeholder;
}
var Dt = /^(?:0|[1-9]\d*)$/;
function Ct(t4, n5) {
  var r2 = typeof t4;
  return !!(n5 = null == n5 ? 9007199254740991 : n5) && ("number" == r2 || "symbol" != r2 && Dt.test(t4)) && t4 > -1 && t4 % 1 == 0 && t4 < n5;
}
var Nt = Math.min;
function Ut(t4, n5) {
  for (var r2 = t4.length, e4 = Nt(n5.length, r2), i3 = dt(t4); e4--; ) {
    var o6 = n5[e4];
    t4[e4] = Ct(o6, r2) ? i3[o6] : void 0;
  }
  return t4;
}
function Ft(t4, n5) {
  for (var r2 = -1, e4 = t4.length, i3 = 0, o6 = []; ++r2 < e4; ) {
    var u7 = t4[r2];
    u7 !== n5 && "__lodash_placeholder__" !== u7 || (t4[r2] = "__lodash_placeholder__", o6[i3++] = r2);
  }
  return o6;
}
function qt(t4, n5, e4, i3, o6, u7, a5, f3, c5, l4) {
  var s2 = 128 & n5, p5 = 1 & n5, v2 = 2 & n5, h3 = 24 & n5, d3 = 512 & n5, y2 = v2 ? void 0 : tt(t4);
  return function _2() {
    for (var g2 = arguments.length, b3 = Array(g2), m4 = g2; m4--; )
      b3[m4] = arguments[m4];
    if (h3)
      var j2 = Tt(_2), w4 = ut(b3, j2);
    if (i3 && (b3 = et(b3, i3, o6, h3)), u7 && (b3 = ot(b3, u7, a5, h3)), g2 -= w4, h3 && g2 < l4) {
      var x2 = Ft(b3, j2);
      return Pt(t4, n5, qt, _2.placeholder, e4, b3, x2, f3, c5, l4 - g2);
    }
    var O2 = p5 ? e4 : this, A3 = v2 ? O2[t4] : t4;
    return g2 = b3.length, f3 ? b3 = Ut(b3, f3) : d3 && g2 > 1 && b3.reverse(), s2 && c5 < g2 && (b3.length = c5), this && this !== r && this instanceof _2 && (A3 = y2 || tt(A3)), A3.apply(O2, b3);
  };
}
var $t = Math.min;
var Kt = Math.max;
function Vt(t4, n5, e4, i3, o6, u7, a5, f3) {
  var c5 = 2 & n5;
  if (!c5 && "function" != typeof t4)
    throw new TypeError("Expected a function");
  var l4 = i3 ? i3.length : 0;
  if (l4 || (n5 &= -97, i3 = o6 = void 0), a5 = void 0 === a5 ? a5 : Kt(R(a5), 0), f3 = void 0 === f3 ? f3 : R(f3), l4 -= o6 ? o6.length : 0, 64 & n5) {
    var s2 = i3, p5 = o6;
    i3 = o6 = void 0;
  }
  var v2 = c5 ? void 0 : lt(t4), h3 = [t4, n5, e4, i3, o6, s2, p5, u7, a5, f3];
  if (v2 && function(t5, n6) {
    var r2 = t5[1], e5 = n6[1], i4 = r2 | e5, o7 = i4 < 131, u8 = 128 == e5 && 8 == r2 || 128 == e5 && 256 == r2 && t5[7].length <= n6[8] || 384 == e5 && n6[7].length <= n6[8] && 8 == r2;
    if (!o7 && !u8)
      return t5;
    1 & e5 && (t5[2] = n6[2], i4 |= 1 & r2 ? 0 : 4);
    var a6 = n6[3];
    if (a6) {
      var f4 = t5[3];
      t5[3] = f4 ? et(f4, a6, n6[4]) : a6, t5[4] = f4 ? Ft(t5[3], "__lodash_placeholder__") : n6[4];
    }
    (a6 = n6[5]) && (f4 = t5[5], t5[5] = f4 ? ot(f4, a6, n6[6]) : a6, t5[6] = f4 ? Ft(t5[5], "__lodash_placeholder__") : n6[6]), (a6 = n6[7]) && (t5[7] = a6), 128 & e5 && (t5[8] = null == t5[8] ? n6[8] : $t(t5[8], n6[8])), null == t5[9] && (t5[9] = n6[9]), t5[0] = n6[0], t5[1] = i4;
  }(h3, v2), t4 = h3[0], n5 = h3[1], e4 = h3[2], i3 = h3[3], o6 = h3[4], !(f3 = h3[9] = void 0 === h3[9] ? c5 ? 0 : t4.length : Kt(h3[9] - l4, 0)) && 24 & n5 && (n5 &= -25), n5 && 1 != n5)
    d3 = 8 == n5 || 16 == n5 ? function(t5, n6, e5) {
      var i4 = tt(t5);
      return function o7() {
        for (var u8 = arguments.length, a6 = Array(u8), f4 = u8, c6 = Tt(o7); f4--; )
          a6[f4] = arguments[f4];
        var l5 = u8 < 3 && a6[0] !== c6 && a6[u8 - 1] !== c6 ? [] : Ft(a6, c6);
        return (u8 -= l5.length) < e5 ? Pt(t5, n6, qt, o7.placeholder, void 0, a6, l5, void 0, void 0, e5 - u8) : nt(this && this !== r && this instanceof o7 ? i4 : t5, this, a6);
      };
    }(t4, n5, f3) : 32 != n5 && 33 != n5 || o6.length ? qt.apply(void 0, h3) : function(t5, n6, e5, i4) {
      var o7 = 1 & n6, u8 = tt(t5);
      return function n7() {
        for (var a6 = -1, f4 = arguments.length, c6 = -1, l5 = i4.length, s3 = Array(l5 + f4), p6 = this && this !== r && this instanceof n7 ? u8 : t5; ++c6 < l5; )
          s3[c6] = i4[c6];
        for (; f4--; )
          s3[c6++] = arguments[++a6];
        return nt(p6, o7 ? e5 : this, s3);
      };
    }(t4, n5, e4, i3);
  else
    var d3 = function(t5, n6, e5) {
      var i4 = 1 & n6, o7 = tt(t5);
      return function n7() {
        return (this && this !== r && this instanceof n7 ? o7 : t5).apply(i4 ? e5 : this, arguments);
      };
    }(t4, n5, e4);
  return Lt((v2 ? Y : wt)(d3, h3), t4, n5);
}
function Zt(t4, n5, r2) {
  return n5 = r2 ? void 0 : n5, Vt(t4, 128, void 0, void 0, void 0, void 0, n5 = t4 && null == n5 ? t4.length : n5);
}
function Gt(t4, n5, r2) {
  "__proto__" == n5 && Et ? Et(t4, n5, { configurable: true, enumerable: true, value: r2, writable: true }) : t4[n5] = r2;
}
function Jt(t4, n5) {
  return t4 === n5 || t4 != t4 && n5 != n5;
}
var Ht = Object.prototype.hasOwnProperty;
function Yt(t4, n5, r2) {
  var e4 = t4[n5];
  Ht.call(t4, n5) && Jt(e4, r2) && (void 0 !== r2 || n5 in t4) || Gt(t4, n5, r2);
}
function Qt(t4, n5, r2, e4) {
  var i3 = !r2;
  r2 || (r2 = {});
  for (var o6 = -1, u7 = n5.length; ++o6 < u7; ) {
    var a5 = n5[o6], f3 = e4 ? e4(r2[a5], t4[a5], a5, r2, t4) : void 0;
    void 0 === f3 && (f3 = t4[a5]), i3 ? Gt(r2, a5, f3) : Yt(r2, a5, f3);
  }
  return r2;
}
var Xt = Math.max;
function tn(t4, n5, r2) {
  return n5 = Xt(void 0 === n5 ? t4.length - 1 : n5, 0), function() {
    for (var e4 = arguments, i3 = -1, o6 = Xt(e4.length - n5, 0), u7 = Array(o6); ++i3 < o6; )
      u7[i3] = e4[n5 + i3];
    i3 = -1;
    for (var a5 = Array(n5 + 1); ++i3 < n5; )
      a5[i3] = e4[i3];
    return a5[n5] = r2(u7), nt(t4, this, a5);
  };
}
function nn(t4, n5) {
  return kt(tn(t4, n5, z), t4 + "");
}
function rn(t4) {
  return "number" == typeof t4 && t4 > -1 && t4 % 1 == 0 && t4 <= 9007199254740991;
}
function en(t4) {
  return null != t4 && rn(t4.length) && !L(t4);
}
function on(t4, n5, r2) {
  if (!A(r2))
    return false;
  var e4 = typeof n5;
  return !!("number" == e4 ? en(r2) && Ct(n5, r2.length) : "string" == e4 && n5 in r2) && Jt(r2[n5], t4);
}
function un(t4) {
  return nn(function(n5, r2) {
    var e4 = -1, i3 = r2.length, o6 = i3 > 1 ? r2[i3 - 1] : void 0, u7 = i3 > 2 ? r2[2] : void 0;
    for (o6 = t4.length > 3 && "function" == typeof o6 ? (i3--, o6) : void 0, u7 && on(r2[0], r2[1], u7) && (o6 = i3 < 3 ? void 0 : o6, i3 = 1), n5 = Object(n5); ++e4 < i3; ) {
      var a5 = r2[e4];
      a5 && t4(n5, a5, e4, o6);
    }
    return n5;
  });
}
var an = Object.prototype;
function fn(t4) {
  var n5 = t4 && t4.constructor;
  return t4 === ("function" == typeof n5 && n5.prototype || an);
}
function cn(t4, n5) {
  for (var r2 = -1, e4 = Array(t4); ++r2 < t4; )
    e4[r2] = n5(r2);
  return e4;
}
function ln(t4) {
  return s(t4) && "[object Arguments]" == l(t4);
}
var sn = Object.prototype;
var pn = sn.hasOwnProperty;
var vn = sn.propertyIsEnumerable;
var hn = ln(function() {
  return arguments;
}()) ? ln : function(t4) {
  return s(t4) && pn.call(t4, "callee") && !vn.call(t4, "callee");
};
function dn() {
  return false;
}
var yn = "object" == typeof exports && exports && !exports.nodeType && exports;
var _n = yn && "object" == typeof module && module && !module.nodeType && module;
var gn = _n && _n.exports === yn ? r.Buffer : void 0;
var bn = (gn ? gn.isBuffer : void 0) || dn;
var mn = {};
function jn(t4) {
  return function(n5) {
    return t4(n5);
  };
}
mn["[object Float32Array]"] = mn["[object Float64Array]"] = mn["[object Int8Array]"] = mn["[object Int16Array]"] = mn["[object Int32Array]"] = mn["[object Uint8Array]"] = mn["[object Uint8ClampedArray]"] = mn["[object Uint16Array]"] = mn["[object Uint32Array]"] = true, mn["[object Arguments]"] = mn["[object Array]"] = mn["[object ArrayBuffer]"] = mn["[object Boolean]"] = mn["[object DataView]"] = mn["[object Date]"] = mn["[object Error]"] = mn["[object Function]"] = mn["[object Map]"] = mn["[object Number]"] = mn["[object Object]"] = mn["[object RegExp]"] = mn["[object Set]"] = mn["[object String]"] = mn["[object WeakMap]"] = false;
var wn = "object" == typeof exports && exports && !exports.nodeType && exports;
var xn = wn && "object" == typeof module && module && !module.nodeType && module;
var On = xn && xn.exports === wn && t.process;
var An = function() {
  try {
    var t4 = xn && xn.require && xn.require("util").types;
    return t4 || On && On.binding && On.binding("util");
  } catch (t5) {
  }
}();
var In = An && An.isTypedArray;
var En = In ? jn(In) : function(t4) {
  return s(t4) && rn(t4.length) && !!mn[l(t4)];
};
var kn = Object.prototype.hasOwnProperty;
function Sn(t4, n5) {
  var r2 = d(t4), e4 = !r2 && hn(t4), i3 = !r2 && !e4 && bn(t4), o6 = !r2 && !e4 && !i3 && En(t4), u7 = r2 || e4 || i3 || o6, a5 = u7 ? cn(t4.length, String) : [], f3 = a5.length;
  for (var c5 in t4)
    !n5 && !kn.call(t4, c5) || u7 && ("length" == c5 || i3 && ("offset" == c5 || "parent" == c5) || o6 && ("buffer" == c5 || "byteLength" == c5 || "byteOffset" == c5) || Ct(c5, f3)) || a5.push(c5);
  return a5;
}
function Wn(t4, n5) {
  return function(r2) {
    return t4(n5(r2));
  };
}
var Mn = Wn(Object.keys, Object);
var Rn = Object.prototype.hasOwnProperty;
function Bn(t4) {
  if (!fn(t4))
    return Mn(t4);
  var n5 = [];
  for (var r2 in Object(t4))
    Rn.call(t4, r2) && "constructor" != r2 && n5.push(r2);
  return n5;
}
function zn(t4) {
  return en(t4) ? Sn(t4) : Bn(t4);
}
var Ln = Object.prototype.hasOwnProperty;
var Pn = un(function(t4, n5) {
  if (fn(n5) || en(n5))
    Qt(n5, zn(n5), t4);
  else
    for (var r2 in n5)
      Ln.call(n5, r2) && Yt(t4, r2, n5[r2]);
});
var Tn = Object.prototype.hasOwnProperty;
function Dn(t4) {
  if (!A(t4))
    return function(t5) {
      var n6 = [];
      if (null != t5)
        for (var r3 in Object(t5))
          n6.push(r3);
      return n6;
    }(t4);
  var n5 = fn(t4), r2 = [];
  for (var e4 in t4)
    ("constructor" != e4 || !n5 && Tn.call(t4, e4)) && r2.push(e4);
  return r2;
}
function Cn(t4) {
  return en(t4) ? Sn(t4, true) : Dn(t4);
}
var Nn = un(function(t4, n5) {
  Qt(n5, Cn(n5), t4);
});
var Un = un(function(t4, n5, r2, e4) {
  Qt(n5, Cn(n5), t4, e4);
});
var Fn = un(function(t4, n5, r2, e4) {
  Qt(n5, zn(n5), t4, e4);
});
var qn = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
var $n = /^\w*$/;
function Kn(t4, n5) {
  if (d(t4))
    return false;
  var r2 = typeof t4;
  return !("number" != r2 && "symbol" != r2 && "boolean" != r2 && null != t4 && !p(t4)) || ($n.test(t4) || !qn.test(t4) || null != n5 && t4 in Object(n5));
}
var Vn = G(Object, "create");
var Zn = Object.prototype.hasOwnProperty;
var Gn = Object.prototype.hasOwnProperty;
function Jn(t4) {
  var n5 = -1, r2 = null == t4 ? 0 : t4.length;
  for (this.clear(); ++n5 < r2; ) {
    var e4 = t4[n5];
    this.set(e4[0], e4[1]);
  }
}
function Hn(t4, n5) {
  for (var r2 = t4.length; r2--; )
    if (Jt(t4[r2][0], n5))
      return r2;
  return -1;
}
Jn.prototype.clear = function() {
  this.__data__ = Vn ? Vn(null) : {}, this.size = 0;
}, Jn.prototype.delete = function(t4) {
  var n5 = this.has(t4) && delete this.__data__[t4];
  return this.size -= n5 ? 1 : 0, n5;
}, Jn.prototype.get = function(t4) {
  var n5 = this.__data__;
  if (Vn) {
    var r2 = n5[t4];
    return "__lodash_hash_undefined__" === r2 ? void 0 : r2;
  }
  return Zn.call(n5, t4) ? n5[t4] : void 0;
}, Jn.prototype.has = function(t4) {
  var n5 = this.__data__;
  return Vn ? void 0 !== n5[t4] : Gn.call(n5, t4);
}, Jn.prototype.set = function(t4, n5) {
  var r2 = this.__data__;
  return this.size += this.has(t4) ? 0 : 1, r2[t4] = Vn && void 0 === n5 ? "__lodash_hash_undefined__" : n5, this;
};
var Yn = Array.prototype.splice;
function Qn(t4) {
  var n5 = -1, r2 = null == t4 ? 0 : t4.length;
  for (this.clear(); ++n5 < r2; ) {
    var e4 = t4[n5];
    this.set(e4[0], e4[1]);
  }
}
Qn.prototype.clear = function() {
  this.__data__ = [], this.size = 0;
}, Qn.prototype.delete = function(t4) {
  var n5 = this.__data__, r2 = Hn(n5, t4);
  return !(r2 < 0) && (r2 == n5.length - 1 ? n5.pop() : Yn.call(n5, r2, 1), --this.size, true);
}, Qn.prototype.get = function(t4) {
  var n5 = this.__data__, r2 = Hn(n5, t4);
  return r2 < 0 ? void 0 : n5[r2][1];
}, Qn.prototype.has = function(t4) {
  return Hn(this.__data__, t4) > -1;
}, Qn.prototype.set = function(t4, n5) {
  var r2 = this.__data__, e4 = Hn(r2, t4);
  return e4 < 0 ? (++this.size, r2.push([t4, n5])) : r2[e4][1] = n5, this;
};
var Xn = G(r, "Map");
function tr(t4, n5) {
  var r2, e4, i3 = t4.__data__;
  return ("string" == (e4 = typeof (r2 = n5)) || "number" == e4 || "symbol" == e4 || "boolean" == e4 ? "__proto__" !== r2 : null === r2) ? i3["string" == typeof n5 ? "string" : "hash"] : i3.map;
}
function nr(t4) {
  var n5 = -1, r2 = null == t4 ? 0 : t4.length;
  for (this.clear(); ++n5 < r2; ) {
    var e4 = t4[n5];
    this.set(e4[0], e4[1]);
  }
}
nr.prototype.clear = function() {
  this.size = 0, this.__data__ = { hash: new Jn(), map: new (Xn || Qn)(), string: new Jn() };
}, nr.prototype.delete = function(t4) {
  var n5 = tr(this, t4).delete(t4);
  return this.size -= n5 ? 1 : 0, n5;
}, nr.prototype.get = function(t4) {
  return tr(this, t4).get(t4);
}, nr.prototype.has = function(t4) {
  return tr(this, t4).has(t4);
}, nr.prototype.set = function(t4, n5) {
  var r2 = tr(this, t4), e4 = r2.size;
  return r2.set(t4, n5), this.size += r2.size == e4 ? 0 : 1, this;
};
function rr(t4, n5) {
  if ("function" != typeof t4 || null != n5 && "function" != typeof n5)
    throw new TypeError("Expected a function");
  var r2 = function() {
    var e4 = arguments, i3 = n5 ? n5.apply(this, e4) : e4[0], o6 = r2.cache;
    if (o6.has(i3))
      return o6.get(i3);
    var u7 = t4.apply(this, e4);
    return r2.cache = o6.set(i3, u7) || o6, u7;
  };
  return r2.cache = new (rr.Cache || nr)(), r2;
}
rr.Cache = nr;
var er = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var ir = /\\(\\)?/g;
var or = function(t4) {
  var n5 = rr(t4, function(t5) {
    return 500 === r2.size && r2.clear(), t5;
  }), r2 = n5.cache;
  return n5;
}(function(t4) {
  var n5 = [];
  return 46 === t4.charCodeAt(0) && n5.push(""), t4.replace(er, function(t5, r2, e4, i3) {
    n5.push(e4 ? i3.replace(ir, "$1") : r2 || t5);
  }), n5;
});
function ur(t4) {
  return null == t4 ? "" : g(t4);
}
function ar(t4, n5) {
  return d(t4) ? t4 : Kn(t4, n5) ? [t4] : or(ur(t4));
}
function fr(t4) {
  if ("string" == typeof t4 || p(t4))
    return t4;
  var n5 = t4 + "";
  return "0" == n5 && 1 / t4 == -Infinity ? "-0" : n5;
}
function cr(t4, n5) {
  for (var r2 = 0, e4 = (n5 = ar(n5, t4)).length; null != t4 && r2 < e4; )
    t4 = t4[fr(n5[r2++])];
  return r2 && r2 == e4 ? t4 : void 0;
}
function lr(t4, n5, r2) {
  var e4 = null == t4 ? void 0 : cr(t4, n5);
  return void 0 === e4 ? r2 : e4;
}
function sr(t4, n5) {
  for (var r2 = -1, e4 = n5.length, i3 = Array(e4), o6 = null == t4; ++r2 < e4; )
    i3[r2] = o6 ? void 0 : lr(t4, n5[r2]);
  return i3;
}
function pr(t4, n5) {
  for (var r2 = -1, e4 = n5.length, i3 = t4.length; ++r2 < e4; )
    t4[i3 + r2] = n5[r2];
  return t4;
}
var vr = e ? e.isConcatSpreadable : void 0;
function hr(t4) {
  return d(t4) || hn(t4) || !!(vr && t4 && t4[vr]);
}
function dr(t4, n5, r2, e4, i3) {
  var o6 = -1, u7 = t4.length;
  for (r2 || (r2 = hr), i3 || (i3 = []); ++o6 < u7; ) {
    var a5 = t4[o6];
    n5 > 0 && r2(a5) ? n5 > 1 ? dr(a5, n5 - 1, r2, e4, i3) : pr(i3, a5) : e4 || (i3[i3.length] = a5);
  }
  return i3;
}
function yr(t4) {
  return (null == t4 ? 0 : t4.length) ? dr(t4, 1) : [];
}
function _r(t4) {
  return kt(tn(t4, void 0, yr), t4 + "");
}
var gr = _r(sr);
var br = Wn(Object.getPrototypeOf, Object);
var mr = Function.prototype;
var jr = Object.prototype;
var wr = mr.toString;
var xr = jr.hasOwnProperty;
var Or = wr.call(Object);
function Ar(t4) {
  if (!s(t4) || "[object Object]" != l(t4))
    return false;
  var n5 = br(t4);
  if (null === n5)
    return true;
  var r2 = xr.call(n5, "constructor") && n5.constructor;
  return "function" == typeof r2 && r2 instanceof r2 && wr.call(r2) == Or;
}
function Ir(t4) {
  if (!s(t4))
    return false;
  var n5 = l(t4);
  return "[object Error]" == n5 || "[object DOMException]" == n5 || "string" == typeof t4.message && "string" == typeof t4.name && !Ar(t4);
}
var Er = nn(function(t4, n5) {
  try {
    return nt(t4, void 0, n5);
  } catch (t5) {
    return Ir(t5) ? t5 : new Error(t5);
  }
});
function kr(t4, n5) {
  var r2;
  if ("function" != typeof n5)
    throw new TypeError("Expected a function");
  return t4 = R(t4), function() {
    return --t4 > 0 && (r2 = n5.apply(this, arguments)), t4 <= 1 && (n5 = void 0), r2;
  };
}
var Sr = nn(function(t4, n5, r2) {
  var e4 = 1;
  if (r2.length) {
    var i3 = Ft(r2, Tt(Sr));
    e4 |= 32;
  }
  return Vt(t4, e4, n5, r2, i3);
});
Sr.placeholder = {};
var Wr = _r(function(t4, n5) {
  return St(n5, function(n6) {
    n6 = fr(n6), Gt(t4, n6, Sr(t4[n6], t4));
  }), t4;
});
var Mr = nn(function(t4, n5, r2) {
  var e4 = 3;
  if (r2.length) {
    var i3 = Ft(r2, Tt(Mr));
    e4 |= 32;
  }
  return Vt(n5, e4, t4, r2, i3);
});
function Rr(t4, n5, r2) {
  var e4 = -1, i3 = t4.length;
  n5 < 0 && (n5 = -n5 > i3 ? 0 : i3 + n5), (r2 = r2 > i3 ? i3 : r2) < 0 && (r2 += i3), i3 = n5 > r2 ? 0 : r2 - n5 >>> 0, n5 >>>= 0;
  for (var o6 = Array(i3); ++e4 < i3; )
    o6[e4] = t4[e4 + n5];
  return o6;
}
function Br(t4, n5, r2) {
  var e4 = t4.length;
  return r2 = void 0 === r2 ? e4 : r2, !n5 && r2 >= e4 ? t4 : Rr(t4, n5, r2);
}
Mr.placeholder = {};
var zr = RegExp("[\\u200d\\ud800-\\udfff\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff\\ufe0e\\ufe0f]");
function Lr(t4) {
  return zr.test(t4);
}
var Pr = "[\\ud800-\\udfff]";
var Tr = "[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]";
var Dr = "\\ud83c[\\udffb-\\udfff]";
var Cr = "[^\\ud800-\\udfff]";
var Nr = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var Ur = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var Fr = "(?:" + Tr + "|" + Dr + ")?";
var qr = "[\\ufe0e\\ufe0f]?" + Fr + ("(?:\\u200d(?:" + [Cr, Nr, Ur].join("|") + ")[\\ufe0e\\ufe0f]?" + Fr + ")*");
var $r = "(?:" + [Cr + Tr + "?", Tr, Nr, Ur, Pr].join("|") + ")";
var Kr = RegExp(Dr + "(?=" + Dr + ")|" + $r + qr, "g");
function Vr(t4) {
  return Lr(t4) ? function(t5) {
    return t5.match(Kr) || [];
  }(t4) : function(t5) {
    return t5.split("");
  }(t4);
}
function Zr(t4) {
  return function(n5) {
    var r2 = Lr(n5 = ur(n5)) ? Vr(n5) : void 0, e4 = r2 ? r2[0] : n5.charAt(0), i3 = r2 ? Br(r2, 1).join("") : n5.slice(1);
    return e4[t4]() + i3;
  };
}
var Gr = Zr("toUpperCase");
function Jr(t4) {
  return Gr(ur(t4).toLowerCase());
}
function Hr(t4, n5, r2, e4) {
  var i3 = -1, o6 = null == t4 ? 0 : t4.length;
  for (e4 && o6 && (r2 = t4[++i3]); ++i3 < o6; )
    r2 = n5(r2, t4[i3], i3, t4);
  return r2;
}
function Yr(t4) {
  return function(n5) {
    return null == t4 ? void 0 : t4[n5];
  };
}
var Qr = Yr({ "\xC0": "A", "\xC1": "A", "\xC2": "A", "\xC3": "A", "\xC4": "A", "\xC5": "A", "\xE0": "a", "\xE1": "a", "\xE2": "a", "\xE3": "a", "\xE4": "a", "\xE5": "a", "\xC7": "C", "\xE7": "c", "\xD0": "D", "\xF0": "d", "\xC8": "E", "\xC9": "E", "\xCA": "E", "\xCB": "E", "\xE8": "e", "\xE9": "e", "\xEA": "e", "\xEB": "e", "\xCC": "I", "\xCD": "I", "\xCE": "I", "\xCF": "I", "\xEC": "i", "\xED": "i", "\xEE": "i", "\xEF": "i", "\xD1": "N", "\xF1": "n", "\xD2": "O", "\xD3": "O", "\xD4": "O", "\xD5": "O", "\xD6": "O", "\xD8": "O", "\xF2": "o", "\xF3": "o", "\xF4": "o", "\xF5": "o", "\xF6": "o", "\xF8": "o", "\xD9": "U", "\xDA": "U", "\xDB": "U", "\xDC": "U", "\xF9": "u", "\xFA": "u", "\xFB": "u", "\xFC": "u", "\xDD": "Y", "\xFD": "y", "\xFF": "y", "\xC6": "Ae", "\xE6": "ae", "\xDE": "Th", "\xFE": "th", "\xDF": "ss", "\u0100": "A", "\u0102": "A", "\u0104": "A", "\u0101": "a", "\u0103": "a", "\u0105": "a", "\u0106": "C", "\u0108": "C", "\u010A": "C", "\u010C": "C", "\u0107": "c", "\u0109": "c", "\u010B": "c", "\u010D": "c", "\u010E": "D", "\u0110": "D", "\u010F": "d", "\u0111": "d", "\u0112": "E", "\u0114": "E", "\u0116": "E", "\u0118": "E", "\u011A": "E", "\u0113": "e", "\u0115": "e", "\u0117": "e", "\u0119": "e", "\u011B": "e", "\u011C": "G", "\u011E": "G", "\u0120": "G", "\u0122": "G", "\u011D": "g", "\u011F": "g", "\u0121": "g", "\u0123": "g", "\u0124": "H", "\u0126": "H", "\u0125": "h", "\u0127": "h", "\u0128": "I", "\u012A": "I", "\u012C": "I", "\u012E": "I", "\u0130": "I", "\u0129": "i", "\u012B": "i", "\u012D": "i", "\u012F": "i", "\u0131": "i", "\u0134": "J", "\u0135": "j", "\u0136": "K", "\u0137": "k", "\u0138": "k", "\u0139": "L", "\u013B": "L", "\u013D": "L", "\u013F": "L", "\u0141": "L", "\u013A": "l", "\u013C": "l", "\u013E": "l", "\u0140": "l", "\u0142": "l", "\u0143": "N", "\u0145": "N", "\u0147": "N", "\u014A": "N", "\u0144": "n", "\u0146": "n", "\u0148": "n", "\u014B": "n", "\u014C": "O", "\u014E": "O", "\u0150": "O", "\u014D": "o", "\u014F": "o", "\u0151": "o", "\u0154": "R", "\u0156": "R", "\u0158": "R", "\u0155": "r", "\u0157": "r", "\u0159": "r", "\u015A": "S", "\u015C": "S", "\u015E": "S", "\u0160": "S", "\u015B": "s", "\u015D": "s", "\u015F": "s", "\u0161": "s", "\u0162": "T", "\u0164": "T", "\u0166": "T", "\u0163": "t", "\u0165": "t", "\u0167": "t", "\u0168": "U", "\u016A": "U", "\u016C": "U", "\u016E": "U", "\u0170": "U", "\u0172": "U", "\u0169": "u", "\u016B": "u", "\u016D": "u", "\u016F": "u", "\u0171": "u", "\u0173": "u", "\u0174": "W", "\u0175": "w", "\u0176": "Y", "\u0177": "y", "\u0178": "Y", "\u0179": "Z", "\u017B": "Z", "\u017D": "Z", "\u017A": "z", "\u017C": "z", "\u017E": "z", "\u0132": "IJ", "\u0133": "ij", "\u0152": "Oe", "\u0153": "oe", "\u0149": "'n", "\u017F": "s" });
var Xr = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;
var te = RegExp("[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]", "g");
function ne(t4) {
  return (t4 = ur(t4)) && t4.replace(Xr, Qr).replace(te, "");
}
var re = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;
var ee = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;
var ie = "\\xac\\xb1\\xd7\\xf7\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf\\u2000-\\u206f \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000";
var oe = "[" + ie + "]";
var ue = "\\d+";
var ae = "[\\u2700-\\u27bf]";
var fe = "[a-z\\xdf-\\xf6\\xf8-\\xff]";
var ce = "[^\\ud800-\\udfff" + ie + ue + "\\u2700-\\u27bfa-z\\xdf-\\xf6\\xf8-\\xffA-Z\\xc0-\\xd6\\xd8-\\xde]";
var le = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var se = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var pe = "[A-Z\\xc0-\\xd6\\xd8-\\xde]";
var ve = "(?:" + fe + "|" + ce + ")";
var he = "(?:" + pe + "|" + ce + ")";
var de = "(?:[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]|\\ud83c[\\udffb-\\udfff])?";
var ye = "[\\ufe0e\\ufe0f]?" + de + ("(?:\\u200d(?:" + ["[^\\ud800-\\udfff]", le, se].join("|") + ")[\\ufe0e\\ufe0f]?" + de + ")*");
var _e = "(?:" + [ae, le, se].join("|") + ")" + ye;
var ge = RegExp([pe + "?" + fe + "+(?:['\u2019](?:d|ll|m|re|s|t|ve))?(?=" + [oe, pe, "$"].join("|") + ")", he + "+(?:['\u2019](?:D|LL|M|RE|S|T|VE))?(?=" + [oe, pe + ve, "$"].join("|") + ")", pe + "?" + ve + "+(?:['\u2019](?:d|ll|m|re|s|t|ve))?", pe + "+(?:['\u2019](?:D|LL|M|RE|S|T|VE))?", "\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])", "\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])", ue, _e].join("|"), "g");
function be(t4, n5, r2) {
  return t4 = ur(t4), void 0 === (n5 = r2 ? void 0 : n5) ? function(t5) {
    return ee.test(t5);
  }(t4) ? function(t5) {
    return t5.match(ge) || [];
  }(t4) : function(t5) {
    return t5.match(re) || [];
  }(t4) : t4.match(n5) || [];
}
var me = RegExp("['\u2019]", "g");
function je(t4) {
  return function(n5) {
    return Hr(be(ne(n5).replace(me, "")), t4, "");
  };
}
var we = je(function(t4, n5, r2) {
  return n5 = n5.toLowerCase(), t4 + (r2 ? Jr(n5) : n5);
});
function xe() {
  if (!arguments.length)
    return [];
  var t4 = arguments[0];
  return d(t4) ? t4 : [t4];
}
var Oe = r.isFinite;
var Ae = Math.min;
function Ie(t4) {
  var n5 = Math[t4];
  return function(t5, r2) {
    if (t5 = W(t5), (r2 = null == r2 ? 0 : Ae(R(r2), 292)) && Oe(t5)) {
      var e4 = (ur(t5) + "e").split("e");
      return +((e4 = (ur(n5(e4[0] + "e" + (+e4[1] + r2))) + "e").split("e"))[0] + "e" + (+e4[1] - r2));
    }
    return n5(t5);
  };
}
var Ee = Ie("ceil");
function ke(t4) {
  var n5 = gt(t4);
  return n5.__chain__ = true, n5;
}
var Se = Math.ceil;
var We = Math.max;
function Me(t4, n5, r2) {
  n5 = (r2 ? on(t4, n5, r2) : void 0 === n5) ? 1 : We(R(n5), 0);
  var e4 = null == t4 ? 0 : t4.length;
  if (!e4 || n5 < 1)
    return [];
  for (var i3 = 0, o6 = 0, u7 = Array(Se(e4 / n5)); i3 < e4; )
    u7[o6++] = Rr(t4, i3, i3 += n5);
  return u7;
}
function Re(t4, n5, r2) {
  return t4 == t4 && (void 0 !== r2 && (t4 = t4 <= r2 ? t4 : r2), void 0 !== n5 && (t4 = t4 >= n5 ? t4 : n5)), t4;
}
function Be(t4, n5, r2) {
  return void 0 === r2 && (r2 = n5, n5 = void 0), void 0 !== r2 && (r2 = (r2 = W(r2)) == r2 ? r2 : 0), void 0 !== n5 && (n5 = (n5 = W(n5)) == n5 ? n5 : 0), Re(W(t4), n5, r2);
}
function ze(t4) {
  var n5 = this.__data__ = new Qn(t4);
  this.size = n5.size;
}
function Le(t4, n5) {
  return t4 && Qt(n5, zn(n5), t4);
}
ze.prototype.clear = function() {
  this.__data__ = new Qn(), this.size = 0;
}, ze.prototype.delete = function(t4) {
  var n5 = this.__data__, r2 = n5.delete(t4);
  return this.size = n5.size, r2;
}, ze.prototype.get = function(t4) {
  return this.__data__.get(t4);
}, ze.prototype.has = function(t4) {
  return this.__data__.has(t4);
}, ze.prototype.set = function(t4, n5) {
  var r2 = this.__data__;
  if (r2 instanceof Qn) {
    var e4 = r2.__data__;
    if (!Xn || e4.length < 199)
      return e4.push([t4, n5]), this.size = ++r2.size, this;
    r2 = this.__data__ = new nr(e4);
  }
  return r2.set(t4, n5), this.size = r2.size, this;
};
var Pe = "object" == typeof exports && exports && !exports.nodeType && exports;
var Te = Pe && "object" == typeof module && module && !module.nodeType && module;
var De = Te && Te.exports === Pe ? r.Buffer : void 0;
var Ce = De ? De.allocUnsafe : void 0;
function Ne(t4, n5) {
  if (n5)
    return t4.slice();
  var r2 = t4.length, e4 = Ce ? Ce(r2) : new t4.constructor(r2);
  return t4.copy(e4), e4;
}
function Ue(t4, n5) {
  for (var r2 = -1, e4 = null == t4 ? 0 : t4.length, i3 = 0, o6 = []; ++r2 < e4; ) {
    var u7 = t4[r2];
    n5(u7, r2, t4) && (o6[i3++] = u7);
  }
  return o6;
}
function Fe() {
  return [];
}
var qe = Object.prototype.propertyIsEnumerable;
var $e = Object.getOwnPropertySymbols;
var Ke = $e ? function(t4) {
  return null == t4 ? [] : (t4 = Object(t4), Ue($e(t4), function(n5) {
    return qe.call(t4, n5);
  }));
} : Fe;
var Ve = Object.getOwnPropertySymbols ? function(t4) {
  for (var n5 = []; t4; )
    pr(n5, Ke(t4)), t4 = br(t4);
  return n5;
} : Fe;
function Ze(t4, n5, r2) {
  var e4 = n5(t4);
  return d(t4) ? e4 : pr(e4, r2(t4));
}
function Ge(t4) {
  return Ze(t4, zn, Ke);
}
function Je(t4) {
  return Ze(t4, Cn, Ve);
}
var He = G(r, "DataView");
var Ye = G(r, "Promise");
var Qe = G(r, "Set");
var Xe = N(He);
var ti = N(Xn);
var ni = N(Ye);
var ri = N(Qe);
var ei = N(J);
var ii = l;
(He && "[object DataView]" != ii(new He(new ArrayBuffer(1))) || Xn && "[object Map]" != ii(new Xn()) || Ye && "[object Promise]" != ii(Ye.resolve()) || Qe && "[object Set]" != ii(new Qe()) || J && "[object WeakMap]" != ii(new J())) && (ii = function(t4) {
  var n5 = l(t4), r2 = "[object Object]" == n5 ? t4.constructor : void 0, e4 = r2 ? N(r2) : "";
  if (e4)
    switch (e4) {
      case Xe:
        return "[object DataView]";
      case ti:
        return "[object Map]";
      case ni:
        return "[object Promise]";
      case ri:
        return "[object Set]";
      case ei:
        return "[object WeakMap]";
    }
  return n5;
});
var oi = ii;
var ui = Object.prototype.hasOwnProperty;
var ai = r.Uint8Array;
function fi(t4) {
  var n5 = new t4.constructor(t4.byteLength);
  return new ai(n5).set(new ai(t4)), n5;
}
var ci = /\w*$/;
var li = e ? e.prototype : void 0;
var si = li ? li.valueOf : void 0;
function pi(t4, n5) {
  var r2 = n5 ? fi(t4.buffer) : t4.buffer;
  return new t4.constructor(r2, t4.byteOffset, t4.length);
}
function vi(t4, n5, r2) {
  var e4, i3 = t4.constructor;
  switch (n5) {
    case "[object ArrayBuffer]":
      return fi(t4);
    case "[object Boolean]":
    case "[object Date]":
      return new i3(+t4);
    case "[object DataView]":
      return function(t5, n6) {
        var r3 = n6 ? fi(t5.buffer) : t5.buffer;
        return new t5.constructor(r3, t5.byteOffset, t5.byteLength);
      }(t4, r2);
    case "[object Float32Array]":
    case "[object Float64Array]":
    case "[object Int8Array]":
    case "[object Int16Array]":
    case "[object Int32Array]":
    case "[object Uint8Array]":
    case "[object Uint8ClampedArray]":
    case "[object Uint16Array]":
    case "[object Uint32Array]":
      return pi(t4, r2);
    case "[object Map]":
      return new i3();
    case "[object Number]":
    case "[object String]":
      return new i3(t4);
    case "[object RegExp]":
      return function(t5) {
        var n6 = new t5.constructor(t5.source, ci.exec(t5));
        return n6.lastIndex = t5.lastIndex, n6;
      }(t4);
    case "[object Set]":
      return new i3();
    case "[object Symbol]":
      return e4 = t4, si ? Object(si.call(e4)) : {};
  }
}
function hi(t4) {
  return "function" != typeof t4.constructor || fn(t4) ? {} : X(br(t4));
}
var di = An && An.isMap;
var yi = di ? jn(di) : function(t4) {
  return s(t4) && "[object Map]" == oi(t4);
};
var _i = An && An.isSet;
var gi = _i ? jn(_i) : function(t4) {
  return s(t4) && "[object Set]" == oi(t4);
};
var bi = {};
function mi(t4, n5, r2, e4, i3, o6) {
  var u7, a5 = 1 & n5, f3 = 2 & n5, c5 = 4 & n5;
  if (r2 && (u7 = i3 ? r2(t4, e4, i3, o6) : r2(t4)), void 0 !== u7)
    return u7;
  if (!A(t4))
    return t4;
  var l4 = d(t4);
  if (l4) {
    if (u7 = function(t5) {
      var n6 = t5.length, r3 = new t5.constructor(n6);
      return n6 && "string" == typeof t5[0] && ui.call(t5, "index") && (r3.index = t5.index, r3.input = t5.input), r3;
    }(t4), !a5)
      return dt(t4, u7);
  } else {
    var s2 = oi(t4), p5 = "[object Function]" == s2 || "[object GeneratorFunction]" == s2;
    if (bn(t4))
      return Ne(t4, a5);
    if ("[object Object]" == s2 || "[object Arguments]" == s2 || p5 && !i3) {
      if (u7 = f3 || p5 ? {} : hi(t4), !a5)
        return f3 ? function(t5, n6) {
          return Qt(t5, Ve(t5), n6);
        }(t4, function(t5, n6) {
          return t5 && Qt(n6, Cn(n6), t5);
        }(u7, t4)) : function(t5, n6) {
          return Qt(t5, Ke(t5), n6);
        }(t4, Le(u7, t4));
    } else {
      if (!bi[s2])
        return i3 ? t4 : {};
      u7 = vi(t4, s2, a5);
    }
  }
  o6 || (o6 = new ze());
  var v2 = o6.get(t4);
  if (v2)
    return v2;
  o6.set(t4, u7), gi(t4) ? t4.forEach(function(e5) {
    u7.add(mi(e5, n5, r2, e5, t4, o6));
  }) : yi(t4) && t4.forEach(function(e5, i4) {
    u7.set(i4, mi(e5, n5, r2, i4, t4, o6));
  });
  var h3 = l4 ? void 0 : (c5 ? f3 ? Je : Ge : f3 ? Cn : zn)(t4);
  return St(h3 || t4, function(e5, i4) {
    h3 && (e5 = t4[i4 = e5]), Yt(u7, i4, mi(e5, n5, r2, i4, t4, o6));
  }), u7;
}
bi["[object Arguments]"] = bi["[object Array]"] = bi["[object ArrayBuffer]"] = bi["[object DataView]"] = bi["[object Boolean]"] = bi["[object Date]"] = bi["[object Float32Array]"] = bi["[object Float64Array]"] = bi["[object Int8Array]"] = bi["[object Int16Array]"] = bi["[object Int32Array]"] = bi["[object Map]"] = bi["[object Number]"] = bi["[object Object]"] = bi["[object RegExp]"] = bi["[object Set]"] = bi["[object String]"] = bi["[object Symbol]"] = bi["[object Uint8Array]"] = bi["[object Uint8ClampedArray]"] = bi["[object Uint16Array]"] = bi["[object Uint32Array]"] = true, bi["[object Error]"] = bi["[object Function]"] = bi["[object WeakMap]"] = false;
function ji(t4) {
  return mi(t4, 4);
}
function wi(t4) {
  return mi(t4, 5);
}
function xi(t4, n5) {
  return mi(t4, 5, n5 = "function" == typeof n5 ? n5 : void 0);
}
function Oi(t4, n5) {
  return mi(t4, 4, n5 = "function" == typeof n5 ? n5 : void 0);
}
function Ai() {
  return new ht(this.value(), this.__chain__);
}
function Ii(t4) {
  for (var n5 = -1, r2 = null == t4 ? 0 : t4.length, e4 = 0, i3 = []; ++n5 < r2; ) {
    var o6 = t4[n5];
    o6 && (i3[e4++] = o6);
  }
  return i3;
}
function Ei() {
  var t4 = arguments.length;
  if (!t4)
    return [];
  for (var n5 = Array(t4 - 1), r2 = arguments[0], e4 = t4; e4--; )
    n5[e4 - 1] = arguments[e4];
  return pr(d(r2) ? dt(r2) : [r2], dr(n5, 1));
}
function ki(t4) {
  var n5 = -1, r2 = null == t4 ? 0 : t4.length;
  for (this.__data__ = new nr(); ++n5 < r2; )
    this.add(t4[n5]);
}
function Si(t4, n5) {
  for (var r2 = -1, e4 = null == t4 ? 0 : t4.length; ++r2 < e4; )
    if (n5(t4[r2], r2, t4))
      return true;
  return false;
}
function Wi(t4, n5) {
  return t4.has(n5);
}
ki.prototype.add = ki.prototype.push = function(t4) {
  return this.__data__.set(t4, "__lodash_hash_undefined__"), this;
}, ki.prototype.has = function(t4) {
  return this.__data__.has(t4);
};
function Mi(t4, n5, r2, e4, i3, o6) {
  var u7 = 1 & r2, a5 = t4.length, f3 = n5.length;
  if (a5 != f3 && !(u7 && f3 > a5))
    return false;
  var c5 = o6.get(t4), l4 = o6.get(n5);
  if (c5 && l4)
    return c5 == n5 && l4 == t4;
  var s2 = -1, p5 = true, v2 = 2 & r2 ? new ki() : void 0;
  for (o6.set(t4, n5), o6.set(n5, t4); ++s2 < a5; ) {
    var h3 = t4[s2], d3 = n5[s2];
    if (e4)
      var y2 = u7 ? e4(d3, h3, s2, n5, t4, o6) : e4(h3, d3, s2, t4, n5, o6);
    if (void 0 !== y2) {
      if (y2)
        continue;
      p5 = false;
      break;
    }
    if (v2) {
      if (!Si(n5, function(t5, n6) {
        if (!Wi(v2, n6) && (h3 === t5 || i3(h3, t5, r2, e4, o6)))
          return v2.push(n6);
      })) {
        p5 = false;
        break;
      }
    } else if (h3 !== d3 && !i3(h3, d3, r2, e4, o6)) {
      p5 = false;
      break;
    }
  }
  return o6.delete(t4), o6.delete(n5), p5;
}
function Ri(t4) {
  var n5 = -1, r2 = Array(t4.size);
  return t4.forEach(function(t5, e4) {
    r2[++n5] = [e4, t5];
  }), r2;
}
function Bi(t4) {
  var n5 = -1, r2 = Array(t4.size);
  return t4.forEach(function(t5) {
    r2[++n5] = t5;
  }), r2;
}
var zi = e ? e.prototype : void 0;
var Li = zi ? zi.valueOf : void 0;
var Pi = Object.prototype.hasOwnProperty;
var Ti = "[object Object]";
var Di = Object.prototype.hasOwnProperty;
function Ci(t4, n5, r2, e4, i3, o6) {
  var u7 = d(t4), a5 = d(n5), f3 = u7 ? "[object Array]" : oi(t4), c5 = a5 ? "[object Array]" : oi(n5), l4 = (f3 = "[object Arguments]" == f3 ? Ti : f3) == Ti, s2 = (c5 = "[object Arguments]" == c5 ? Ti : c5) == Ti, p5 = f3 == c5;
  if (p5 && bn(t4)) {
    if (!bn(n5))
      return false;
    u7 = true, l4 = false;
  }
  if (p5 && !l4)
    return o6 || (o6 = new ze()), u7 || En(t4) ? Mi(t4, n5, r2, e4, i3, o6) : function(t5, n6, r3, e5, i4, o7, u8) {
      switch (r3) {
        case "[object DataView]":
          if (t5.byteLength != n6.byteLength || t5.byteOffset != n6.byteOffset)
            return false;
          t5 = t5.buffer, n6 = n6.buffer;
        case "[object ArrayBuffer]":
          return !(t5.byteLength != n6.byteLength || !o7(new ai(t5), new ai(n6)));
        case "[object Boolean]":
        case "[object Date]":
        case "[object Number]":
          return Jt(+t5, +n6);
        case "[object Error]":
          return t5.name == n6.name && t5.message == n6.message;
        case "[object RegExp]":
        case "[object String]":
          return t5 == n6 + "";
        case "[object Map]":
          var a6 = Ri;
        case "[object Set]":
          var f4 = 1 & e5;
          if (a6 || (a6 = Bi), t5.size != n6.size && !f4)
            return false;
          var c6 = u8.get(t5);
          if (c6)
            return c6 == n6;
          e5 |= 2, u8.set(t5, n6);
          var l5 = Mi(a6(t5), a6(n6), e5, i4, o7, u8);
          return u8.delete(t5), l5;
        case "[object Symbol]":
          if (Li)
            return Li.call(t5) == Li.call(n6);
      }
      return false;
    }(t4, n5, f3, r2, e4, i3, o6);
  if (!(1 & r2)) {
    var v2 = l4 && Di.call(t4, "__wrapped__"), h3 = s2 && Di.call(n5, "__wrapped__");
    if (v2 || h3) {
      var y2 = v2 ? t4.value() : t4, _2 = h3 ? n5.value() : n5;
      return o6 || (o6 = new ze()), i3(y2, _2, r2, e4, o6);
    }
  }
  return !!p5 && (o6 || (o6 = new ze()), function(t5, n6, r3, e5, i4, o7) {
    var u8 = 1 & r3, a6 = Ge(t5), f4 = a6.length;
    if (f4 != Ge(n6).length && !u8)
      return false;
    for (var c6 = f4; c6--; ) {
      var l5 = a6[c6];
      if (!(u8 ? l5 in n6 : Pi.call(n6, l5)))
        return false;
    }
    var s3 = o7.get(t5), p6 = o7.get(n6);
    if (s3 && p6)
      return s3 == n6 && p6 == t5;
    var v3 = true;
    o7.set(t5, n6), o7.set(n6, t5);
    for (var h4 = u8; ++c6 < f4; ) {
      var d3 = t5[l5 = a6[c6]], y3 = n6[l5];
      if (e5)
        var _3 = u8 ? e5(y3, d3, l5, n6, t5, o7) : e5(d3, y3, l5, t5, n6, o7);
      if (!(void 0 === _3 ? d3 === y3 || i4(d3, y3, r3, e5, o7) : _3)) {
        v3 = false;
        break;
      }
      h4 || (h4 = "constructor" == l5);
    }
    if (v3 && !h4) {
      var g2 = t5.constructor, b3 = n6.constructor;
      g2 == b3 || !("constructor" in t5) || !("constructor" in n6) || "function" == typeof g2 && g2 instanceof g2 && "function" == typeof b3 && b3 instanceof b3 || (v3 = false);
    }
    return o7.delete(t5), o7.delete(n6), v3;
  }(t4, n5, r2, e4, i3, o6));
}
function Ni(t4, n5, r2, e4, i3) {
  return t4 === n5 || (null == t4 || null == n5 || !s(t4) && !s(n5) ? t4 != t4 && n5 != n5 : Ci(t4, n5, r2, e4, Ni, i3));
}
function Ui(t4, n5, r2, e4) {
  var i3 = r2.length, o6 = i3, u7 = !e4;
  if (null == t4)
    return !o6;
  for (t4 = Object(t4); i3--; ) {
    var a5 = r2[i3];
    if (u7 && a5[2] ? a5[1] !== t4[a5[0]] : !(a5[0] in t4))
      return false;
  }
  for (; ++i3 < o6; ) {
    var f3 = (a5 = r2[i3])[0], c5 = t4[f3], l4 = a5[1];
    if (u7 && a5[2]) {
      if (void 0 === c5 && !(f3 in t4))
        return false;
    } else {
      var s2 = new ze();
      if (e4)
        var p5 = e4(c5, l4, f3, t4, n5, s2);
      if (!(void 0 === p5 ? Ni(l4, c5, 3, e4, s2) : p5))
        return false;
    }
  }
  return true;
}
function Fi(t4) {
  return t4 == t4 && !A(t4);
}
function qi(t4) {
  for (var n5 = zn(t4), r2 = n5.length; r2--; ) {
    var e4 = n5[r2], i3 = t4[e4];
    n5[r2] = [e4, i3, Fi(i3)];
  }
  return n5;
}
function $i(t4, n5) {
  return function(r2) {
    return null != r2 && (r2[t4] === n5 && (void 0 !== n5 || t4 in Object(r2)));
  };
}
function Ki(t4) {
  var n5 = qi(t4);
  return 1 == n5.length && n5[0][2] ? $i(n5[0][0], n5[0][1]) : function(r2) {
    return r2 === t4 || Ui(r2, t4, n5);
  };
}
function Vi(t4, n5) {
  return null != t4 && n5 in Object(t4);
}
function Zi(t4, n5, r2) {
  for (var e4 = -1, i3 = (n5 = ar(n5, t4)).length, o6 = false; ++e4 < i3; ) {
    var u7 = fr(n5[e4]);
    if (!(o6 = null != t4 && r2(t4, u7)))
      break;
    t4 = t4[u7];
  }
  return o6 || ++e4 != i3 ? o6 : !!(i3 = null == t4 ? 0 : t4.length) && rn(i3) && Ct(u7, i3) && (d(t4) || hn(t4));
}
function Gi(t4, n5) {
  return null != t4 && Zi(t4, n5, Vi);
}
function Ji(t4, n5) {
  return Kn(t4) && Fi(n5) ? $i(fr(t4), n5) : function(r2) {
    var e4 = lr(r2, t4);
    return void 0 === e4 && e4 === n5 ? Gi(r2, t4) : Ni(n5, e4, 3);
  };
}
function Hi(t4) {
  return function(n5) {
    return null == n5 ? void 0 : n5[t4];
  };
}
function Yi(t4) {
  return Kn(t4) ? Hi(fr(t4)) : function(t5) {
    return function(n5) {
      return cr(n5, t5);
    };
  }(t4);
}
function Qi(t4) {
  return "function" == typeof t4 ? t4 : null == t4 ? z : "object" == typeof t4 ? d(t4) ? Ji(t4[0], t4[1]) : Ki(t4) : Yi(t4);
}
function Xi(t4) {
  var n5 = null == t4 ? 0 : t4.length, r2 = Qi;
  return t4 = n5 ? h(t4, function(t5) {
    if ("function" != typeof t5[1])
      throw new TypeError("Expected a function");
    return [r2(t5[0]), t5[1]];
  }) : [], nn(function(r3) {
    for (var e4 = -1; ++e4 < n5; ) {
      var i3 = t4[e4];
      if (nt(i3[0], this, r3))
        return nt(i3[1], this, r3);
    }
  });
}
function to(t4, n5, r2) {
  var e4 = r2.length;
  if (null == t4)
    return !e4;
  for (t4 = Object(t4); e4--; ) {
    var i3 = r2[e4], o6 = n5[i3], u7 = t4[i3];
    if (void 0 === u7 && !(i3 in t4) || !o6(u7))
      return false;
  }
  return true;
}
function no(t4) {
  return function(t5) {
    var n5 = zn(t5);
    return function(r2) {
      return to(r2, t5, n5);
    };
  }(mi(t4, 1));
}
function ro(t4, n5) {
  return null == n5 || to(t4, n5, zn(n5));
}
function eo(t4, n5, r2, e4) {
  for (var i3 = -1, o6 = null == t4 ? 0 : t4.length; ++i3 < o6; ) {
    var u7 = t4[i3];
    n5(e4, u7, r2(u7), t4);
  }
  return e4;
}
function io(t4) {
  return function(n5, r2, e4) {
    for (var i3 = -1, o6 = Object(n5), u7 = e4(n5), a5 = u7.length; a5--; ) {
      var f3 = u7[t4 ? a5 : ++i3];
      if (false === r2(o6[f3], f3, o6))
        break;
    }
    return n5;
  };
}
var oo = io();
function uo(t4, n5) {
  return t4 && oo(t4, n5, zn);
}
function ao(t4, n5) {
  return function(r2, e4) {
    if (null == r2)
      return r2;
    if (!en(r2))
      return t4(r2, e4);
    for (var i3 = r2.length, o6 = n5 ? i3 : -1, u7 = Object(r2); (n5 ? o6-- : ++o6 < i3) && false !== e4(u7[o6], o6, u7); )
      ;
    return r2;
  };
}
var fo = ao(uo);
function co(t4, n5, r2, e4) {
  return fo(t4, function(t5, i3, o6) {
    n5(e4, t5, r2(t5), o6);
  }), e4;
}
function lo(t4, n5) {
  return function(r2, e4) {
    var i3 = d(r2) ? eo : co, o6 = n5 ? n5() : {};
    return i3(r2, t4, Qi(e4), o6);
  };
}
var so = Object.prototype.hasOwnProperty;
var po = lo(function(t4, n5, r2) {
  so.call(t4, r2) ? ++t4[r2] : Gt(t4, r2, 1);
});
function vo(t4, n5) {
  var r2 = X(t4);
  return null == n5 ? r2 : Le(r2, n5);
}
function ho(t4, n5, r2) {
  var e4 = Vt(t4, 8, void 0, void 0, void 0, void 0, void 0, n5 = r2 ? void 0 : n5);
  return e4.placeholder = ho.placeholder, e4;
}
ho.placeholder = {};
function yo(t4, n5, r2) {
  var e4 = Vt(t4, 16, void 0, void 0, void 0, void 0, void 0, n5 = r2 ? void 0 : n5);
  return e4.placeholder = yo.placeholder, e4;
}
yo.placeholder = {};
var _o = function() {
  return r.Date.now();
};
var go = Math.max;
var bo = Math.min;
function mo(t4, n5, r2) {
  var e4, i3, o6, u7, a5, f3, c5 = 0, l4 = false, s2 = false, p5 = true;
  if ("function" != typeof t4)
    throw new TypeError("Expected a function");
  function v2(n6) {
    var r3 = e4, o7 = i3;
    return e4 = i3 = void 0, c5 = n6, u7 = t4.apply(o7, r3);
  }
  function h3(t5) {
    return c5 = t5, a5 = setTimeout(y2, n5), l4 ? v2(t5) : u7;
  }
  function d3(t5) {
    var r3 = t5 - f3;
    return void 0 === f3 || r3 >= n5 || r3 < 0 || s2 && t5 - c5 >= o6;
  }
  function y2() {
    var t5 = _o();
    if (d3(t5))
      return _2(t5);
    a5 = setTimeout(y2, function(t6) {
      var r3 = n5 - (t6 - f3);
      return s2 ? bo(r3, o6 - (t6 - c5)) : r3;
    }(t5));
  }
  function _2(t5) {
    return a5 = void 0, p5 && e4 ? v2(t5) : (e4 = i3 = void 0, u7);
  }
  function g2() {
    var t5 = _o(), r3 = d3(t5);
    if (e4 = arguments, i3 = this, f3 = t5, r3) {
      if (void 0 === a5)
        return h3(f3);
      if (s2)
        return clearTimeout(a5), a5 = setTimeout(y2, n5), v2(f3);
    }
    return void 0 === a5 && (a5 = setTimeout(y2, n5)), u7;
  }
  return n5 = W(n5) || 0, A(r2) && (l4 = !!r2.leading, o6 = (s2 = "maxWait" in r2) ? go(W(r2.maxWait) || 0, n5) : o6, p5 = "trailing" in r2 ? !!r2.trailing : p5), g2.cancel = function() {
    void 0 !== a5 && clearTimeout(a5), c5 = 0, e4 = f3 = i3 = a5 = void 0;
  }, g2.flush = function() {
    return void 0 === a5 ? u7 : _2(_o());
  }, g2;
}
function jo(t4, n5) {
  return null == t4 || t4 != t4 ? n5 : t4;
}
var wo = Object.prototype;
var xo = wo.hasOwnProperty;
var Oo = nn(function(t4, n5) {
  t4 = Object(t4);
  var r2 = -1, e4 = n5.length, i3 = e4 > 2 ? n5[2] : void 0;
  for (i3 && on(n5[0], n5[1], i3) && (e4 = 1); ++r2 < e4; )
    for (var o6 = n5[r2], u7 = Cn(o6), a5 = -1, f3 = u7.length; ++a5 < f3; ) {
      var c5 = u7[a5], l4 = t4[c5];
      (void 0 === l4 || Jt(l4, wo[c5]) && !xo.call(t4, c5)) && (t4[c5] = o6[c5]);
    }
  return t4;
});
function Ao(t4, n5, r2) {
  (void 0 !== r2 && !Jt(t4[n5], r2) || void 0 === r2 && !(n5 in t4)) && Gt(t4, n5, r2);
}
function Io(t4) {
  return s(t4) && en(t4);
}
function Eo(t4, n5) {
  if (("constructor" !== n5 || "function" != typeof t4[n5]) && "__proto__" != n5)
    return t4[n5];
}
function ko(t4) {
  return Qt(t4, Cn(t4));
}
function So(t4, n5, r2, e4, i3) {
  t4 !== n5 && oo(n5, function(o6, u7) {
    if (i3 || (i3 = new ze()), A(o6))
      !function(t5, n6, r3, e5, i4, o7, u8) {
        var a6 = Eo(t5, r3), f3 = Eo(n6, r3), c5 = u8.get(f3);
        if (c5)
          Ao(t5, r3, c5);
        else {
          var l4 = o7 ? o7(a6, f3, r3 + "", t5, n6, u8) : void 0, s2 = void 0 === l4;
          if (s2) {
            var p5 = d(f3), v2 = !p5 && bn(f3), h3 = !p5 && !v2 && En(f3);
            l4 = f3, p5 || v2 || h3 ? d(a6) ? l4 = a6 : Io(a6) ? l4 = dt(a6) : v2 ? (s2 = false, l4 = Ne(f3, true)) : h3 ? (s2 = false, l4 = pi(f3, true)) : l4 = [] : Ar(f3) || hn(f3) ? (l4 = a6, hn(a6) ? l4 = ko(a6) : A(a6) && !L(a6) || (l4 = hi(f3))) : s2 = false;
          }
          s2 && (u8.set(f3, l4), i4(l4, f3, e5, o7, u8), u8.delete(f3)), Ao(t5, r3, l4);
        }
      }(t4, n5, u7, r2, So, e4, i3);
    else {
      var a5 = e4 ? e4(Eo(t4, u7), o6, u7 + "", t4, n5, i3) : void 0;
      void 0 === a5 && (a5 = o6), Ao(t4, u7, a5);
    }
  }, Cn);
}
function Wo(t4, n5, r2, e4, i3, o6) {
  return A(t4) && A(n5) && (o6.set(n5, t4), So(t4, n5, void 0, Wo, o6), o6.delete(n5)), t4;
}
var Mo = un(function(t4, n5, r2, e4) {
  So(t4, n5, r2, e4);
});
var Ro = nn(function(t4) {
  return t4.push(void 0, Wo), nt(Mo, void 0, t4);
});
function Bo(t4, n5, r2) {
  if ("function" != typeof t4)
    throw new TypeError("Expected a function");
  return setTimeout(function() {
    t4.apply(void 0, r2);
  }, n5);
}
var zo = nn(function(t4, n5) {
  return Bo(t4, 1, n5);
});
var Lo = nn(function(t4, n5, r2) {
  return Bo(t4, W(n5) || 0, r2);
});
function Po(t4, n5, r2) {
  for (var e4 = -1, i3 = null == t4 ? 0 : t4.length; ++e4 < i3; )
    if (r2(n5, t4[e4]))
      return true;
  return false;
}
function To(t4, n5, r2, e4) {
  var i3 = -1, o6 = Bt, u7 = true, a5 = t4.length, f3 = [], c5 = n5.length;
  if (!a5)
    return f3;
  r2 && (n5 = h(n5, jn(r2))), e4 ? (o6 = Po, u7 = false) : n5.length >= 200 && (o6 = Wi, u7 = false, n5 = new ki(n5));
  t:
    for (; ++i3 < a5; ) {
      var l4 = t4[i3], s2 = null == r2 ? l4 : r2(l4);
      if (l4 = e4 || 0 !== l4 ? l4 : 0, u7 && s2 == s2) {
        for (var p5 = c5; p5--; )
          if (n5[p5] === s2)
            continue t;
        f3.push(l4);
      } else
        o6(n5, s2, e4) || f3.push(l4);
    }
  return f3;
}
var Do = nn(function(t4, n5) {
  return Io(t4) ? To(t4, dr(n5, 1, Io, true)) : [];
});
function Co(t4) {
  var n5 = null == t4 ? 0 : t4.length;
  return n5 ? t4[n5 - 1] : void 0;
}
var No = nn(function(t4, n5) {
  var r2 = Co(n5);
  return Io(r2) && (r2 = void 0), Io(t4) ? To(t4, dr(n5, 1, Io, true), Qi(r2)) : [];
});
var Uo = nn(function(t4, n5) {
  var r2 = Co(n5);
  return Io(r2) && (r2 = void 0), Io(t4) ? To(t4, dr(n5, 1, Io, true), void 0, r2) : [];
});
var Fo = b(function(t4, n5) {
  return t4 / n5;
}, 1);
function qo(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  return e4 ? Rr(t4, (n5 = r2 || void 0 === n5 ? 1 : R(n5)) < 0 ? 0 : n5, e4) : [];
}
function $o(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  return e4 ? Rr(t4, 0, (n5 = e4 - (n5 = r2 || void 0 === n5 ? 1 : R(n5))) < 0 ? 0 : n5) : [];
}
function Ko(t4, n5, r2, e4) {
  for (var i3 = t4.length, o6 = e4 ? i3 : -1; (e4 ? o6-- : ++o6 < i3) && n5(t4[o6], o6, t4); )
    ;
  return r2 ? Rr(t4, e4 ? 0 : o6, e4 ? o6 + 1 : i3) : Rr(t4, e4 ? o6 + 1 : 0, e4 ? i3 : o6);
}
function Vo(t4, n5) {
  return t4 && t4.length ? Ko(t4, Qi(n5), true, true) : [];
}
function Zo(t4, n5) {
  return t4 && t4.length ? Ko(t4, Qi(n5), true) : [];
}
function Go(t4) {
  return "function" == typeof t4 ? t4 : z;
}
function Jo(t4, n5) {
  return (d(t4) ? St : fo)(t4, Go(n5));
}
function Ho(t4, n5) {
  for (var r2 = null == t4 ? 0 : t4.length; r2-- && false !== n5(t4[r2], r2, t4); )
    ;
  return t4;
}
var Yo = io(true);
function Qo(t4, n5) {
  return t4 && Yo(t4, n5, zn);
}
var Xo = ao(Qo, true);
function tu(t4, n5) {
  return (d(t4) ? Ho : Xo)(t4, Go(n5));
}
function nu(t4, n5, r2) {
  t4 = ur(t4), n5 = g(n5);
  var e4 = t4.length, i3 = r2 = void 0 === r2 ? e4 : Re(R(r2), 0, e4);
  return (r2 -= n5.length) >= 0 && t4.slice(r2, i3) == n5;
}
function ru(t4) {
  return function(n5) {
    var r2 = oi(n5);
    return "[object Map]" == r2 ? Ri(n5) : "[object Set]" == r2 ? function(t5) {
      var n6 = -1, r3 = Array(t5.size);
      return t5.forEach(function(t6) {
        r3[++n6] = [t6, t6];
      }), r3;
    }(n5) : function(t5, n6) {
      return h(n6, function(n7) {
        return [n7, t5[n7]];
      });
    }(n5, t4(n5));
  };
}
var eu = ru(zn);
var iu = ru(Cn);
var ou = Yr({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" });
var uu = /[&<>"']/g;
var au = RegExp(uu.source);
function fu(t4) {
  return (t4 = ur(t4)) && au.test(t4) ? t4.replace(uu, ou) : t4;
}
var cu = /[\\^$.*+?()[\]{}|]/g;
var lu = RegExp(cu.source);
function su(t4) {
  return (t4 = ur(t4)) && lu.test(t4) ? t4.replace(cu, "\\$&") : t4;
}
function pu(t4, n5) {
  for (var r2 = -1, e4 = null == t4 ? 0 : t4.length; ++r2 < e4; )
    if (!n5(t4[r2], r2, t4))
      return false;
  return true;
}
function vu(t4, n5) {
  var r2 = true;
  return fo(t4, function(t5, e4, i3) {
    return r2 = !!n5(t5, e4, i3);
  }), r2;
}
function hu(t4, n5, r2) {
  var e4 = d(t4) ? pu : vu;
  return r2 && on(t4, n5, r2) && (n5 = void 0), e4(t4, Qi(n5));
}
function du(t4) {
  return t4 ? Re(R(t4), 0, 4294967295) : 0;
}
function yu(t4, n5, r2, e4) {
  var i3 = null == t4 ? 0 : t4.length;
  return i3 ? (r2 && "number" != typeof r2 && on(t4, n5, r2) && (r2 = 0, e4 = i3), function(t5, n6, r3, e5) {
    var i4 = t5.length;
    for ((r3 = R(r3)) < 0 && (r3 = -r3 > i4 ? 0 : i4 + r3), (e5 = void 0 === e5 || e5 > i4 ? i4 : R(e5)) < 0 && (e5 += i4), e5 = r3 > e5 ? 0 : du(e5); r3 < e5; )
      t5[r3++] = n6;
    return t5;
  }(t4, n5, r2, e4)) : [];
}
function _u(t4, n5) {
  var r2 = [];
  return fo(t4, function(t5, e4, i3) {
    n5(t5, e4, i3) && r2.push(t5);
  }), r2;
}
function gu(t4, n5) {
  return (d(t4) ? Ue : _u)(t4, Qi(n5));
}
function bu(t4) {
  return function(n5, r2, e4) {
    var i3 = Object(n5);
    if (!en(n5)) {
      var o6 = Qi(r2);
      n5 = zn(n5), r2 = function(t5) {
        return o6(i3[t5], t5, i3);
      };
    }
    var u7 = t4(n5, r2, e4);
    return u7 > -1 ? i3[o6 ? n5[u7] : u7] : void 0;
  };
}
var mu = Math.max;
function ju(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  if (!e4)
    return -1;
  var i3 = null == r2 ? 0 : R(r2);
  return i3 < 0 && (i3 = mu(e4 + i3, 0)), Wt(t4, Qi(n5), i3);
}
var wu = bu(ju);
function xu(t4, n5, r2) {
  var e4;
  return r2(t4, function(t5, r3, i3) {
    if (n5(t5, r3, i3))
      return e4 = r3, false;
  }), e4;
}
function Ou(t4, n5) {
  return xu(t4, Qi(n5), uo);
}
var Au = Math.max;
var Iu = Math.min;
function Eu(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  if (!e4)
    return -1;
  var i3 = e4 - 1;
  return void 0 !== r2 && (i3 = R(r2), i3 = r2 < 0 ? Au(e4 + i3, 0) : Iu(i3, e4 - 1)), Wt(t4, Qi(n5), i3, true);
}
var ku = bu(Eu);
function Su(t4, n5) {
  return xu(t4, Qi(n5), Qo);
}
function Wu(t4) {
  return t4 && t4.length ? t4[0] : void 0;
}
function Mu(t4, n5) {
  var r2 = -1, e4 = en(t4) ? Array(t4.length) : [];
  return fo(t4, function(t5, i3, o6) {
    e4[++r2] = n5(t5, i3, o6);
  }), e4;
}
function Ru(t4, n5) {
  return (d(t4) ? h : Mu)(t4, Qi(n5));
}
function Bu(t4, n5) {
  return dr(Ru(t4, n5), 1);
}
function zu(t4, n5) {
  return dr(Ru(t4, n5), Infinity);
}
function Lu(t4, n5, r2) {
  return r2 = void 0 === r2 ? 1 : R(r2), dr(Ru(t4, n5), r2);
}
function Pu(t4) {
  return (null == t4 ? 0 : t4.length) ? dr(t4, Infinity) : [];
}
function Tu(t4, n5) {
  return (null == t4 ? 0 : t4.length) ? dr(t4, n5 = void 0 === n5 ? 1 : R(n5)) : [];
}
function Du(t4) {
  return Vt(t4, 512);
}
var Cu = Ie("floor");
function Nu(t4) {
  return _r(function(n5) {
    var r2 = n5.length, e4 = r2, i3 = ht.prototype.thru;
    for (t4 && n5.reverse(); e4--; ) {
      var o6 = n5[e4];
      if ("function" != typeof o6)
        throw new TypeError("Expected a function");
      if (i3 && !u7 && "wrapper" == vt(o6))
        var u7 = new ht([], true);
    }
    for (e4 = u7 ? e4 : r2; ++e4 < r2; ) {
      var a5 = vt(o6 = n5[e4]), f3 = "wrapper" == a5 ? lt(o6) : void 0;
      u7 = f3 && bt(f3[0]) && 424 == f3[1] && !f3[4].length && 1 == f3[9] ? u7[vt(f3[0])].apply(u7, f3[3]) : 1 == o6.length && bt(o6) ? u7[a5]() : u7.thru(o6);
    }
    return function() {
      var t5 = arguments, e5 = t5[0];
      if (u7 && 1 == t5.length && d(e5))
        return u7.plant(e5).value();
      for (var i4 = 0, o7 = r2 ? n5[i4].apply(this, t5) : e5; ++i4 < r2; )
        o7 = n5[i4].call(this, o7);
      return o7;
    };
  });
}
var Uu = Nu();
var Fu = Nu(true);
function qu(t4, n5) {
  return null == t4 ? t4 : oo(t4, Go(n5), Cn);
}
function $u(t4, n5) {
  return null == t4 ? t4 : Yo(t4, Go(n5), Cn);
}
function Ku(t4, n5) {
  return t4 && uo(t4, Go(n5));
}
function Vu(t4, n5) {
  return t4 && Qo(t4, Go(n5));
}
function Zu(t4) {
  for (var n5 = -1, r2 = null == t4 ? 0 : t4.length, e4 = {}; ++n5 < r2; ) {
    var i3 = t4[n5];
    e4[i3[0]] = i3[1];
  }
  return e4;
}
function Gu(t4, n5) {
  return Ue(n5, function(n6) {
    return L(t4[n6]);
  });
}
function Ju(t4) {
  return null == t4 ? [] : Gu(t4, zn(t4));
}
function Hu(t4) {
  return null == t4 ? [] : Gu(t4, Cn(t4));
}
var Yu = Object.prototype.hasOwnProperty;
var Qu = lo(function(t4, n5, r2) {
  Yu.call(t4, r2) ? t4[r2].push(n5) : Gt(t4, r2, [n5]);
});
function Xu(t4, n5) {
  return t4 > n5;
}
function ta(t4) {
  return function(n5, r2) {
    return "string" == typeof n5 && "string" == typeof r2 || (n5 = W(n5), r2 = W(r2)), t4(n5, r2);
  };
}
var na = ta(Xu);
var ra = ta(function(t4, n5) {
  return t4 >= n5;
});
var ea = Object.prototype.hasOwnProperty;
function ia(t4, n5) {
  return null != t4 && ea.call(t4, n5);
}
function oa(t4, n5) {
  return null != t4 && Zi(t4, n5, ia);
}
var ua = Math.max;
var aa = Math.min;
function fa(t4, n5, r2) {
  return n5 = M(n5), void 0 === r2 ? (r2 = n5, n5 = 0) : r2 = M(r2), function(t5, n6, r3) {
    return t5 >= aa(n6, r3) && t5 < ua(n6, r3);
  }(t4 = W(t4), n5, r2);
}
function ca(t4) {
  return "string" == typeof t4 || !d(t4) && s(t4) && "[object String]" == l(t4);
}
function la(t4, n5) {
  return h(n5, function(n6) {
    return t4[n6];
  });
}
function sa(t4) {
  return null == t4 ? [] : la(t4, zn(t4));
}
var pa = Math.max;
function va(t4, n5, r2, e4) {
  t4 = en(t4) ? t4 : sa(t4), r2 = r2 && !e4 ? R(r2) : 0;
  var i3 = t4.length;
  return r2 < 0 && (r2 = pa(i3 + r2, 0)), ca(t4) ? r2 <= i3 && t4.indexOf(n5, r2) > -1 : !!i3 && Rt(t4, n5, r2) > -1;
}
var ha = Math.max;
function da(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  if (!e4)
    return -1;
  var i3 = null == r2 ? 0 : R(r2);
  return i3 < 0 && (i3 = ha(e4 + i3, 0)), Rt(t4, n5, i3);
}
function ya(t4) {
  return (null == t4 ? 0 : t4.length) ? Rr(t4, 0, -1) : [];
}
var _a = Math.min;
function ga(t4, n5, r2) {
  for (var e4 = r2 ? Po : Bt, i3 = t4[0].length, o6 = t4.length, u7 = o6, a5 = Array(o6), f3 = 1 / 0, c5 = []; u7--; ) {
    var l4 = t4[u7];
    u7 && n5 && (l4 = h(l4, jn(n5))), f3 = _a(l4.length, f3), a5[u7] = !r2 && (n5 || i3 >= 120 && l4.length >= 120) ? new ki(u7 && l4) : void 0;
  }
  l4 = t4[0];
  var s2 = -1, p5 = a5[0];
  t:
    for (; ++s2 < i3 && c5.length < f3; ) {
      var v2 = l4[s2], d3 = n5 ? n5(v2) : v2;
      if (v2 = r2 || 0 !== v2 ? v2 : 0, !(p5 ? Wi(p5, d3) : e4(c5, d3, r2))) {
        for (u7 = o6; --u7; ) {
          var y2 = a5[u7];
          if (!(y2 ? Wi(y2, d3) : e4(t4[u7], d3, r2)))
            continue t;
        }
        p5 && p5.push(d3), c5.push(v2);
      }
    }
  return c5;
}
function ba(t4) {
  return Io(t4) ? t4 : [];
}
var ma = nn(function(t4) {
  var n5 = h(t4, ba);
  return n5.length && n5[0] === t4[0] ? ga(n5) : [];
});
var ja = nn(function(t4) {
  var n5 = Co(t4), r2 = h(t4, ba);
  return n5 === Co(r2) ? n5 = void 0 : r2.pop(), r2.length && r2[0] === t4[0] ? ga(r2, Qi(n5)) : [];
});
var wa = nn(function(t4) {
  var n5 = Co(t4), r2 = h(t4, ba);
  return (n5 = "function" == typeof n5 ? n5 : void 0) && r2.pop(), r2.length && r2[0] === t4[0] ? ga(r2, void 0, n5) : [];
});
function xa(t4, n5) {
  return function(r2, e4) {
    return function(t5, n6, r3, e5) {
      return uo(t5, function(t6, i3, o6) {
        n6(e5, r3(t6), i3, o6);
      }), e5;
    }(r2, t4, n5(e4), {});
  };
}
var Oa = Object.prototype.toString;
var Aa = xa(function(t4, n5, r2) {
  null != n5 && "function" != typeof n5.toString && (n5 = Oa.call(n5)), t4[n5] = r2;
}, It(z));
var Ia = Object.prototype;
var Ea = Ia.hasOwnProperty;
var ka = Ia.toString;
var Sa = xa(function(t4, n5, r2) {
  null != n5 && "function" != typeof n5.toString && (n5 = ka.call(n5)), Ea.call(t4, n5) ? t4[n5].push(r2) : t4[n5] = [r2];
}, Qi);
function Wa(t4, n5) {
  return n5.length < 2 ? t4 : cr(t4, Rr(n5, 0, -1));
}
function Ma(t4, n5, r2) {
  var e4 = null == (t4 = Wa(t4, n5 = ar(n5, t4))) ? t4 : t4[fr(Co(n5))];
  return null == e4 ? void 0 : nt(e4, t4, r2);
}
var Ra = nn(Ma);
var Ba = nn(function(t4, n5, r2) {
  var e4 = -1, i3 = "function" == typeof n5, o6 = en(t4) ? Array(t4.length) : [];
  return fo(t4, function(t5) {
    o6[++e4] = i3 ? nt(n5, t5, r2) : Ma(t5, n5, r2);
  }), o6;
});
var za = An && An.isArrayBuffer;
var La = za ? jn(za) : function(t4) {
  return s(t4) && "[object ArrayBuffer]" == l(t4);
};
function Pa(t4) {
  return true === t4 || false === t4 || s(t4) && "[object Boolean]" == l(t4);
}
var Ta = An && An.isDate;
var Da = Ta ? jn(Ta) : function(t4) {
  return s(t4) && "[object Date]" == l(t4);
};
function Ca(t4) {
  return s(t4) && 1 === t4.nodeType && !Ar(t4);
}
var Na = Object.prototype.hasOwnProperty;
function Ua(t4) {
  if (null == t4)
    return true;
  if (en(t4) && (d(t4) || "string" == typeof t4 || "function" == typeof t4.splice || bn(t4) || En(t4) || hn(t4)))
    return !t4.length;
  var n5 = oi(t4);
  if ("[object Map]" == n5 || "[object Set]" == n5)
    return !t4.size;
  if (fn(t4))
    return !Bn(t4).length;
  for (var r2 in t4)
    if (Na.call(t4, r2))
      return false;
  return true;
}
function Fa(t4, n5) {
  return Ni(t4, n5);
}
function qa(t4, n5, r2) {
  var e4 = (r2 = "function" == typeof r2 ? r2 : void 0) ? r2(t4, n5) : void 0;
  return void 0 === e4 ? Ni(t4, n5, void 0, r2) : !!e4;
}
var $a = r.isFinite;
function Ka(t4) {
  return "number" == typeof t4 && $a(t4);
}
function Va(t4) {
  return "number" == typeof t4 && t4 == R(t4);
}
function Za(t4, n5) {
  return t4 === n5 || Ui(t4, n5, qi(n5));
}
function Ga(t4, n5, r2) {
  return r2 = "function" == typeof r2 ? r2 : void 0, Ui(t4, n5, qi(n5), r2);
}
function Ja(t4) {
  return "number" == typeof t4 || s(t4) && "[object Number]" == l(t4);
}
function Ha(t4) {
  return Ja(t4) && t4 != +t4;
}
var Ya = T ? L : dn;
function Qa(t4) {
  if (Ya(t4))
    throw new Error("Unsupported core-js use. Try https://npms.io/search?q=ponyfill.");
  return Z(t4);
}
function Xa(t4) {
  return null == t4;
}
function tf(t4) {
  return null === t4;
}
var nf = An && An.isRegExp;
var rf = nf ? jn(nf) : function(t4) {
  return s(t4) && "[object RegExp]" == l(t4);
};
function ef(t4) {
  return Va(t4) && t4 >= -9007199254740991 && t4 <= 9007199254740991;
}
function of(t4) {
  return void 0 === t4;
}
function uf(t4) {
  return s(t4) && "[object WeakMap]" == oi(t4);
}
function af(t4) {
  return s(t4) && "[object WeakSet]" == l(t4);
}
function ff(t4) {
  return Qi("function" == typeof t4 ? t4 : mi(t4, 1));
}
var cf = Array.prototype.join;
function lf(t4, n5) {
  return null == t4 ? "" : cf.call(t4, n5);
}
var sf = je(function(t4, n5, r2) {
  return t4 + (r2 ? "-" : "") + n5.toLowerCase();
});
var pf = lo(function(t4, n5, r2) {
  Gt(t4, r2, n5);
});
var vf = Math.max;
var hf = Math.min;
function df(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  if (!e4)
    return -1;
  var i3 = e4;
  return void 0 !== r2 && (i3 = (i3 = R(r2)) < 0 ? vf(e4 + i3, 0) : hf(i3, e4 - 1)), n5 == n5 ? function(t5, n6, r3) {
    for (var e5 = r3 + 1; e5--; )
      if (t5[e5] === n6)
        return e5;
    return e5;
  }(t4, n5, i3) : Wt(t4, Mt, i3, true);
}
var yf = je(function(t4, n5, r2) {
  return t4 + (r2 ? " " : "") + n5.toLowerCase();
});
var _f = Zr("toLowerCase");
function gf(t4, n5) {
  return t4 < n5;
}
var bf = ta(gf);
var mf = ta(function(t4, n5) {
  return t4 <= n5;
});
function jf(t4, n5) {
  var r2 = {};
  return n5 = Qi(n5), uo(t4, function(t5, e4, i3) {
    Gt(r2, n5(t5, e4, i3), t5);
  }), r2;
}
function wf(t4, n5) {
  var r2 = {};
  return n5 = Qi(n5), uo(t4, function(t5, e4, i3) {
    Gt(r2, e4, n5(t5, e4, i3));
  }), r2;
}
function xf(t4) {
  return Ki(mi(t4, 1));
}
function Of(t4, n5) {
  return Ji(t4, mi(n5, 1));
}
function Af(t4, n5, r2) {
  for (var e4 = -1, i3 = t4.length; ++e4 < i3; ) {
    var o6 = t4[e4], u7 = n5(o6);
    if (null != u7 && (void 0 === a5 ? u7 == u7 && !p(u7) : r2(u7, a5)))
      var a5 = u7, f3 = o6;
  }
  return f3;
}
function If(t4) {
  return t4 && t4.length ? Af(t4, z, Xu) : void 0;
}
function Ef(t4, n5) {
  return t4 && t4.length ? Af(t4, Qi(n5), Xu) : void 0;
}
function kf(t4, n5) {
  for (var r2, e4 = -1, i3 = t4.length; ++e4 < i3; ) {
    var o6 = n5(t4[e4]);
    void 0 !== o6 && (r2 = void 0 === r2 ? o6 : r2 + o6);
  }
  return r2;
}
function Sf(t4, n5) {
  var r2 = null == t4 ? 0 : t4.length;
  return r2 ? kf(t4, n5) / r2 : NaN;
}
function Wf(t4) {
  return Sf(t4, z);
}
function Mf(t4, n5) {
  return Sf(t4, Qi(n5));
}
var Rf = un(function(t4, n5, r2) {
  So(t4, n5, r2);
});
var Bf = nn(function(t4, n5) {
  return function(r2) {
    return Ma(r2, t4, n5);
  };
});
var zf = nn(function(t4, n5) {
  return function(r2) {
    return Ma(t4, r2, n5);
  };
});
function Lf(t4) {
  return t4 && t4.length ? Af(t4, z, gf) : void 0;
}
function Pf(t4, n5) {
  return t4 && t4.length ? Af(t4, Qi(n5), gf) : void 0;
}
function Tf(t4, n5, r2) {
  var e4 = zn(n5), i3 = Gu(n5, e4), o6 = !(A(r2) && "chain" in r2 && !r2.chain), u7 = L(t4);
  return St(i3, function(r3) {
    var e5 = n5[r3];
    t4[r3] = e5, u7 && (t4.prototype[r3] = function() {
      var n6 = this.__chain__;
      if (o6 || n6) {
        var r4 = t4(this.__wrapped__), i4 = r4.__actions__ = dt(this.__actions__);
        return i4.push({ func: e5, args: arguments, thisArg: t4 }), r4.__chain__ = n6, r4;
      }
      return e5.apply(t4, pr([this.value()], arguments));
    });
  }), t4;
}
var Df = b(function(t4, n5) {
  return t4 * n5;
}, 1);
function Cf(t4) {
  if ("function" != typeof t4)
    throw new TypeError("Expected a function");
  return function() {
    var n5 = arguments;
    switch (n5.length) {
      case 0:
        return !t4.call(this);
      case 1:
        return !t4.call(this, n5[0]);
      case 2:
        return !t4.call(this, n5[0], n5[1]);
      case 3:
        return !t4.call(this, n5[0], n5[1], n5[2]);
    }
    return !t4.apply(this, n5);
  };
}
var Nf = e ? e.iterator : void 0;
function Uf(t4) {
  if (!t4)
    return [];
  if (en(t4))
    return ca(t4) ? Vr(t4) : dt(t4);
  if (Nf && t4[Nf])
    return function(t5) {
      for (var n6, r2 = []; !(n6 = t5.next()).done; )
        r2.push(n6.value);
      return r2;
    }(t4[Nf]());
  var n5 = oi(t4);
  return ("[object Map]" == n5 ? Ri : "[object Set]" == n5 ? Bi : sa)(t4);
}
function Ff() {
  void 0 === this.__values__ && (this.__values__ = Uf(this.value()));
  var t4 = this.__index__ >= this.__values__.length;
  return { done: t4, value: t4 ? void 0 : this.__values__[this.__index__++] };
}
function qf(t4, n5) {
  var r2 = t4.length;
  if (r2)
    return Ct(n5 += n5 < 0 ? r2 : 0, r2) ? t4[n5] : void 0;
}
function $f(t4, n5) {
  return t4 && t4.length ? qf(t4, R(n5)) : void 0;
}
function Kf(t4) {
  return t4 = R(t4), nn(function(n5) {
    return qf(n5, t4);
  });
}
function Vf(t4, n5) {
  return null == (t4 = Wa(t4, n5 = ar(n5, t4))) || delete t4[fr(Co(n5))];
}
function Zf(t4) {
  return Ar(t4) ? void 0 : t4;
}
var Gf = _r(function(t4, n5) {
  var r2 = {};
  if (null == t4)
    return r2;
  var e4 = false;
  n5 = h(n5, function(n6) {
    return n6 = ar(n6, t4), e4 || (e4 = n6.length > 1), n6;
  }), Qt(t4, Je(t4), r2), e4 && (r2 = mi(r2, 7, Zf));
  for (var i3 = n5.length; i3--; )
    Vf(r2, n5[i3]);
  return r2;
});
function Jf(t4, n5, r2, e4) {
  if (!A(t4))
    return t4;
  for (var i3 = -1, o6 = (n5 = ar(n5, t4)).length, u7 = o6 - 1, a5 = t4; null != a5 && ++i3 < o6; ) {
    var f3 = fr(n5[i3]), c5 = r2;
    if ("__proto__" === f3 || "constructor" === f3 || "prototype" === f3)
      return t4;
    if (i3 != u7) {
      var l4 = a5[f3];
      void 0 === (c5 = e4 ? e4(l4, f3, a5) : void 0) && (c5 = A(l4) ? l4 : Ct(n5[i3 + 1]) ? [] : {});
    }
    Yt(a5, f3, c5), a5 = a5[f3];
  }
  return t4;
}
function Hf(t4, n5, r2) {
  for (var e4 = -1, i3 = n5.length, o6 = {}; ++e4 < i3; ) {
    var u7 = n5[e4], a5 = cr(t4, u7);
    r2(a5, u7) && Jf(o6, ar(u7, t4), a5);
  }
  return o6;
}
function Yf(t4, n5) {
  if (null == t4)
    return {};
  var r2 = h(Je(t4), function(t5) {
    return [t5];
  });
  return n5 = Qi(n5), Hf(t4, r2, function(t5, r3) {
    return n5(t5, r3[0]);
  });
}
function Qf(t4, n5) {
  return Yf(t4, Cf(Qi(n5)));
}
function Xf(t4) {
  return kr(2, t4);
}
function tc(t4, n5) {
  if (t4 !== n5) {
    var r2 = void 0 !== t4, e4 = null === t4, i3 = t4 == t4, o6 = p(t4), u7 = void 0 !== n5, a5 = null === n5, f3 = n5 == n5, c5 = p(n5);
    if (!a5 && !c5 && !o6 && t4 > n5 || o6 && u7 && f3 && !a5 && !c5 || e4 && u7 && f3 || !r2 && f3 || !i3)
      return 1;
    if (!e4 && !o6 && !c5 && t4 < n5 || c5 && r2 && i3 && !e4 && !o6 || a5 && r2 && i3 || !u7 && i3 || !f3)
      return -1;
  }
  return 0;
}
function nc(t4, n5, r2) {
  n5 = n5.length ? h(n5, function(t5) {
    return d(t5) ? function(n6) {
      return cr(n6, 1 === t5.length ? t5[0] : t5);
    } : t5;
  }) : [z];
  var e4 = -1;
  return n5 = h(n5, jn(Qi)), function(t5, n6) {
    var r3 = t5.length;
    for (t5.sort(n6); r3--; )
      t5[r3] = t5[r3].value;
    return t5;
  }(Mu(t4, function(t5, r3, i3) {
    return { criteria: h(n5, function(n6) {
      return n6(t5);
    }), index: ++e4, value: t5 };
  }), function(t5, n6) {
    return function(t6, n7, r3) {
      for (var e5 = -1, i3 = t6.criteria, o6 = n7.criteria, u7 = i3.length, a5 = r3.length; ++e5 < u7; ) {
        var f3 = tc(i3[e5], o6[e5]);
        if (f3)
          return e5 >= a5 ? f3 : f3 * ("desc" == r3[e5] ? -1 : 1);
      }
      return t6.index - n7.index;
    }(t5, n6, r2);
  });
}
function rc(t4, n5, r2, e4) {
  return null == t4 ? [] : (d(n5) || (n5 = null == n5 ? [] : [n5]), d(r2 = e4 ? void 0 : r2) || (r2 = null == r2 ? [] : [r2]), nc(t4, n5, r2));
}
function ec(t4) {
  return _r(function(n5) {
    return n5 = h(n5, jn(Qi)), nn(function(r2) {
      var e4 = this;
      return t4(n5, function(t5) {
        return nt(t5, e4, r2);
      });
    });
  });
}
var ic = ec(h);
var oc = nn;
var uc = Math.min;
var ac = oc(function(t4, n5) {
  var r2 = (n5 = 1 == n5.length && d(n5[0]) ? h(n5[0], jn(Qi)) : h(dr(n5, 1), jn(Qi))).length;
  return nn(function(e4) {
    for (var i3 = -1, o6 = uc(e4.length, r2); ++i3 < o6; )
      e4[i3] = n5[i3].call(this, e4[i3]);
    return nt(t4, this, e4);
  });
});
var fc = ec(pu);
var cc = ec(Si);
var lc = Math.floor;
function sc(t4, n5) {
  var r2 = "";
  if (!t4 || n5 < 1 || n5 > 9007199254740991)
    return r2;
  do {
    n5 % 2 && (r2 += t4), (n5 = lc(n5 / 2)) && (t4 += t4);
  } while (n5);
  return r2;
}
var pc = Hi("length");
var vc = "[\\ud800-\\udfff]";
var hc = "[\\u0300-\\u036f\\ufe20-\\ufe2f\\u20d0-\\u20ff]";
var dc = "\\ud83c[\\udffb-\\udfff]";
var yc = "[^\\ud800-\\udfff]";
var _c = "(?:\\ud83c[\\udde6-\\uddff]){2}";
var gc = "[\\ud800-\\udbff][\\udc00-\\udfff]";
var bc = "(?:" + hc + "|" + dc + ")?";
var mc = "[\\ufe0e\\ufe0f]?" + bc + ("(?:\\u200d(?:" + [yc, _c, gc].join("|") + ")[\\ufe0e\\ufe0f]?" + bc + ")*");
var jc = "(?:" + [yc + hc + "?", hc, _c, gc, vc].join("|") + ")";
var wc = RegExp(dc + "(?=" + dc + ")|" + jc + mc, "g");
function xc(t4) {
  return Lr(t4) ? function(t5) {
    for (var n5 = wc.lastIndex = 0; wc.test(t5); )
      ++n5;
    return n5;
  }(t4) : pc(t4);
}
var Oc = Math.ceil;
function Ac(t4, n5) {
  var r2 = (n5 = void 0 === n5 ? " " : g(n5)).length;
  if (r2 < 2)
    return r2 ? sc(n5, t4) : n5;
  var e4 = sc(n5, Oc(t4 / xc(n5)));
  return Lr(n5) ? Br(Vr(e4), 0, t4).join("") : e4.slice(0, t4);
}
var Ic = Math.ceil;
var Ec = Math.floor;
function kc(t4, n5, r2) {
  t4 = ur(t4);
  var e4 = (n5 = R(n5)) ? xc(t4) : 0;
  if (!n5 || e4 >= n5)
    return t4;
  var i3 = (n5 - e4) / 2;
  return Ac(Ec(i3), r2) + t4 + Ac(Ic(i3), r2);
}
function Sc(t4, n5, r2) {
  t4 = ur(t4);
  var e4 = (n5 = R(n5)) ? xc(t4) : 0;
  return n5 && e4 < n5 ? t4 + Ac(n5 - e4, r2) : t4;
}
function Wc(t4, n5, r2) {
  t4 = ur(t4);
  var e4 = (n5 = R(n5)) ? xc(t4) : 0;
  return n5 && e4 < n5 ? Ac(n5 - e4, r2) + t4 : t4;
}
var Mc = /^\s+/;
var Rc = r.parseInt;
function Bc(t4, n5, r2) {
  return r2 || null == n5 ? n5 = 0 : n5 && (n5 = +n5), Rc(ur(t4).replace(Mc, ""), n5 || 0);
}
var zc = nn(function(t4, n5) {
  return Vt(t4, 32, void 0, n5, Ft(n5, Tt(zc)));
});
zc.placeholder = {};
var Lc = nn(function(t4, n5) {
  return Vt(t4, 64, void 0, n5, Ft(n5, Tt(Lc)));
});
Lc.placeholder = {};
var Pc = lo(function(t4, n5, r2) {
  t4[r2 ? 0 : 1].push(n5);
}, function() {
  return [[], []];
});
var Tc = _r(function(t4, n5) {
  return null == t4 ? {} : function(t5, n6) {
    return Hf(t5, n6, function(n7, r2) {
      return Gi(t5, r2);
    });
  }(t4, n5);
});
function Dc(t4) {
  for (var n5, r2 = this; r2 instanceof at; ) {
    var e4 = yt(r2);
    e4.__index__ = 0, e4.__values__ = void 0, n5 ? i3.__wrapped__ = e4 : n5 = e4;
    var i3 = e4;
    r2 = r2.__wrapped__;
  }
  return i3.__wrapped__ = t4, n5;
}
function Cc(t4) {
  return function(n5) {
    return null == t4 ? void 0 : cr(t4, n5);
  };
}
function Nc(t4, n5, r2, e4) {
  for (var i3 = r2 - 1, o6 = t4.length; ++i3 < o6; )
    if (e4(t4[i3], n5))
      return i3;
  return -1;
}
var Uc = Array.prototype.splice;
function Fc(t4, n5, r2, e4) {
  var i3 = e4 ? Nc : Rt, o6 = -1, u7 = n5.length, a5 = t4;
  for (t4 === n5 && (n5 = dt(n5)), r2 && (a5 = h(t4, jn(r2))); ++o6 < u7; )
    for (var f3 = 0, c5 = n5[o6], l4 = r2 ? r2(c5) : c5; (f3 = i3(a5, l4, f3, e4)) > -1; )
      a5 !== t4 && Uc.call(a5, f3, 1), Uc.call(t4, f3, 1);
  return t4;
}
function qc(t4, n5) {
  return t4 && t4.length && n5 && n5.length ? Fc(t4, n5) : t4;
}
var $c = nn(qc);
function Kc(t4, n5, r2) {
  return t4 && t4.length && n5 && n5.length ? Fc(t4, n5, Qi(r2)) : t4;
}
function Vc(t4, n5, r2) {
  return t4 && t4.length && n5 && n5.length ? Fc(t4, n5, void 0, r2) : t4;
}
var Zc = Array.prototype.splice;
function Gc(t4, n5) {
  for (var r2 = t4 ? n5.length : 0, e4 = r2 - 1; r2--; ) {
    var i3 = n5[r2];
    if (r2 == e4 || i3 !== o6) {
      var o6 = i3;
      Ct(i3) ? Zc.call(t4, i3, 1) : Vf(t4, i3);
    }
  }
  return t4;
}
var Jc = _r(function(t4, n5) {
  var r2 = null == t4 ? 0 : t4.length, e4 = sr(t4, n5);
  return Gc(t4, h(n5, function(t5) {
    return Ct(t5, r2) ? +t5 : t5;
  }).sort(tc)), e4;
});
var Hc = Math.floor;
var Yc = Math.random;
function Qc(t4, n5) {
  return t4 + Hc(Yc() * (n5 - t4 + 1));
}
var Xc = parseFloat;
var tl = Math.min;
var nl = Math.random;
function rl(t4, n5, r2) {
  if (r2 && "boolean" != typeof r2 && on(t4, n5, r2) && (n5 = r2 = void 0), void 0 === r2 && ("boolean" == typeof n5 ? (r2 = n5, n5 = void 0) : "boolean" == typeof t4 && (r2 = t4, t4 = void 0)), void 0 === t4 && void 0 === n5 ? (t4 = 0, n5 = 1) : (t4 = M(t4), void 0 === n5 ? (n5 = t4, t4 = 0) : n5 = M(n5)), t4 > n5) {
    var e4 = t4;
    t4 = n5, n5 = e4;
  }
  if (r2 || t4 % 1 || n5 % 1) {
    var i3 = nl();
    return tl(t4 + i3 * (n5 - t4 + Xc("1e-" + ((i3 + "").length - 1))), n5);
  }
  return Qc(t4, n5);
}
var el = Math.ceil;
var il = Math.max;
function ol(t4) {
  return function(n5, r2, e4) {
    return e4 && "number" != typeof e4 && on(n5, r2, e4) && (r2 = e4 = void 0), n5 = M(n5), void 0 === r2 ? (r2 = n5, n5 = 0) : r2 = M(r2), function(t5, n6, r3, e5) {
      for (var i3 = -1, o6 = il(el((n6 - t5) / (r3 || 1)), 0), u7 = Array(o6); o6--; )
        u7[e5 ? o6 : ++i3] = t5, t5 += r3;
      return u7;
    }(n5, r2, e4 = void 0 === e4 ? n5 < r2 ? 1 : -1 : M(e4), t4);
  };
}
var ul = ol();
var al = ol(true);
var fl = _r(function(t4, n5) {
  return Vt(t4, 256, void 0, void 0, void 0, n5);
});
function cl(t4, n5, r2, e4, i3) {
  return i3(t4, function(t5, i4, o6) {
    r2 = e4 ? (e4 = false, t5) : n5(r2, t5, i4, o6);
  }), r2;
}
function ll(t4, n5, r2) {
  var e4 = d(t4) ? Hr : cl, i3 = arguments.length < 3;
  return e4(t4, Qi(n5), r2, i3, fo);
}
function sl(t4, n5, r2, e4) {
  var i3 = null == t4 ? 0 : t4.length;
  for (e4 && i3 && (r2 = t4[--i3]); i3--; )
    r2 = n5(r2, t4[i3], i3, t4);
  return r2;
}
function pl(t4, n5, r2) {
  var e4 = d(t4) ? sl : cl, i3 = arguments.length < 3;
  return e4(t4, Qi(n5), r2, i3, Xo);
}
function vl(t4, n5) {
  return (d(t4) ? Ue : _u)(t4, Cf(Qi(n5)));
}
function hl(t4, n5) {
  var r2 = [];
  if (!t4 || !t4.length)
    return r2;
  var e4 = -1, i3 = [], o6 = t4.length;
  for (n5 = Qi(n5); ++e4 < o6; ) {
    var u7 = t4[e4];
    n5(u7, e4, t4) && (r2.push(u7), i3.push(e4));
  }
  return Gc(t4, i3), r2;
}
function dl(t4, n5, r2) {
  return n5 = (r2 ? on(t4, n5, r2) : void 0 === n5) ? 1 : R(n5), sc(ur(t4), n5);
}
function yl() {
  var t4 = arguments, n5 = ur(t4[0]);
  return t4.length < 3 ? n5 : n5.replace(t4[1], t4[2]);
}
function _l(t4, n5) {
  if ("function" != typeof t4)
    throw new TypeError("Expected a function");
  return nn(t4, n5 = void 0 === n5 ? n5 : R(n5));
}
function gl(t4, n5, r2) {
  var e4 = -1, i3 = (n5 = ar(n5, t4)).length;
  for (i3 || (i3 = 1, t4 = void 0); ++e4 < i3; ) {
    var o6 = null == t4 ? void 0 : t4[fr(n5[e4])];
    void 0 === o6 && (e4 = i3, o6 = r2), t4 = L(o6) ? o6.call(t4) : o6;
  }
  return t4;
}
var bl = Array.prototype.reverse;
function ml(t4) {
  return null == t4 ? t4 : bl.call(t4);
}
var jl = Ie("round");
function wl(t4) {
  var n5 = t4.length;
  return n5 ? t4[Qc(0, n5 - 1)] : void 0;
}
function xl(t4) {
  return wl(sa(t4));
}
function Ol(t4) {
  return (d(t4) ? wl : xl)(t4);
}
function Al(t4, n5) {
  var r2 = -1, e4 = t4.length, i3 = e4 - 1;
  for (n5 = void 0 === n5 ? e4 : n5; ++r2 < n5; ) {
    var o6 = Qc(r2, i3), u7 = t4[o6];
    t4[o6] = t4[r2], t4[r2] = u7;
  }
  return t4.length = n5, t4;
}
function Il(t4, n5) {
  return Al(dt(t4), Re(n5, 0, t4.length));
}
function El(t4, n5) {
  var r2 = sa(t4);
  return Al(r2, Re(n5, 0, r2.length));
}
function kl(t4, n5, r2) {
  return n5 = (r2 ? on(t4, n5, r2) : void 0 === n5) ? 1 : R(n5), (d(t4) ? Il : El)(t4, n5);
}
function Sl(t4, n5, r2) {
  return null == t4 ? t4 : Jf(t4, n5, r2);
}
function Wl(t4, n5, r2, e4) {
  return e4 = "function" == typeof e4 ? e4 : void 0, null == t4 ? t4 : Jf(t4, n5, r2, e4);
}
function Ml(t4) {
  return Al(dt(t4));
}
function Rl(t4) {
  return Al(sa(t4));
}
function Bl(t4) {
  return (d(t4) ? Ml : Rl)(t4);
}
function zl(t4) {
  if (null == t4)
    return 0;
  if (en(t4))
    return ca(t4) ? xc(t4) : t4.length;
  var n5 = oi(t4);
  return "[object Map]" == n5 || "[object Set]" == n5 ? t4.size : Bn(t4).length;
}
function Ll(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  return e4 ? (r2 && "number" != typeof r2 && on(t4, n5, r2) ? (n5 = 0, r2 = e4) : (n5 = null == n5 ? 0 : R(n5), r2 = void 0 === r2 ? e4 : R(r2)), Rr(t4, n5, r2)) : [];
}
var Pl = je(function(t4, n5, r2) {
  return t4 + (r2 ? "_" : "") + n5.toLowerCase();
});
function Tl(t4, n5) {
  var r2;
  return fo(t4, function(t5, e4, i3) {
    return !(r2 = n5(t5, e4, i3));
  }), !!r2;
}
function Dl(t4, n5, r2) {
  var e4 = d(t4) ? Si : Tl;
  return r2 && on(t4, n5, r2) && (n5 = void 0), e4(t4, Qi(n5));
}
var Cl = nn(function(t4, n5) {
  if (null == t4)
    return [];
  var r2 = n5.length;
  return r2 > 1 && on(t4, n5[0], n5[1]) ? n5 = [] : r2 > 2 && on(n5[0], n5[1], n5[2]) && (n5 = [n5[0]]), nc(t4, dr(n5, 1), []);
});
var Nl = Math.floor;
var Ul = Math.min;
function Fl(t4, n5, r2, e4) {
  var i3 = 0, o6 = null == t4 ? 0 : t4.length;
  if (0 === o6)
    return 0;
  for (var u7 = (n5 = r2(n5)) != n5, a5 = null === n5, f3 = p(n5), c5 = void 0 === n5; i3 < o6; ) {
    var l4 = Nl((i3 + o6) / 2), s2 = r2(t4[l4]), v2 = void 0 !== s2, h3 = null === s2, d3 = s2 == s2, y2 = p(s2);
    if (u7)
      var _2 = e4 || d3;
    else
      _2 = c5 ? d3 && (e4 || v2) : a5 ? d3 && v2 && (e4 || !h3) : f3 ? d3 && v2 && !h3 && (e4 || !y2) : !h3 && !y2 && (e4 ? s2 <= n5 : s2 < n5);
    _2 ? i3 = l4 + 1 : o6 = l4;
  }
  return Ul(o6, 4294967294);
}
function ql(t4, n5, r2) {
  var e4 = 0, i3 = null == t4 ? e4 : t4.length;
  if ("number" == typeof n5 && n5 == n5 && i3 <= 2147483647) {
    for (; e4 < i3; ) {
      var o6 = e4 + i3 >>> 1, u7 = t4[o6];
      null !== u7 && !p(u7) && (r2 ? u7 <= n5 : u7 < n5) ? e4 = o6 + 1 : i3 = o6;
    }
    return i3;
  }
  return Fl(t4, n5, z, r2);
}
function $l(t4, n5) {
  return ql(t4, n5);
}
function Kl(t4, n5, r2) {
  return Fl(t4, n5, Qi(r2));
}
function Vl(t4, n5) {
  var r2 = null == t4 ? 0 : t4.length;
  if (r2) {
    var e4 = ql(t4, n5);
    if (e4 < r2 && Jt(t4[e4], n5))
      return e4;
  }
  return -1;
}
function Zl(t4, n5) {
  return ql(t4, n5, true);
}
function Gl(t4, n5, r2) {
  return Fl(t4, n5, Qi(r2), true);
}
function Jl(t4, n5) {
  if (null == t4 ? 0 : t4.length) {
    var r2 = ql(t4, n5, true) - 1;
    if (Jt(t4[r2], n5))
      return r2;
  }
  return -1;
}
function Hl(t4, n5) {
  for (var r2 = -1, e4 = t4.length, i3 = 0, o6 = []; ++r2 < e4; ) {
    var u7 = t4[r2], a5 = n5 ? n5(u7) : u7;
    if (!r2 || !Jt(a5, f3)) {
      var f3 = a5;
      o6[i3++] = 0 === u7 ? 0 : u7;
    }
  }
  return o6;
}
function Yl(t4) {
  return t4 && t4.length ? Hl(t4) : [];
}
function Ql(t4, n5) {
  return t4 && t4.length ? Hl(t4, Qi(n5)) : [];
}
function Xl(t4, n5, r2) {
  return r2 && "number" != typeof r2 && on(t4, n5, r2) && (n5 = r2 = void 0), (r2 = void 0 === r2 ? 4294967295 : r2 >>> 0) ? (t4 = ur(t4)) && ("string" == typeof n5 || null != n5 && !rf(n5)) && !(n5 = g(n5)) && Lr(t4) ? Br(Vr(t4), 0, r2) : t4.split(n5, r2) : [];
}
var ts = Math.max;
function ns(t4, n5) {
  if ("function" != typeof t4)
    throw new TypeError("Expected a function");
  return n5 = null == n5 ? 0 : ts(R(n5), 0), nn(function(r2) {
    var e4 = r2[n5], i3 = Br(r2, 0, n5);
    return e4 && pr(i3, e4), nt(t4, this, i3);
  });
}
var rs = je(function(t4, n5, r2) {
  return t4 + (r2 ? " " : "") + Gr(n5);
});
function es(t4, n5, r2) {
  return t4 = ur(t4), r2 = null == r2 ? 0 : Re(R(r2), 0, t4.length), n5 = g(n5), t4.slice(r2, r2 + n5.length) == n5;
}
function is() {
  return {};
}
function os() {
  return "";
}
function us() {
  return true;
}
var as = b(function(t4, n5) {
  return t4 - n5;
}, 0);
function fs(t4) {
  return t4 && t4.length ? kf(t4, z) : 0;
}
function cs(t4, n5) {
  return t4 && t4.length ? kf(t4, Qi(n5)) : 0;
}
function ls(t4) {
  var n5 = null == t4 ? 0 : t4.length;
  return n5 ? Rr(t4, 1, n5) : [];
}
function ss(t4, n5, r2) {
  return t4 && t4.length ? Rr(t4, 0, (n5 = r2 || void 0 === n5 ? 1 : R(n5)) < 0 ? 0 : n5) : [];
}
function ps(t4, n5, r2) {
  var e4 = null == t4 ? 0 : t4.length;
  return e4 ? Rr(t4, (n5 = e4 - (n5 = r2 || void 0 === n5 ? 1 : R(n5))) < 0 ? 0 : n5, e4) : [];
}
function vs(t4, n5) {
  return t4 && t4.length ? Ko(t4, Qi(n5), false, true) : [];
}
function hs(t4, n5) {
  return t4 && t4.length ? Ko(t4, Qi(n5)) : [];
}
function ds(t4, n5) {
  return n5(t4), t4;
}
var ys = Object.prototype;
var _s = ys.hasOwnProperty;
function gs(t4, n5, r2, e4) {
  return void 0 === t4 || Jt(t4, ys[r2]) && !_s.call(e4, r2) ? n5 : t4;
}
var bs = { "\\": "\\", "'": "'", "\n": "n", "\r": "r", "\u2028": "u2028", "\u2029": "u2029" };
function ms(t4) {
  return "\\" + bs[t4];
}
var js = /<%=([\s\S]+?)%>/g;
var ws = { escape: /<%-([\s\S]+?)%>/g, evaluate: /<%([\s\S]+?)%>/g, interpolate: js, variable: "", imports: { _: { escape: fu } } };
var xs = /\b__p \+= '';/g;
var Os = /\b(__p \+=) '' \+/g;
var As = /(__e\(.*?\)|\b__t\)) \+\n'';/g;
var Is = /[()=,{}\[\]\/\s]/;
var Es = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
var ks = /($^)/;
var Ss = /['\n\r\u2028\u2029\\]/g;
var Ws = Object.prototype.hasOwnProperty;
function Ms(t4, n5, r2) {
  var e4 = ws.imports._.templateSettings || ws;
  r2 && on(t4, n5, r2) && (n5 = void 0), t4 = ur(t4), n5 = Un({}, n5, e4, gs);
  var i3, o6, u7 = Un({}, n5.imports, e4.imports, gs), a5 = zn(u7), f3 = la(u7, a5), c5 = 0, l4 = n5.interpolate || ks, s2 = "__p += '", p5 = RegExp((n5.escape || ks).source + "|" + l4.source + "|" + (l4 === js ? Es : ks).source + "|" + (n5.evaluate || ks).source + "|$", "g"), v2 = Ws.call(n5, "sourceURL") ? "//# sourceURL=" + (n5.sourceURL + "").replace(/\s/g, " ") + "\n" : "";
  t4.replace(p5, function(n6, r3, e5, u8, a6, f4) {
    return e5 || (e5 = u8), s2 += t4.slice(c5, f4).replace(Ss, ms), r3 && (i3 = true, s2 += "' +\n__e(" + r3 + ") +\n'"), a6 && (o6 = true, s2 += "';\n" + a6 + ";\n__p += '"), e5 && (s2 += "' +\n((__t = (" + e5 + ")) == null ? '' : __t) +\n'"), c5 = f4 + n6.length, n6;
  }), s2 += "';\n";
  var h3 = Ws.call(n5, "variable") && n5.variable;
  if (h3) {
    if (Is.test(h3))
      throw new Error("Invalid `variable` option passed into `_.template`");
  } else
    s2 = "with (obj) {\n" + s2 + "\n}\n";
  s2 = (o6 ? s2.replace(xs, "") : s2).replace(Os, "$1").replace(As, "$1;"), s2 = "function(" + (h3 || "obj") + ") {\n" + (h3 ? "" : "obj || (obj = {});\n") + "var __t, __p = ''" + (i3 ? ", __e = _.escape" : "") + (o6 ? ", __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" : ";\n") + s2 + "return __p\n}";
  var d3 = Er(function() {
    return Function(a5, v2 + "return " + s2).apply(void 0, f3);
  });
  if (d3.source = s2, Ir(d3))
    throw d3;
  return d3;
}
function Rs(t4, n5, r2) {
  var e4 = true, i3 = true;
  if ("function" != typeof t4)
    throw new TypeError("Expected a function");
  return A(r2) && (e4 = "leading" in r2 ? !!r2.leading : e4, i3 = "trailing" in r2 ? !!r2.trailing : i3), mo(t4, n5, { leading: e4, maxWait: n5, trailing: i3 });
}
function Bs(t4, n5) {
  return n5(t4);
}
var zs = Math.min;
function Ls(t4, n5) {
  if ((t4 = R(t4)) < 1 || t4 > 9007199254740991)
    return [];
  var r2 = 4294967295, e4 = zs(t4, 4294967295);
  t4 -= 4294967295;
  for (var i3 = cn(e4, n5 = Go(n5)); ++r2 < t4; )
    n5(r2);
  return i3;
}
function Ps() {
  return this;
}
function Ts(t4, n5) {
  var r2 = t4;
  return r2 instanceof ft && (r2 = r2.value()), Hr(n5, function(t5, n6) {
    return n6.func.apply(n6.thisArg, pr([t5], n6.args));
  }, r2);
}
function Ds() {
  return Ts(this.__wrapped__, this.__actions__);
}
function Cs(t4) {
  return ur(t4).toLowerCase();
}
function Ns(t4) {
  return d(t4) ? h(t4, fr) : p(t4) ? [t4] : dt(or(ur(t4)));
}
function Us(t4) {
  return t4 ? Re(R(t4), -9007199254740991, 9007199254740991) : 0 === t4 ? t4 : 0;
}
function Fs(t4) {
  return ur(t4).toUpperCase();
}
function qs(t4, n5, r2) {
  var e4 = d(t4), i3 = e4 || bn(t4) || En(t4);
  if (n5 = Qi(n5), null == r2) {
    var o6 = t4 && t4.constructor;
    r2 = i3 ? e4 ? new o6() : [] : A(t4) && L(o6) ? X(br(t4)) : {};
  }
  return (i3 ? St : uo)(t4, function(t5, e5, i4) {
    return n5(r2, t5, e5, i4);
  }), r2;
}
function $s(t4, n5) {
  for (var r2 = t4.length; r2-- && Rt(n5, t4[r2], 0) > -1; )
    ;
  return r2;
}
function Ks(t4, n5) {
  for (var r2 = -1, e4 = t4.length; ++r2 < e4 && Rt(n5, t4[r2], 0) > -1; )
    ;
  return r2;
}
function Vs(t4, n5, r2) {
  if ((t4 = ur(t4)) && (r2 || void 0 === n5))
    return O(t4);
  if (!t4 || !(n5 = g(n5)))
    return t4;
  var e4 = Vr(t4), i3 = Vr(n5);
  return Br(e4, Ks(e4, i3), $s(e4, i3) + 1).join("");
}
function Zs(t4, n5, r2) {
  if ((t4 = ur(t4)) && (r2 || void 0 === n5))
    return t4.slice(0, w(t4) + 1);
  if (!t4 || !(n5 = g(n5)))
    return t4;
  var e4 = Vr(t4);
  return Br(e4, 0, $s(e4, Vr(n5)) + 1).join("");
}
var Gs = /^\s+/;
function Js(t4, n5, r2) {
  if ((t4 = ur(t4)) && (r2 || void 0 === n5))
    return t4.replace(Gs, "");
  if (!t4 || !(n5 = g(n5)))
    return t4;
  var e4 = Vr(t4);
  return Br(e4, Ks(e4, Vr(n5))).join("");
}
var Hs = /\w*$/;
function Ys(t4, n5) {
  var r2 = 30, e4 = "...";
  if (A(n5)) {
    var i3 = "separator" in n5 ? n5.separator : i3;
    r2 = "length" in n5 ? R(n5.length) : r2, e4 = "omission" in n5 ? g(n5.omission) : e4;
  }
  var o6 = (t4 = ur(t4)).length;
  if (Lr(t4)) {
    var u7 = Vr(t4);
    o6 = u7.length;
  }
  if (r2 >= o6)
    return t4;
  var a5 = r2 - xc(e4);
  if (a5 < 1)
    return e4;
  var f3 = u7 ? Br(u7, 0, a5).join("") : t4.slice(0, a5);
  if (void 0 === i3)
    return f3 + e4;
  if (u7 && (a5 += f3.length - a5), rf(i3)) {
    if (t4.slice(a5).search(i3)) {
      var c5, l4 = f3;
      for (i3.global || (i3 = RegExp(i3.source, ur(Hs.exec(i3)) + "g")), i3.lastIndex = 0; c5 = i3.exec(l4); )
        var s2 = c5.index;
      f3 = f3.slice(0, void 0 === s2 ? a5 : s2);
    }
  } else if (t4.indexOf(g(i3), a5) != a5) {
    var p5 = f3.lastIndexOf(i3);
    p5 > -1 && (f3 = f3.slice(0, p5));
  }
  return f3 + e4;
}
function Qs(t4) {
  return Zt(t4, 1);
}
var Xs = Yr({ "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" });
var tp = /&(?:amp|lt|gt|quot|#39);/g;
var np = RegExp(tp.source);
function rp(t4) {
  return (t4 = ur(t4)) && np.test(t4) ? t4.replace(tp, Xs) : t4;
}
var ep = Qe && 1 / Bi(new Qe([, -0]))[1] == 1 / 0 ? function(t4) {
  return new Qe(t4);
} : ct;
function ip(t4, n5, r2) {
  var e4 = -1, i3 = Bt, o6 = t4.length, u7 = true, a5 = [], f3 = a5;
  if (r2)
    u7 = false, i3 = Po;
  else if (o6 >= 200) {
    var c5 = n5 ? null : ep(t4);
    if (c5)
      return Bi(c5);
    u7 = false, i3 = Wi, f3 = new ki();
  } else
    f3 = n5 ? [] : a5;
  t:
    for (; ++e4 < o6; ) {
      var l4 = t4[e4], s2 = n5 ? n5(l4) : l4;
      if (l4 = r2 || 0 !== l4 ? l4 : 0, u7 && s2 == s2) {
        for (var p5 = f3.length; p5--; )
          if (f3[p5] === s2)
            continue t;
        n5 && f3.push(s2), a5.push(l4);
      } else
        i3(f3, s2, r2) || (f3 !== a5 && f3.push(s2), a5.push(l4));
    }
  return a5;
}
var op = nn(function(t4) {
  return ip(dr(t4, 1, Io, true));
});
var up = nn(function(t4) {
  var n5 = Co(t4);
  return Io(n5) && (n5 = void 0), ip(dr(t4, 1, Io, true), Qi(n5));
});
var ap = nn(function(t4) {
  var n5 = Co(t4);
  return n5 = "function" == typeof n5 ? n5 : void 0, ip(dr(t4, 1, Io, true), void 0, n5);
});
function fp(t4) {
  return t4 && t4.length ? ip(t4) : [];
}
function cp(t4, n5) {
  return t4 && t4.length ? ip(t4, Qi(n5)) : [];
}
function lp(t4, n5) {
  return n5 = "function" == typeof n5 ? n5 : void 0, t4 && t4.length ? ip(t4, void 0, n5) : [];
}
var sp = 0;
function pp(t4) {
  var n5 = ++sp;
  return ur(t4) + n5;
}
function vp(t4, n5) {
  return null == t4 || Vf(t4, n5);
}
var hp = Math.max;
function dp(t4) {
  if (!t4 || !t4.length)
    return [];
  var n5 = 0;
  return t4 = Ue(t4, function(t5) {
    if (Io(t5))
      return n5 = hp(t5.length, n5), true;
  }), cn(n5, function(n6) {
    return h(t4, Hi(n6));
  });
}
function yp(t4, n5) {
  if (!t4 || !t4.length)
    return [];
  var r2 = dp(t4);
  return null == n5 ? r2 : h(r2, function(t5) {
    return nt(n5, void 0, t5);
  });
}
function _p(t4, n5, r2, e4) {
  return Jf(t4, n5, r2(cr(t4, n5)), e4);
}
function gp(t4, n5, r2) {
  return null == t4 ? t4 : _p(t4, n5, Go(r2));
}
function bp(t4, n5, r2, e4) {
  return e4 = "function" == typeof e4 ? e4 : void 0, null == t4 ? t4 : _p(t4, n5, Go(r2), e4);
}
var mp = je(function(t4, n5, r2) {
  return t4 + (r2 ? " " : "") + n5.toUpperCase();
});
function jp(t4) {
  return null == t4 ? [] : la(t4, Cn(t4));
}
var wp = nn(function(t4, n5) {
  return Io(t4) ? To(t4, n5) : [];
});
function xp(t4, n5) {
  return zc(Go(n5), t4);
}
var Op = _r(function(t4) {
  var n5 = t4.length, r2 = n5 ? t4[0] : 0, e4 = this.__wrapped__, i3 = function(n6) {
    return sr(n6, t4);
  };
  return !(n5 > 1 || this.__actions__.length) && e4 instanceof ft && Ct(r2) ? ((e4 = e4.slice(r2, +r2 + (n5 ? 1 : 0))).__actions__.push({ func: Bs, args: [i3], thisArg: void 0 }), new ht(e4, this.__chain__).thru(function(t5) {
    return n5 && !t5.length && t5.push(void 0), t5;
  })) : this.thru(i3);
});
function Ap() {
  return ke(this);
}
function Ip() {
  var t4 = this.__wrapped__;
  if (t4 instanceof ft) {
    var n5 = t4;
    return this.__actions__.length && (n5 = new ft(this)), (n5 = n5.reverse()).__actions__.push({ func: Bs, args: [ml], thisArg: void 0 }), new ht(n5, this.__chain__);
  }
  return this.thru(ml);
}
function Ep(t4, n5, r2) {
  var e4 = t4.length;
  if (e4 < 2)
    return e4 ? ip(t4[0]) : [];
  for (var i3 = -1, o6 = Array(e4); ++i3 < e4; )
    for (var u7 = t4[i3], a5 = -1; ++a5 < e4; )
      a5 != i3 && (o6[i3] = To(o6[i3] || u7, t4[a5], n5, r2));
  return ip(dr(o6, 1), n5, r2);
}
var kp = nn(function(t4) {
  return Ep(Ue(t4, Io));
});
var Sp = nn(function(t4) {
  var n5 = Co(t4);
  return Io(n5) && (n5 = void 0), Ep(Ue(t4, Io), Qi(n5));
});
var Wp = nn(function(t4) {
  var n5 = Co(t4);
  return n5 = "function" == typeof n5 ? n5 : void 0, Ep(Ue(t4, Io), void 0, n5);
});
var Mp = nn(dp);
function Rp(t4, n5, r2) {
  for (var e4 = -1, i3 = t4.length, o6 = n5.length, u7 = {}; ++e4 < i3; ) {
    var a5 = e4 < o6 ? n5[e4] : void 0;
    r2(u7, t4[e4], a5);
  }
  return u7;
}
function Bp(t4, n5) {
  return Rp(t4 || [], n5 || [], Yt);
}
function zp(t4, n5) {
  return Rp(t4 || [], n5 || [], Jf);
}
var Lp = nn(function(t4) {
  var n5 = t4.length, r2 = n5 > 1 ? t4[n5 - 1] : void 0;
  return r2 = "function" == typeof r2 ? (t4.pop(), r2) : void 0, yp(t4, r2);
});
var Pp = { chunk: Me, compact: Ii, concat: Ei, difference: Do, differenceBy: No, differenceWith: Uo, drop: qo, dropRight: $o, dropRightWhile: Vo, dropWhile: Zo, fill: yu, findIndex: ju, findLastIndex: Eu, first: Wu, flatten: yr, flattenDeep: Pu, flattenDepth: Tu, fromPairs: Zu, head: Wu, indexOf: da, initial: ya, intersection: ma, intersectionBy: ja, intersectionWith: wa, join: lf, last: Co, lastIndexOf: df, nth: $f, pull: $c, pullAll: qc, pullAllBy: Kc, pullAllWith: Vc, pullAt: Jc, remove: hl, reverse: ml, slice: Ll, sortedIndex: $l, sortedIndexBy: Kl, sortedIndexOf: Vl, sortedLastIndex: Zl, sortedLastIndexBy: Gl, sortedLastIndexOf: Jl, sortedUniq: Yl, sortedUniqBy: Ql, tail: ls, take: ss, takeRight: ps, takeRightWhile: vs, takeWhile: hs, union: op, unionBy: up, unionWith: ap, uniq: fp, uniqBy: cp, uniqWith: lp, unzip: dp, unzipWith: yp, without: wp, xor: kp, xorBy: Sp, xorWith: Wp, zip: Mp, zipObject: Bp, zipObjectDeep: zp, zipWith: Lp };
var Tp = { countBy: po, each: Jo, eachRight: tu, every: hu, filter: gu, find: wu, findLast: ku, flatMap: Bu, flatMapDeep: zu, flatMapDepth: Lu, forEach: Jo, forEachRight: tu, groupBy: Qu, includes: va, invokeMap: Ba, keyBy: pf, map: Ru, orderBy: rc, partition: Pc, reduce: ll, reduceRight: pl, reject: vl, sample: Ol, sampleSize: kl, shuffle: Bl, size: zl, some: Dl, sortBy: Cl };
var Dp = _o;
var Cp = { after: B, ary: Zt, before: kr, bind: Sr, bindKey: Mr, curry: ho, curryRight: yo, debounce: mo, defer: zo, delay: Lo, flip: Du, memoize: rr, negate: Cf, once: Xf, overArgs: ac, partial: zc, partialRight: Lc, rearg: fl, rest: _l, spread: ns, throttle: Rs, unary: Qs, wrap: xp };
var Np = { castArray: xe, clone: ji, cloneDeep: wi, cloneDeepWith: xi, cloneWith: Oi, conformsTo: ro, eq: Jt, gt: na, gte: ra, isArguments: hn, isArray: d, isArrayBuffer: La, isArrayLike: en, isArrayLikeObject: Io, isBoolean: Pa, isBuffer: bn, isDate: Da, isElement: Ca, isEmpty: Ua, isEqual: Fa, isEqualWith: qa, isError: Ir, isFinite: Ka, isFunction: L, isInteger: Va, isLength: rn, isMap: yi, isMatch: Za, isMatchWith: Ga, isNaN: Ha, isNative: Qa, isNil: Xa, isNull: tf, isNumber: Ja, isObject: A, isObjectLike: s, isPlainObject: Ar, isRegExp: rf, isSafeInteger: ef, isSet: gi, isString: ca, isSymbol: p, isTypedArray: En, isUndefined: of, isWeakMap: uf, isWeakSet: af, lt: bf, lte: mf, toArray: Uf, toFinite: M, toInteger: R, toLength: du, toNumber: W, toPlainObject: ko, toSafeInteger: Us, toString: ur };
var Up = { add: m, ceil: Ee, divide: Fo, floor: Cu, max: If, maxBy: Ef, mean: Wf, meanBy: Mf, min: Lf, minBy: Pf, multiply: Df, round: jl, subtract: as, sum: fs, sumBy: cs };
var Fp = Be;
var qp = fa;
var $p = rl;
var Kp = { assign: Pn, assignIn: Nn, assignInWith: Un, assignWith: Fn, at: gr, create: vo, defaults: Oo, defaultsDeep: Ro, entries: eu, entriesIn: iu, extend: Nn, extendWith: Un, findKey: Ou, findLastKey: Su, forIn: qu, forInRight: $u, forOwn: Ku, forOwnRight: Vu, functions: Ju, functionsIn: Hu, get: lr, has: oa, hasIn: Gi, invert: Aa, invertBy: Sa, invoke: Ra, keys: zn, keysIn: Cn, mapKeys: jf, mapValues: wf, merge: Rf, mergeWith: Mo, omit: Gf, omitBy: Qf, pick: Tc, pickBy: Yf, result: gl, set: Sl, setWith: Wl, toPairs: eu, toPairsIn: iu, transform: qs, unset: vp, update: gp, updateWith: bp, values: sa, valuesIn: jp };
var Vp = { at: Op, chain: ke, commit: Ai, lodash: gt, next: Ff, plant: Dc, reverse: Ip, tap: ds, thru: Bs, toIterator: Ps, toJSON: Ds, value: Ds, valueOf: Ds, wrapperChain: Ap };
var Zp = { camelCase: we, capitalize: Jr, deburr: ne, endsWith: nu, escape: fu, escapeRegExp: su, kebabCase: sf, lowerCase: yf, lowerFirst: _f, pad: kc, padEnd: Sc, padStart: Wc, parseInt: Bc, repeat: dl, replace: yl, snakeCase: Pl, split: Xl, startCase: rs, startsWith: es, template: Ms, templateSettings: ws, toLower: Cs, toUpper: Fs, trim: Vs, trimEnd: Zs, trimStart: Js, truncate: Ys, unescape: rp, upperCase: mp, upperFirst: Gr, words: be };
var Gp = { attempt: Er, bindAll: Wr, cond: Xi, conforms: no, constant: It, defaultTo: jo, flow: Uu, flowRight: Fu, identity: z, iteratee: ff, matches: xf, matchesProperty: Of, method: Bf, methodOf: zf, mixin: Tf, noop: ct, nthArg: Kf, over: ic, overEvery: fc, overSome: cc, property: Yi, propertyOf: Cc, range: ul, rangeRight: al, stubArray: Fe, stubFalse: dn, stubObject: is, stubString: os, stubTrue: us, times: Ls, toPath: Ns, uniqueId: pp };
var Jp = Math.max;
var Hp = Math.min;
var Yp = Math.min;
var Qp;
var Xp = Array.prototype;
var tv = Object.prototype.hasOwnProperty;
var nv = e ? e.iterator : void 0;
var rv = Math.max;
var ev = Math.min;
var iv = function(t4) {
  return function(n5, r2, e4) {
    if (null == e4) {
      var i3 = A(r2), o6 = i3 && zn(r2), u7 = o6 && o6.length && Gu(r2, o6);
      (u7 ? u7.length : i3) || (e4 = r2, r2 = n5, n5 = this);
    }
    return t4(n5, r2, e4);
  };
}(Tf);
gt.after = Cp.after, gt.ary = Cp.ary, gt.assign = Kp.assign, gt.assignIn = Kp.assignIn, gt.assignInWith = Kp.assignInWith, gt.assignWith = Kp.assignWith, gt.at = Kp.at, gt.before = Cp.before, gt.bind = Cp.bind, gt.bindAll = Gp.bindAll, gt.bindKey = Cp.bindKey, gt.castArray = Np.castArray, gt.chain = Vp.chain, gt.chunk = Pp.chunk, gt.compact = Pp.compact, gt.concat = Pp.concat, gt.cond = Gp.cond, gt.conforms = Gp.conforms, gt.constant = Gp.constant, gt.countBy = Tp.countBy, gt.create = Kp.create, gt.curry = Cp.curry, gt.curryRight = Cp.curryRight, gt.debounce = Cp.debounce, gt.defaults = Kp.defaults, gt.defaultsDeep = Kp.defaultsDeep, gt.defer = Cp.defer, gt.delay = Cp.delay, gt.difference = Pp.difference, gt.differenceBy = Pp.differenceBy, gt.differenceWith = Pp.differenceWith, gt.drop = Pp.drop, gt.dropRight = Pp.dropRight, gt.dropRightWhile = Pp.dropRightWhile, gt.dropWhile = Pp.dropWhile, gt.fill = Pp.fill, gt.filter = Tp.filter, gt.flatMap = Tp.flatMap, gt.flatMapDeep = Tp.flatMapDeep, gt.flatMapDepth = Tp.flatMapDepth, gt.flatten = Pp.flatten, gt.flattenDeep = Pp.flattenDeep, gt.flattenDepth = Pp.flattenDepth, gt.flip = Cp.flip, gt.flow = Gp.flow, gt.flowRight = Gp.flowRight, gt.fromPairs = Pp.fromPairs, gt.functions = Kp.functions, gt.functionsIn = Kp.functionsIn, gt.groupBy = Tp.groupBy, gt.initial = Pp.initial, gt.intersection = Pp.intersection, gt.intersectionBy = Pp.intersectionBy, gt.intersectionWith = Pp.intersectionWith, gt.invert = Kp.invert, gt.invertBy = Kp.invertBy, gt.invokeMap = Tp.invokeMap, gt.iteratee = Gp.iteratee, gt.keyBy = Tp.keyBy, gt.keys = zn, gt.keysIn = Kp.keysIn, gt.map = Tp.map, gt.mapKeys = Kp.mapKeys, gt.mapValues = Kp.mapValues, gt.matches = Gp.matches, gt.matchesProperty = Gp.matchesProperty, gt.memoize = Cp.memoize, gt.merge = Kp.merge, gt.mergeWith = Kp.mergeWith, gt.method = Gp.method, gt.methodOf = Gp.methodOf, gt.mixin = iv, gt.negate = Cf, gt.nthArg = Gp.nthArg, gt.omit = Kp.omit, gt.omitBy = Kp.omitBy, gt.once = Cp.once, gt.orderBy = Tp.orderBy, gt.over = Gp.over, gt.overArgs = Cp.overArgs, gt.overEvery = Gp.overEvery, gt.overSome = Gp.overSome, gt.partial = Cp.partial, gt.partialRight = Cp.partialRight, gt.partition = Tp.partition, gt.pick = Kp.pick, gt.pickBy = Kp.pickBy, gt.property = Gp.property, gt.propertyOf = Gp.propertyOf, gt.pull = Pp.pull, gt.pullAll = Pp.pullAll, gt.pullAllBy = Pp.pullAllBy, gt.pullAllWith = Pp.pullAllWith, gt.pullAt = Pp.pullAt, gt.range = Gp.range, gt.rangeRight = Gp.rangeRight, gt.rearg = Cp.rearg, gt.reject = Tp.reject, gt.remove = Pp.remove, gt.rest = Cp.rest, gt.reverse = Pp.reverse, gt.sampleSize = Tp.sampleSize, gt.set = Kp.set, gt.setWith = Kp.setWith, gt.shuffle = Tp.shuffle, gt.slice = Pp.slice, gt.sortBy = Tp.sortBy, gt.sortedUniq = Pp.sortedUniq, gt.sortedUniqBy = Pp.sortedUniqBy, gt.split = Zp.split, gt.spread = Cp.spread, gt.tail = Pp.tail, gt.take = Pp.take, gt.takeRight = Pp.takeRight, gt.takeRightWhile = Pp.takeRightWhile, gt.takeWhile = Pp.takeWhile, gt.tap = Vp.tap, gt.throttle = Cp.throttle, gt.thru = Bs, gt.toArray = Np.toArray, gt.toPairs = Kp.toPairs, gt.toPairsIn = Kp.toPairsIn, gt.toPath = Gp.toPath, gt.toPlainObject = Np.toPlainObject, gt.transform = Kp.transform, gt.unary = Cp.unary, gt.union = Pp.union, gt.unionBy = Pp.unionBy, gt.unionWith = Pp.unionWith, gt.uniq = Pp.uniq, gt.uniqBy = Pp.uniqBy, gt.uniqWith = Pp.uniqWith, gt.unset = Kp.unset, gt.unzip = Pp.unzip, gt.unzipWith = Pp.unzipWith, gt.update = Kp.update, gt.updateWith = Kp.updateWith, gt.values = Kp.values, gt.valuesIn = Kp.valuesIn, gt.without = Pp.without, gt.words = Zp.words, gt.wrap = Cp.wrap, gt.xor = Pp.xor, gt.xorBy = Pp.xorBy, gt.xorWith = Pp.xorWith, gt.zip = Pp.zip, gt.zipObject = Pp.zipObject, gt.zipObjectDeep = Pp.zipObjectDeep, gt.zipWith = Pp.zipWith, gt.entries = Kp.toPairs, gt.entriesIn = Kp.toPairsIn, gt.extend = Kp.assignIn, gt.extendWith = Kp.assignInWith, iv(gt, gt), gt.add = Up.add, gt.attempt = Gp.attempt, gt.camelCase = Zp.camelCase, gt.capitalize = Zp.capitalize, gt.ceil = Up.ceil, gt.clamp = Fp, gt.clone = Np.clone, gt.cloneDeep = Np.cloneDeep, gt.cloneDeepWith = Np.cloneDeepWith, gt.cloneWith = Np.cloneWith, gt.conformsTo = Np.conformsTo, gt.deburr = Zp.deburr, gt.defaultTo = Gp.defaultTo, gt.divide = Up.divide, gt.endsWith = Zp.endsWith, gt.eq = Np.eq, gt.escape = Zp.escape, gt.escapeRegExp = Zp.escapeRegExp, gt.every = Tp.every, gt.find = Tp.find, gt.findIndex = Pp.findIndex, gt.findKey = Kp.findKey, gt.findLast = Tp.findLast, gt.findLastIndex = Pp.findLastIndex, gt.findLastKey = Kp.findLastKey, gt.floor = Up.floor, gt.forEach = Tp.forEach, gt.forEachRight = Tp.forEachRight, gt.forIn = Kp.forIn, gt.forInRight = Kp.forInRight, gt.forOwn = Kp.forOwn, gt.forOwnRight = Kp.forOwnRight, gt.get = Kp.get, gt.gt = Np.gt, gt.gte = Np.gte, gt.has = Kp.has, gt.hasIn = Kp.hasIn, gt.head = Pp.head, gt.identity = z, gt.includes = Tp.includes, gt.indexOf = Pp.indexOf, gt.inRange = qp, gt.invoke = Kp.invoke, gt.isArguments = Np.isArguments, gt.isArray = d, gt.isArrayBuffer = Np.isArrayBuffer, gt.isArrayLike = Np.isArrayLike, gt.isArrayLikeObject = Np.isArrayLikeObject, gt.isBoolean = Np.isBoolean, gt.isBuffer = Np.isBuffer, gt.isDate = Np.isDate, gt.isElement = Np.isElement, gt.isEmpty = Np.isEmpty, gt.isEqual = Np.isEqual, gt.isEqualWith = Np.isEqualWith, gt.isError = Np.isError, gt.isFinite = Np.isFinite, gt.isFunction = Np.isFunction, gt.isInteger = Np.isInteger, gt.isLength = Np.isLength, gt.isMap = Np.isMap, gt.isMatch = Np.isMatch, gt.isMatchWith = Np.isMatchWith, gt.isNaN = Np.isNaN, gt.isNative = Np.isNative, gt.isNil = Np.isNil, gt.isNull = Np.isNull, gt.isNumber = Np.isNumber, gt.isObject = A, gt.isObjectLike = Np.isObjectLike, gt.isPlainObject = Np.isPlainObject, gt.isRegExp = Np.isRegExp, gt.isSafeInteger = Np.isSafeInteger, gt.isSet = Np.isSet, gt.isString = Np.isString, gt.isSymbol = Np.isSymbol, gt.isTypedArray = Np.isTypedArray, gt.isUndefined = Np.isUndefined, gt.isWeakMap = Np.isWeakMap, gt.isWeakSet = Np.isWeakSet, gt.join = Pp.join, gt.kebabCase = Zp.kebabCase, gt.last = Co, gt.lastIndexOf = Pp.lastIndexOf, gt.lowerCase = Zp.lowerCase, gt.lowerFirst = Zp.lowerFirst, gt.lt = Np.lt, gt.lte = Np.lte, gt.max = Up.max, gt.maxBy = Up.maxBy, gt.mean = Up.mean, gt.meanBy = Up.meanBy, gt.min = Up.min, gt.minBy = Up.minBy, gt.stubArray = Gp.stubArray, gt.stubFalse = Gp.stubFalse, gt.stubObject = Gp.stubObject, gt.stubString = Gp.stubString, gt.stubTrue = Gp.stubTrue, gt.multiply = Up.multiply, gt.nth = Pp.nth, gt.noop = Gp.noop, gt.now = Dp, gt.pad = Zp.pad, gt.padEnd = Zp.padEnd, gt.padStart = Zp.padStart, gt.parseInt = Zp.parseInt, gt.random = $p, gt.reduce = Tp.reduce, gt.reduceRight = Tp.reduceRight, gt.repeat = Zp.repeat, gt.replace = Zp.replace, gt.result = Kp.result, gt.round = Up.round, gt.sample = Tp.sample, gt.size = Tp.size, gt.snakeCase = Zp.snakeCase, gt.some = Tp.some, gt.sortedIndex = Pp.sortedIndex, gt.sortedIndexBy = Pp.sortedIndexBy, gt.sortedIndexOf = Pp.sortedIndexOf, gt.sortedLastIndex = Pp.sortedLastIndex, gt.sortedLastIndexBy = Pp.sortedLastIndexBy, gt.sortedLastIndexOf = Pp.sortedLastIndexOf, gt.startCase = Zp.startCase, gt.startsWith = Zp.startsWith, gt.subtract = Up.subtract, gt.sum = Up.sum, gt.sumBy = Up.sumBy, gt.template = Zp.template, gt.times = Gp.times, gt.toFinite = Np.toFinite, gt.toInteger = R, gt.toLength = Np.toLength, gt.toLower = Zp.toLower, gt.toNumber = Np.toNumber, gt.toSafeInteger = Np.toSafeInteger, gt.toString = Np.toString, gt.toUpper = Zp.toUpper, gt.trim = Zp.trim, gt.trimEnd = Zp.trimEnd, gt.trimStart = Zp.trimStart, gt.truncate = Zp.truncate, gt.unescape = Zp.unescape, gt.uniqueId = Gp.uniqueId, gt.upperCase = Zp.upperCase, gt.upperFirst = Zp.upperFirst, gt.each = Tp.forEach, gt.eachRight = Tp.forEachRight, gt.first = Pp.head, iv(gt, (Qp = {}, uo(gt, function(t4, n5) {
  tv.call(gt.prototype, n5) || (Qp[n5] = t4);
}), Qp), { chain: false }), gt.VERSION = "4.17.21", (gt.templateSettings = Zp.templateSettings).imports._ = gt, St(["bind", "bindKey", "curry", "curryRight", "partial", "partialRight"], function(t4) {
  gt[t4].placeholder = gt;
}), St(["drop", "take"], function(t4, n5) {
  ft.prototype[t4] = function(r2) {
    r2 = void 0 === r2 ? 1 : rv(R(r2), 0);
    var e4 = this.__filtered__ && !n5 ? new ft(this) : this.clone();
    return e4.__filtered__ ? e4.__takeCount__ = ev(r2, e4.__takeCount__) : e4.__views__.push({ size: ev(r2, 4294967295), type: t4 + (e4.__dir__ < 0 ? "Right" : "") }), e4;
  }, ft.prototype[t4 + "Right"] = function(n6) {
    return this.reverse()[t4](n6).reverse();
  };
}), St(["filter", "map", "takeWhile"], function(t4, n5) {
  var r2 = n5 + 1, e4 = 1 == r2 || 3 == r2;
  ft.prototype[t4] = function(t5) {
    var n6 = this.clone();
    return n6.__iteratees__.push({ iteratee: Qi(t5), type: r2 }), n6.__filtered__ = n6.__filtered__ || e4, n6;
  };
}), St(["head", "last"], function(t4, n5) {
  var r2 = "take" + (n5 ? "Right" : "");
  ft.prototype[t4] = function() {
    return this[r2](1).value()[0];
  };
}), St(["initial", "tail"], function(t4, n5) {
  var r2 = "drop" + (n5 ? "" : "Right");
  ft.prototype[t4] = function() {
    return this.__filtered__ ? new ft(this) : this[r2](1);
  };
}), ft.prototype.compact = function() {
  return this.filter(z);
}, ft.prototype.find = function(t4) {
  return this.filter(t4).head();
}, ft.prototype.findLast = function(t4) {
  return this.reverse().find(t4);
}, ft.prototype.invokeMap = nn(function(t4, n5) {
  return "function" == typeof t4 ? new ft(this) : this.map(function(r2) {
    return Ma(r2, t4, n5);
  });
}), ft.prototype.reject = function(t4) {
  return this.filter(Cf(Qi(t4)));
}, ft.prototype.slice = function(t4, n5) {
  t4 = R(t4);
  var r2 = this;
  return r2.__filtered__ && (t4 > 0 || n5 < 0) ? new ft(r2) : (t4 < 0 ? r2 = r2.takeRight(-t4) : t4 && (r2 = r2.drop(t4)), void 0 !== n5 && (r2 = (n5 = R(n5)) < 0 ? r2.dropRight(-n5) : r2.take(n5 - t4)), r2);
}, ft.prototype.takeRightWhile = function(t4) {
  return this.reverse().takeWhile(t4).reverse();
}, ft.prototype.toArray = function() {
  return this.take(4294967295);
}, uo(ft.prototype, function(t4, n5) {
  var r2 = /^(?:filter|find|map|reject)|While$/.test(n5), e4 = /^(?:head|last)$/.test(n5), i3 = gt[e4 ? "take" + ("last" == n5 ? "Right" : "") : n5], o6 = e4 || /^find/.test(n5);
  i3 && (gt.prototype[n5] = function() {
    var n6 = this.__wrapped__, u7 = e4 ? [1] : arguments, a5 = n6 instanceof ft, f3 = u7[0], c5 = a5 || d(n6), l4 = function(t5) {
      var n7 = i3.apply(gt, pr([t5], u7));
      return e4 && s2 ? n7[0] : n7;
    };
    c5 && r2 && "function" == typeof f3 && 1 != f3.length && (a5 = c5 = false);
    var s2 = this.__chain__, p5 = !!this.__actions__.length, v2 = o6 && !s2, h3 = a5 && !p5;
    if (!o6 && c5) {
      n6 = h3 ? n6 : new ft(this);
      var y2 = t4.apply(n6, u7);
      return y2.__actions__.push({ func: Bs, args: [l4], thisArg: void 0 }), new ht(y2, s2);
    }
    return v2 && h3 ? t4.apply(this, u7) : (y2 = this.thru(l4), v2 ? e4 ? y2.value()[0] : y2.value() : y2);
  });
}), St(["pop", "push", "shift", "sort", "splice", "unshift"], function(t4) {
  var n5 = Xp[t4], r2 = /^(?:push|sort|unshift)$/.test(t4) ? "tap" : "thru", e4 = /^(?:pop|shift)$/.test(t4);
  gt.prototype[t4] = function() {
    var t5 = arguments;
    if (e4 && !this.__chain__) {
      var i3 = this.value();
      return n5.apply(d(i3) ? i3 : [], t5);
    }
    return this[r2](function(r3) {
      return n5.apply(d(r3) ? r3 : [], t5);
    });
  };
}), uo(ft.prototype, function(t4, n5) {
  var r2 = gt[n5];
  if (r2) {
    var e4 = r2.name + "";
    tv.call(st, e4) || (st[e4] = []), st[e4].push({ name: n5, func: r2 });
  }
}), st[qt(void 0, 2).name] = [{ name: "wrapper", func: void 0 }], ft.prototype.clone = function() {
  var t4 = new ft(this.__wrapped__);
  return t4.__actions__ = dt(this.__actions__), t4.__dir__ = this.__dir__, t4.__filtered__ = this.__filtered__, t4.__iteratees__ = dt(this.__iteratees__), t4.__takeCount__ = this.__takeCount__, t4.__views__ = dt(this.__views__), t4;
}, ft.prototype.reverse = function() {
  if (this.__filtered__) {
    var t4 = new ft(this);
    t4.__dir__ = -1, t4.__filtered__ = true;
  } else
    (t4 = this.clone()).__dir__ *= -1;
  return t4;
}, ft.prototype.value = function() {
  var t4 = this.__wrapped__.value(), n5 = this.__dir__, r2 = d(t4), e4 = n5 < 0, i3 = r2 ? t4.length : 0, o6 = function(t5, n6, r3) {
    for (var e5 = -1, i4 = r3.length; ++e5 < i4; ) {
      var o7 = r3[e5], u8 = o7.size;
      switch (o7.type) {
        case "drop":
          t5 += u8;
          break;
        case "dropRight":
          n6 -= u8;
          break;
        case "take":
          n6 = Hp(n6, t5 + u8);
          break;
        case "takeRight":
          t5 = Jp(t5, n6 - u8);
      }
    }
    return { start: t5, end: n6 };
  }(0, i3, this.__views__), u7 = o6.start, a5 = o6.end, f3 = a5 - u7, c5 = e4 ? a5 : u7 - 1, l4 = this.__iteratees__, s2 = l4.length, p5 = 0, v2 = Yp(f3, this.__takeCount__);
  if (!r2 || !e4 && i3 == f3 && v2 == f3)
    return Ts(t4, this.__actions__);
  var h3 = [];
  t:
    for (; f3-- && p5 < v2; ) {
      for (var y2 = -1, _2 = t4[c5 += n5]; ++y2 < s2; ) {
        var g2 = l4[y2], b3 = g2.iteratee, m4 = g2.type, j2 = b3(_2);
        if (2 == m4)
          _2 = j2;
        else if (!j2) {
          if (1 == m4)
            continue t;
          break t;
        }
      }
      h3[p5++] = _2;
    }
  return h3;
}, gt.prototype.at = Vp.at, gt.prototype.chain = Vp.wrapperChain, gt.prototype.commit = Vp.commit, gt.prototype.next = Vp.next, gt.prototype.plant = Vp.plant, gt.prototype.reverse = Vp.reverse, gt.prototype.toJSON = gt.prototype.valueOf = gt.prototype.value = Vp.value, gt.prototype.first = gt.prototype.head, nv && (gt.prototype[nv] = Vp.toIterator);

// src/merch-search.js
var MerchSearch = class extends LitElement {
  static properties = {
    deeplink: { type: String }
  };
  static styles = [
    css2`
            :host {
                display: contents;
            }
        `
  ];
  get search() {
    return this.querySelector(`sp-search`);
  }
  constructor() {
    super();
    this.handleInput = (e4) => pushStateFromComponent(this, e4.target.value);
    this.handleInputDebounced = mo(this.handleInput.bind(this));
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("input", this.handleInputDebounced);
    this.addEventListener("change", this.handleInputDebounced);
    this.updateComplete.then(() => {
      if (!this.search)
        return;
      this.setStateFromURL();
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("input", this.handleInputDebounced);
    this.removeEventListener("change", this.handleInputDebounced);
  }
  /*
   * set the state of the search based on the URL
   */
  setStateFromURL() {
    const state = parseState();
    const value = state[this.deeplink];
    if (value) {
      this.search.value = value;
    }
  }
  render() {
    return html`<slot></slot>`;
  }
};
customElements.define("merch-search", MerchSearch);

// src/sidenav/merch-sidenav-list.js
import { html as html2, LitElement as LitElement2, css as css3 } from "./lit-all.min.js";
var MerchSidenavList = class extends LitElement2 {
  static properties = {
    title: { type: String },
    label: { type: String },
    deeplink: { type: String },
    selectedText: {
      type: String,
      reflect: true,
      attribute: "selected-text"
    },
    selectedValue: {
      type: String,
      reflect: true,
      attribute: "selected-value"
    }
  };
  static styles = [
    css3`
            :host {
                display: block;
                contain: content;
                padding-top: 16px;
            }
            .right {
                position: absolute;
                right: 0;
            }
        `,
    headingStyles
  ];
  constructor() {
    super();
    this.handleClickDebounced = mo(this.handleClick.bind(this));
  }
  selectElement(element) {
    if (element.parentNode.tagName === "SP-SIDENAV-ITEM") {
      element.parentNode.expanded = true;
      element.parentNode.selected = false;
    }
    if (element) {
      element.selected = true;
      element.expanded = true;
    }
    this.selectedElement = element;
    this.selectedText = element.label;
    this.selectedValue = element.value;
  }
  /*
   * set the state of the sidenav based on the URL
   */
  setStateFromURL() {
    const state = parseState();
    const value = state[this.deeplink];
    if (value) {
      const element = this.querySelector(
        `sp-sidenav-item[value=${value}]`
      );
      this.selectElement(element);
    }
  }
  /**
   * click handler to manage first level items state of sidenav
   * @param {*} param
   */
  handleClick({ target: item }) {
    const { value, parentNode } = item;
    this.selectElement(item);
    if (parentNode && parentNode.tagName === "SP-SIDENAV") {
      pushStateFromComponent(this, value);
      item.selected = true;
      parentNode.querySelectorAll(
        "sp-sidenav-item[expanded],sp-sidenav-item[selected]"
      ).forEach((item2) => {
        if (item2.value !== value) {
          item2.expanded = false;
          item2.selected = false;
        }
      });
    }
  }
  /**
   * leaf level item selection handler
   * @param {*} event
   */
  selectionChanged({ target: { value, parentNode } }) {
    this.selectElement(
      this.querySelector(`sp-sidenav-item[value=${value}]`)
    );
    pushStateFromComponent(this, value);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener("click", this.handleClickDebounced);
    this.updateComplete.then(() => {
      this.setStateFromURL();
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener("click", this.handleClickDebounced);
  }
  render() {
    return html2`<div
            aria-label="${this.label}"
            @change="${(e4) => this.selectionChanged(e4)}"
        >
            ${this.title ? html2`<h2>${this.title}</h2>` : ""}
            <slot></slot>
        </div>`;
  }
};
customElements.define("merch-sidenav-list", MerchSidenavList);

// src/sidenav/merch-sidenav-checkbox-group.js
import { html as html3, LitElement as LitElement3, css as css4 } from "./lit-all.min.js";
var MerchSidenavCheckboxGroup = class extends LitElement3 {
  static properties = {
    title: { type: String },
    label: { type: String },
    deeplink: { type: String },
    selectedValues: { type: Array, reflect: true },
    value: { type: String }
  };
  static styles = css4`
        :host {
            display: block;
            contain: content;
            border-top: 1px solid var(--color-gray-200);
            padding: 12px;
        }
        h3 {
            font-size: 14px;
            font-style: normal;
            font-weight: 700;
            height: 32px;
            letter-spacing: 0px;
            padding: 0px;
            line-height: 18.2px;
            color: var(--color-gray-600);
            margin: 0px;
        }
        .checkbox-group {
            display: flex;
            flex-direction: column;
        }
    `;
  /*
   * set the state of the sidenav based on the URL
   */
  setStateFromURL() {
    this.selectedValues = [];
    const { types: state } = parseState();
    if (state) {
      this.selectedValues = state.split(",");
      this.selectedValues.forEach((name) => {
        const element = this.querySelector(`sp-checkbox[name=${name}]`);
        if (element) {
          element.checked = true;
        }
      });
    }
  }
  /**
   * leaf level item change handler
   * @param {*} event
   */
  selectionChanged({ target }) {
    const name = target.getAttribute("name");
    if (name) {
      const index = this.selectedValues.indexOf(name);
      if (target.checked && index === -1) {
        this.selectedValues.push(name);
      } else if (!target.checked && index >= 0) {
        this.selectedValues.splice(index, 1);
      }
    }
    pushStateFromComponent(this, this.selectedValues.join(","));
  }
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(async () => {
      this.setStateFromURL();
    });
  }
  render() {
    return html3`<div aria-label="${this.label}">
            <h3>${this.title}</h3>
            <div
                @change="${(e4) => this.selectionChanged(e4)}"
                class="checkbox-group"
            >
                <slot></slot>
            </div>
        </div>`;
  }
};
customElements.define(
  "merch-sidenav-checkbox-group",
  MerchSidenavCheckboxGroup
);

// src/media.js
var SPECTRUM_MOBILE_LANDSCAPE = "(max-width: 700px)";
var TABLET_DOWN = "(max-width: 1200px)";

// src/sidenav/merch-sidenav.js
var MerchSideNav = class extends LitElement4 {
  static properties = {
    title: { type: String },
    closeText: { type: String, attribute: "close-text" }
  };
  static styles = [
    css5`
            :host {
                display: block;
                max-width: 248px;
            }

            #sidenav {
                width: 100%;
                display: flex;
                flex-direction: column;
                place-items: center;
            }
        `,
    headingStyles
  ];
  mobileDevice = new MatchMediaController(this, SPECTRUM_MOBILE_LANDSCAPE);
  mobileAndTablet = new MatchMediaController(this, TABLET_DOWN);
  get filters() {
    return this.querySelector("merch-sidenav-list");
  }
  render() {
    return this.mobileAndTablet.matches ? this.asDialog : this.asAside;
  }
  get asDialog() {
    return html4`
            <sp-theme theme="spectrum" color="light" scale="medium">
                <sp-dialog-wrapper
                    slot="click-content"
                    dismissable
                    underlay
                    no-divider
                    cancel-label="${this.closeText || "Close"}"
                    mode="${this.mobileDevice.matches ? "fullscreenTakeover" : void 0}"
                >
                    <div id="sidenav">
                        <div>
                            <h2>${this.title}</h2>
                            <slot></slot>
                        </div>
                    </div>
                </sp-dialog-wrapper>
            </sp-theme>
        `;
  }
  get asAside() {
    return html4`<sp-theme theme="spectrum" color="light" scale="medium"
            ><h2>${this.title}</h2>
            <slot></slot
        ></sp-theme>`;
  }
  async showModal({ target }) {
    const content = this.shadowRoot.querySelector("sp-dialog-wrapper");
    const options = {
      trigger: target,
      type: "modal"
    };
    const overlay = await Overlay.open(content, options);
    this.shadowRoot.querySelector("sp-theme").append(overlay);
  }
};
customElements.define("merch-sidenav", MerchSideNav);
export {
  MerchSideNav
};
/*! Bundled license information:

@esm-bundle/lodash/esm/index.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
