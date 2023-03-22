/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// export default async function (block, name, document) {
export default async function init(el) {
  const locale = 'en-US';
  const promotionName = el.getAttribute('data-promotion');
  const response = await window.fetch(`${locale === 'en-US' ? '' : `/${locale}`}/promotions/hub/${promotionName}.plain.html`);
  if (!response.ok) {
    // No valid response
    return;
  }
  const promotionContent = await response.text();
  if (!promotionContent.length) {
    // No content in document
    return;
  }

  el.appendChild(document.createRange()
    .createContextualFragment(promotionContent));
}
