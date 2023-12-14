// Thu, 14 Dec 2023 15:05:37 GMT

// src/sidenav/merch-sidenav.js
import { html as html4, css as css5, LitElement as LitElement4 } from "/libs/deps/lit-all.min.js";

// ../../node_modules/@spectrum-web-components/reactive-controllers/src/MatchMedia.js
var MatchMediaController = class {
  constructor(e, t) {
    this.key = Symbol("match-media-key");
    this.matches = false;
    this.host = e, this.host.addController(this), this.media = window.matchMedia(t), this.matches = this.media.matches, this.onChange = this.onChange.bind(this), e.addController(this);
  }
  hostConnected() {
    var e;
    (e = this.media) == null || e.addEventListener("change", this.onChange);
  }
  hostDisconnected() {
    var e;
    (e = this.media) == null || e.removeEventListener("change", this.onChange);
  }
  onChange(e) {
    this.matches !== e.matches && (this.matches = e.matches, this.host.requestUpdate(this.key, !this.matches));
  }
};

// src/sidenav/merch-sidenav-heading.css.js
import { css } from "/libs/deps/lit-all.min.js";
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
import { html, LitElement, css as css2 } from "/libs/deps/lit-all.min.js";

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

// src/utils.js
function debounce(func, delay) {
  let debounceTimer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

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
    this.handleInput = (e) => pushStateFromComponent(this, e.target.value);
    this.handleInputDebounced = debounce(this.handleInput.bind(this));
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
import { html as html2, LitElement as LitElement2, css as css3 } from "/libs/deps/lit-all.min.js";
var MerchSidenavList = class extends LitElement2 {
  static properties = {
    title: { type: String },
    label: { type: String },
    deeplink: { type: String, attribute: "deeplink" },
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
    this.handleClickDebounced = debounce(this.handleClick.bind(this));
  }
  selectElement(element, selected = true) {
    if (element.parentNode.tagName === "SP-SIDENAV-ITEM") {
      this.selectElement(element.parentNode, false);
    }
    if (element.firstElementChild?.tagName === "SP-SIDENAV-ITEM") {
      element.expanded = true;
    }
    if (selected) {
      this.selectedElement = element;
      this.selectedText = element.label;
      this.selectedValue = element.value;
      setTimeout(() => {
        element.selected = true;
      }, 1);
    }
  }
  /*
   * set the state of the sidenav based on the URL
   */
  setStateFromURL() {
    const state = parseState();
    const value = state[this.deeplink];
    if (value) {
      const element = this.querySelector(`sp-sidenav-item[value="${value}"]`) ?? this.querySelector(`sp-sidenav-item`);
      if (!element)
        return;
      this.updateComplete.then(() => {
        this.selectElement(element);
      });
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
      this.querySelector(`sp-sidenav-item[value="${value}"]`)
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
            @change="${(e) => this.selectionChanged(e)}"
        >
            ${this.title ? html2`<h2>${this.title}</h2>` : ""}
            <slot></slot>
        </div>`;
  }
};
customElements.define("merch-sidenav-list", MerchSidenavList);

// src/sidenav/merch-sidenav-checkbox-group.js
import { html as html3, LitElement as LitElement3, css as css4 } from "/libs/deps/lit-all.min.js";
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
                @change="${(e) => this.selectionChanged(e)}"
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
                min-height: 60vh;
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
    const overlay = await window.__merch__spectrum_Overlay.open(
      content,
      options
    );
    this.shadowRoot.querySelector("sp-theme").append(overlay);
  }
};
customElements.define("merch-sidenav", MerchSideNav);
export {
  MerchSideNav
};
