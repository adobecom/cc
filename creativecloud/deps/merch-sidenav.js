// Mon, 27 Nov 2023 17:34:21 GMT

// src/sidenav/merch-sidenav.js
import { html as html4, css as css5, LitElement as LitElement4 } from "./lit-all.min.js";

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

// src/merch-search.js
var MerchSearch = class extends LitElement {
  static properties = {
    deeplink: { type: String }
  };
  static styles = [
    css2`
            :host {
                display: block;
                contain: content;
            }
        `
  ];
  getSearchComponent() {
    return this.querySelector(`sp-search`);
  }
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.setState();
      this.getSearchComponent().addEventListener("change", (e) => {
        pushStateFromComponent(this, e.target.value);
      });
    });
  }
  /*
   * set the state of the search based on the URL
   */
  setState() {
    const state = parseState();
    const value = state[this.deeplink];
    if (value) {
      this.getSearchComponent().value = value;
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
    selectedText: { type: String, reflect: true },
    selectedValue: { type: String, reflect: true }
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
  selectElement(element) {
    if (element.parentNode.tagName === "SP-SIDENAV-ITEM") {
      element.parentNode.expanded = true;
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
  setState() {
    const state = parseState();
    const value = state[this.deeplink];
    if (value) {
      const element = this.shadowRoot.querySelector(
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
      this.shadowRoot.querySelector(`sp-sidenav-item[value=${value}]`)
    );
    pushStateFromComponent(this, value);
  }
  /**
   * dub sidenav tree inside shadow dom's sp-sidenav element
   */
  dubSideNavTree() {
    const sidenav = this.shadowRoot.querySelector("sp-sidenav");
    this.querySelectorAll(":scope > sp-sidenav-item").forEach((item) => {
      if (!item.hasAttribute("href")) {
        item.addEventListener("click", this.handleClick.bind(this));
      }
      sidenav.appendChild(item);
    });
  }
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => {
      this.dubSideNavTree();
      this.setState();
    });
  }
  render() {
    return html2`<div aria-label="${this.label}">
            ${this.title ? html2`<h2>${this.title}</h2>` : ""}
            <sp-sidenav
                variant="multilevel"
                manageTabIndex="true"
                @change="${this.selectionChanged}"
                label="${this.label}"
            >
            </sp-sidenav>
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
  setState() {
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
      this.setState();
    });
  }
  render() {
    return html3`<div aria-label="${this.label}">
            <h3>${this.title}</h3>
            <div @change="${this.selectionChanged}" class="checkbox-group">
                <slot></slot>
            </div>
        </div>`;
  }
};
customElements.define(
  "merch-sidenav-checkbox-group",
  MerchSidenavCheckboxGroup
);

// src/sidenav/merch-sidenav.js
var MerchSideNav = class extends LitElement4 {
  static properties = {
    title: { type: String }
  };
  static styles = [
    css5`
            :host {
                display: block;
                contain: content;
                max-width: 248px;
            }
        `,
    headingStyles
  ];
  render() {
    return html4`<sp-theme theme="spectrum" color="light" scale="medium">
            <h2>${this.title}</h2>
            <slot></slot>
        </sp-theme>`;
  }
};
customElements.define("merch-sidenav", MerchSideNav);
export {
  MerchSideNav
};
