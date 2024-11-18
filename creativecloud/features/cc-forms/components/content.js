import { createTag } from '../../../scripts/utils.js';

const CLASS_HIDDEN = 'is-hidden';

class TextContent {
    constructor(formEl, config) {
        this.form = formEl;
        this.fieldConfig = config;
        this.init();
    }

    init() {
      const d = createTag('div', { class: 'form-item' }, this.fieldConfig.value);
      this.form.append(d);
      return;
    }
}

export default TextContent;
