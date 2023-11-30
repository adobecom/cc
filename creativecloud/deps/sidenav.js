// Fri, 24 Nov 2023 15:57:08 GMT

// src/filter-sidenav.js
import { html, css, LitElement } from "./lit-all.min.js";

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

// src/filter-sidenav.js
var FilterSideNav = class extends LitElement {
  static properties = {
    title: { type: String },
    label: { type: String }
  };
  static styles = css`
        :host {
            display: block;
            contain: content;
        }
        h2 {
            font-size: 11px;
            font-style: normal;
            font-weight: 500;
            height: 32px;
            letter-spacing: 0.06em;
            padding: 0 12px;
            line-height: 32px;
            color: var(--color-gray-600);
        }
    `;
  /*
   * set the state of the sidenav based on the URL
   */
  setStateFromPageLoad() {
    const { filter: value } = parseState();
    if (value) {
      const element = this.shadowRoot.querySelector(
        `sp-sidenav-item[value=${value}]`
      );
      if (element) {
        element.click();
      }
    }
  }
  pushNavState(value) {
    if (value) {
      pushState({ filter: value });
    }
  }
  /**
   * click handler to manage first level items state of sidenav
   * @param {*} param
   */
  handleClick({ target: item }) {
    const { value, parentNode } = item;
    if (parentNode && parentNode.tagName === "SP-SIDENAV") {
      this.pushNavState(value);
      item.setAttribute("selected", "");
      parentNode.querySelectorAll(
        "sp-sidenav-item[expanded],sp-sidenav-item[selected]"
      ).forEach((item2) => {
        if (item2.value !== value) {
          item2.removeAttribute("expanded");
          item2.removeAttribute("selected");
        }
      });
    }
  }
  /**
   * leaf level item selection handler
   * @param {*} event
   */
  selectionChanged({ target: { value } }) {
    this.pushNavState(value);
  }
  /**
   * dub sidenav tree inside shadow dom's sp-sidenav element
   */
  dubSideNavTree() {
    const sidenav = this.shadowRoot.querySelector("sp-sidenav");
    this.querySelectorAll(":scope > sp-sidenav-item").forEach((item) => {
      item.addEventListener("click", this.handleClick.bind(this));
      sidenav.appendChild(item);
    });
  }
  connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(async () => {
      this.dubSideNavTree();
      this.setStateFromPageLoad();
    });
  }
  render() {
    return html`<div aria-label="${this.label}" data-daa-lh="${this.label}">
            <h2>${this.title}</h2>
            <sp-theme theme="spectrum" color="light" scale="medium">
                <sp-sidenav
                    variant="multilevel"
                    manageTabIndex="true"
                    @change="${this.selectionChanged}"
                    label="${this.label}"
                >
                </sp-sidenav>
            </sp-theme>
        </div>`;
  }
};
customElements.define("filter-sidenav", FilterSideNav);
export {
  FilterSideNav
};
