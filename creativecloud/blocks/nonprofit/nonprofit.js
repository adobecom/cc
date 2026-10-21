/* eslint-disable no-use-before-define */
/* eslint-disable no-alert */
/* eslint-disable no-plusplus */
/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */
import ReactiveStore from './reactiveStore.js';
import { setLibs, getGeoLocaleInfo, isSignedInInitialized } from '../../scripts/utils.js';
import {
  countries,
  PRODUCT_VALIDATION_CONFIG,
  EDU_VALIDATION_CONFIG,
  SUBSCRIPTIONS_CONFIG,
} from './constants.js';
import { getNonprofitIconTag, NONPRFIT_ICONS } from './icons.js';
import nonprofitSelect from './nonprofit-select.js';

const LANA_OPTIONS = {
  tags: 'nonprofit',
  errorType: 'i',
  severity: 'error',
};

const miloLibs = setLibs('/libs');
const { createTag, getConfig, getMetadata } = await import(`${miloLibs}/utils/utils.js`);

const removeOptionElements = (element) => {
  const children = element.querySelectorAll(':scope > div');
  children.forEach((child) => {
    child.remove();
  });
};

// #region Constants

function getPercentConfig() {
  const { env, stage, prod } = getConfig();
  const isStage = env?.name !== 'prod';
  const { apiUrl, publishableKey } = isStage && hasRenewalUrlParam()
    ? stage.nonprofit
    : prod.nonprofit;
  return { url: apiUrl, key: publishableKey };
}

// Goodstack validation invites require the production API/key regardless of environment. (the sandbox key is rejected with a 403).
function getProdNonprofitConfig() {
  const { prod } = getConfig();
  return { url: prod.nonprofit.apiUrl, key: prod.nonprofit.publishableKey };
}
export const SCENARIOS = Object.freeze({
  FOUND_IN_SEARCH: 'FOUND_IN_SEARCH',
  NOT_FOUND_IN_SEARCH: 'NOT_FOUND_IN_SEARCH',
});
const SEARCH_DEBOUNCE = 500; // ms
const FETCH_ON_SCROLL_OFFSET = 100; // px
// #endregion

const nonprofitFormData = JSON.parse('{}');

// #region Stores
export const stepperStore = new ReactiveStore({
  step: 1,
  scenario: SCENARIOS.FOUND_IN_SEARCH,
  pending: false,
});

export const organizationsStore = new ReactiveStore([]);

export const registriesStore = new ReactiveStore([]);

const selectedOrganizationStore = new ReactiveStore();
// #endregion

// #region Percent API integration

// #region Helpers

function getPercentErrorString(result) {
  return `${result.error.title}: ${result.error.message}${result.error.reasons ? ` (${result.error.reasons.join(', ')})` : ''}`;
}

async function validatePercentResponse(response) {
  const result = await response.json();

  if (!response.ok) {
    throw new Error(getPercentErrorString(result));
  }

  return result;
}

// #endregion

let nextOrganizationsPageUrl;

async function fetchOrganizations(search, countryCode, abortController) {
  try {
    organizationsStore.startLoading(true);
    const { url, key } = getPercentConfig();
    const response = await fetch(
      `${url}/organisations?countryCode=${countryCode}&query=${search}`,
      {
        cache: 'force-cache',
        signal: abortController.signal,
        headers: { Authorization: key },
      },
    );

    const result = await validatePercentResponse(response);

    if (!result._links) {
      nextOrganizationsPageUrl = null;
      window.lana?.log('No next organization page link provided.', LANA_OPTIONS);
    } else nextOrganizationsPageUrl = result._links.next || null;
    organizationsStore.update(result.data);
  } catch (error) {
    organizationsStore.update((prev) => prev);
    window.lana?.log(`Could not fetch organizations: ${error}`, LANA_OPTIONS);
  }
}

async function fetchNextOrganizations(abortController) {
  if (!nextOrganizationsPageUrl) return;
  try {
    organizationsStore.startLoading();
    const { key } = getPercentConfig();
    const response = await fetch(nextOrganizationsPageUrl, {
      cache: 'force-cache',
      signal: abortController.signal,
      headers: { Authorization: key },
    });

    const result = await validatePercentResponse(response);

    nextOrganizationsPageUrl = result._links.next;
    organizationsStore.update((prev) => [...prev, ...result.data]);
  } catch (error) {
    organizationsStore.update((prev) => prev);
    window.lana?.log(`Could not fetch next organizations: ${error}`, LANA_OPTIONS);
  }
}

async function fetchRegistries(countryCode, abortController) {
  try {
    registriesStore.startLoading(true);
    const { url, key } = getPercentConfig();
    const response = await fetch(`${url}/registries?countryCode=${countryCode}`, {
      cache: 'force-cache',
      signal: abortController.signal,
      headers: { Authorization: key },
    });

    const result = await validatePercentResponse(response);

    registriesStore.update(result.data);
  } catch (error) {
    registriesStore.update((prev) => prev);
    window.lana?.log(`Could not fetch registries: ${error}`, LANA_OPTIONS);
  }
}

async function createValidationInvite(product, ietf) {
  const { url: apiUrl, key: publishableKey } = getProdNonprofitConfig();
  const { VALIDATION_URL, CONFIGURATION_ID } = PRODUCT_VALIDATION_CONFIG[product];
  const inviteResponse = await fetch(`${VALIDATION_URL}?lng=${ietf}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${publishableKey}` },
    body: JSON.stringify({ configurationId: CONFIGURATION_ID }),
  });

  const inviteResult = await validatePercentResponse(inviteResponse);

  return { apiUrl, publishableKey, validationInviteId: inviteResult.data.validationInviteId };
}

async function uploadEvidenceDocument(apiUrl, publishableKey, validationInviteId) {
  const evidenceUploadData = new FormData();
  evidenceUploadData.append('file', nonprofitFormData.evidenceNonProfitStatus);
  evidenceUploadData.append('validationInviteId', validationInviteId);

  const uploadResponse = await fetch(`${apiUrl}/validation-submission-documents`, {
    method: 'POST',
    headers: { Authorization: publishableKey },
    body: evidenceUploadData,
  });

  await validatePercentResponse(uploadResponse);
}

async function sendOrganizationData(product) {
  try {
    const { ietf } = await getGeoLocaleInfo();
    const { apiUrl, publishableKey, validationInviteId } = await createValidationInvite(product, ietf);

    const foundInSearch = stepperStore.data.scenario === SCENARIOS.FOUND_IN_SEARCH;

    if (!foundInSearch) {
      await uploadEvidenceDocument(apiUrl, publishableKey, validationInviteId);
    }

    let body;
    if (foundInSearch) {
      body = JSON.stringify({
        validationInviteId,
        organisationId: nonprofitFormData.organizationId,
        firstName: nonprofitFormData.firstName,
        lastName: nonprofitFormData.lastName,
        email: nonprofitFormData.email,
        language: ietf,
      });
    } else {
      body = JSON.stringify({
        validationInviteId,
        countryCode: nonprofitFormData.countryCode,
        organisationName: nonprofitFormData.organizationName,
        registryId: nonprofitFormData.organizationRegistrationId,
        registryName: nonprofitFormData.registryName,
        website: nonprofitFormData.website,
        addressLine1: nonprofitFormData.streetAddress,
        addressLine2: nonprofitFormData.addressDetails,
        city: nonprofitFormData.city,
        postal: nonprofitFormData.zipCode,
        state: nonprofitFormData.state,
        firstName: nonprofitFormData.firstName,
        lastName: nonprofitFormData.lastName,
        email: nonprofitFormData.email,
        language: ietf,
      });
    }

    const submissionResponse = await fetch(`${apiUrl}/validation-submissions`, {
      method: 'POST',
      body,
      headers: {
        Authorization: publishableKey,
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    await validatePercentResponse(submissionResponse);

    return true;
  } catch (error) {
    window.lana?.log(`Could not send organization data: ${error}`, LANA_OPTIONS);
    return false;
  }
}

// #endregion

// UI

function getStepBackTag() {
  const buttonTag = createTag('div', { class: 'np-stepper-back', tabindex: 0 });
  const backIconTag = getNonprofitIconTag(NONPRFIT_ICONS.BACK);
  buttonTag.append(backIconTag);

  stepperStore.subscribe(({ step, scenario, pending }) => {
    if (pending) buttonTag.classList.add('disabled');
    else buttonTag.classList.remove('disabled');
    if (step === 1 || (step === 3 && scenario === SCENARIOS.FOUND_IN_SEARCH) || step === 5) {
      buttonTag.style.display = 'none';
      return;
    }
    buttonTag.style.display = 'flex';
  });

  buttonTag.addEventListener('click', () => {
    if (stepperStore.data.pending) return;
    stepperStore.update((prev) => ({ ...prev, step: prev.step - 1 }));
  });

  buttonTag.addEventListener('keydown', (ev) => {
    if (stepperStore.data.pending) return;
    if (ev.code !== 'Enter') return;
    ev.preventDefault();
    buttonTag.click();
  });

  return buttonTag;
}

function renderStepper(containerTag) {
  const stepperContainerTag = createTag('div', { class: 'np-stepper-container' });
  const getStepTag = (number) => {
    const stepContainerTag = createTag('div', { class: 'np-step-container', 'data-step': number });
    const stepIconTag = createTag('span', { class: 'np-step-icon' }, number);
    const stepNameTag = createTag(
      'span',
      { class: 'np-step-name' },
      window.mph[`nonprofit-step-${number}`],
    );
    stepContainerTag.append(stepIconTag, stepNameTag);
    return stepContainerTag;
  };

  const step1 = getStepTag(1);
  const step2 = getStepTag(2);
  const step3 = getStepTag(3);

  stepperStore.subscribe(({ step, scenario }) => {
    // Reset steps
    step1.classList.remove('is-cleared', 'is-active');
    step2.classList.remove('is-cleared', 'is-active');
    step3.classList.remove('is-cleared', 'is-active');

    if (step === 1) {
      step1.classList.add('is-active');
      step2.setAttribute('aria-disabled', true);
      step3.setAttribute('aria-disabled', true);
    }
    if (step === 2) {
      step1.classList.add('is-cleared');
      step2.classList.add('is-active');
      step2.removeAttribute('aria-disabled');
    }
    if (step === 3) {
      if (scenario === SCENARIOS.FOUND_IN_SEARCH) {
        step1.classList.add('is-cleared');
        step2.classList.add('is-cleared');
        step3.classList.add('is-active');
        step3.removeAttribute('aria-disabled');
      } else {
        step1.classList.add('is-cleared');
        step2.classList.add('is-active');
      }
    }
    if (step === 4) {
      step1.classList.add('is-cleared');
      step2.classList.add('is-active');
      step2.removeAttribute('aria-disabled');
    }
    if (step === 5) {
      step1.classList.add('is-cleared');
      step2.classList.add('is-cleared');
      step3.classList.add('is-active');
      step3.removeAttribute('aria-disabled');
    }
  });

  const separatorIconTag = getNonprofitIconTag(NONPRFIT_ICONS.CHEVRON_RIGHT);
  separatorIconTag.classList.add('np-step-separator');

  stepperContainerTag.append(
    step1,
    separatorIconTag.cloneNode(true),
    step2,
    separatorIconTag.cloneNode(true),
    step3,
  );

  const stepBackTag = getStepBackTag();

  containerTag.append(stepperContainerTag, stepBackTag);
}

// #region Render form

function replaceURL(tagObject) {
  const { locale } = getConfig();
  const privacyURL = window.mph['nonprofit-privacy-policy-url'] || `https://www.adobe.com${locale.prefix}/privacy/policy.html`;
  const termsURL = window.mph['nonprofit-terms-of-use-url'] || `https://www.adobe.com${locale.prefix}/legal/terms.html`;
  tagObject.innerHTML = tagObject.innerHTML.replace(window.mph['nonprofit-terms-of-use'], `<a class="nonprofit-url" href="${termsURL}">${window.mph['nonprofit-terms-of-use']}</a>`);
  tagObject.innerHTML = tagObject.innerHTML.replace(window.mph['nonprofit-privacy-policy'], `<a class="nonprofit-url" href="${privacyURL}">${window.mph['nonprofit-privacy-policy']}</a>`);
  tagObject.innerHTML = tagObject.innerHTML.replace(window.mph['nonprofit-partner-name'], `<a class="nonprofit-url" target="_blank" href="${window.mph['nonprofit-partner-url']}">${window.mph['nonprofit-partner-name']}</a>`);
}

function getDescriptionTag(title, subtitle) {
  const descriptionTag = createTag('div', { class: 'np-description' });
  const titleTag = createTag('h1', { class: 'np-title' }, title);

  descriptionTag.append(titleTag);

  if (subtitle) {
    const subtitleTag = createTag('span', { class: 'np-subtitle' }, subtitle);
    replaceURL(subtitleTag);
    descriptionTag.append(subtitleTag);
  }

  return descriptionTag;
}

function getSubmitTag() {
  return createTag('input', {
    class: 'np-button',
    type: 'submit',
    value: window.mph['nonprofit-continue'],
    disabled: 'disabled',
    'daa-ll': 'continue',
  });
}

function getNonprofitInput(params) {
  const {
    type, name, label, placeholder, required, value,
  } = params;
  const fieldId = `np-field-${name}`;
  const baseParams = { name, placeholder };
  if (required) baseParams.required = 'required';
  if (value) baseParams.value = value;
  const controlTag = createTag('div', { class: 'np-control' });
  const labelTag = createTag('label', { class: 'np-label', for: fieldId }, label);
  const inputTag = createTag('input', {
    class: `np-input${required ? ' np-required-field' : ''}`,
    type,
    'aria-label': `${label},`,
    ...(type === 'file' ? {} : { id: fieldId }),
    ...baseParams,
  });
  controlTag.append(labelTag, inputTag);

  // File validation
  if (type === 'file') {
    // Hide input and render a text one
    inputTag.style.display = 'none';
    const textTag = createTag('input', {
      type: 'text',
      class: 'np-input np-input-file',
      placeholder,
      readonly: 'readonly',
      id: fieldId,
      'aria-label': `${label},`,
      'data-for': name,
    });

    textTag.addEventListener('click', () => {
      inputTag.click();
    });

    textTag.addEventListener('keypress', (ev) => {
      if (ev.code !== 'Enter') return;
      ev.preventDefault();
      inputTag.click();
    });

    // Validation
    inputTag.addEventListener('change', () => {
      if (!inputTag.files || inputTag.files.length === 0) {
        textTag.value = '';
        return;
      }

      const file = inputTag.files[0];

      // Percent only accepts jpg, png and pdf files
      const extensionRegex = /(\.jpg|\.jpeg|\.png|\.pdf)$/i;
      if (!extensionRegex.exec(file.name)) {
        inputTag.value = '';
        inputTag.dispatchEvent(new Event('input'));
        alert(window.mph['nonprofit-invalid-file-type']);
        return;
      }

      // Percent acceps files up to 5 mb
      const size = file.size / 1024 ** 2;
      if (size > 5) {
        inputTag.value = '';
        inputTag.dispatchEvent(new Event('input'));
        alert(window.mph['nonprofit-file-size-exceeded']);
        return;
      }

      textTag.value = file.name;
    });

    const uploadIconTag = getNonprofitIconTag(NONPRFIT_ICONS.UPLOAD);

    controlTag.append(textTag, uploadIconTag);
  }

  return controlTag;
}

function getSelectedOrganizationTag() {
  const containerTag = createTag('div', { class: 'np-selected-organization-container' });

  const headerTag = createTag('div', { class: 'np-selected-organization-header' });

  const avatarTag = createTag('div', { class: 'np-selected-organization-avatar' });

  const initialsTag = createTag('span', { class: 'np-selected-organization-initials' });
  const showInitials = () => {
    avatarTag.classList.add('fallback');
    const initialWords = selectedOrganizationStore.data.name
      .split(' ')
      .filter((word) => Boolean(word))
      .slice(0, 2);
    const initials = initialWords.map((word) => word.substring(0, 1).toUpperCase()).join('');
    initialsTag.textContent = initials;
  };

  const logoTag = createTag('img', { class: 'np-selected-organization-logo' });
  logoTag.addEventListener('error', () => {
    avatarTag.classList.remove('loading');
    showInitials();
  });
  logoTag.addEventListener('load', () => {
    avatarTag.classList.remove('loading');
  });

  avatarTag.append(initialsTag, logoTag);

  const nameTag = createTag('span', { class: 'np-selected-organization-detail' });
  headerTag.append(avatarTag, nameTag);

  const separatorTag = createTag('div', { class: 'np-selected-organization-separator' });

  const addressTag = createTag('span', { class: 'np-selected-organization-detail' });
  const idTag = createTag('span', { class: 'np-selected-organization-detail' });

  const clearTag = createTag('div', { class: 'np-selected-organization-clear', tabindex: 0 });
  const clearIconTag = getNonprofitIconTag(NONPRFIT_ICONS.CLOSE);
  clearTag.append(clearIconTag);

  clearTag.addEventListener('keydown', (ev) => {
    if (ev.code !== 'Enter') return;
    clearTag.click();
  });

  containerTag.append(headerTag, separatorTag, addressTag, idTag, clearTag);

  selectedOrganizationStore.subscribe((organization) => {
    if (!organization) {
      containerTag.style.display = 'none';
      return;
    }

    // Load avatar
    if (organization.logo) {
      avatarTag.classList.add('loading');
      avatarTag.classList.remove('fallback');
      logoTag.src = organization.logo;
    } else {
      showInitials();
    }

    nameTag.textContent = organization.name;

    addressTag.textContent = organization.address || '-';
    addressTag.setAttribute('title', organization.address);
    idTag.textContent = organization.registryId;
    idTag.setAttribute('title', organization.registryId);

    containerTag.style.display = 'flex';
  }, false);

  containerTag.onClear = (handler) => {
    clearTag.addEventListener('click', handler);
  };

  return containerTag;
}

function trackSubmitCondition(formTag) {
  const requiredInputs = formTag.querySelectorAll('.np-required-field');
  const submitTag = formTag.querySelector('.np-button[type=submit]');

  for (let index = 0; index < requiredInputs.length; index++) {
    const requiredInput = requiredInputs[index];
    requiredInput.addEventListener('input', () => {
      if (!requiredInput.value) {
        submitTag.setAttribute('disabled', 'disabled');
      } else {
        let hasEmptyFields = false;
        requiredInputs.forEach((input) => {
          if (input === requiredInput) return;
          if (!input.value) hasEmptyFields = true;
        });
        if (hasEmptyFields) {
          submitTag.setAttribute('disabled', 'disabled');
        } else {
          submitTag.removeAttribute('disabled');
        }
      }
    });
  }
}

// Select non-profit
function renderSelectNonprofit(containerTag) {
  containerTag.setAttribute('daa-lh', 'find your nonprofit');

  // Description
  const descriptionTag = getDescriptionTag(
    window.mph['nonprofit-title-select-non-profit'],
    window.mph['nonprofit-subtitle-select-non-profit'],
  );

  // Form
  const formTag = createTag('form', { class: 'np-form' });

  const countryTag = nonprofitSelect({
    createTag,
    name: 'country',
    label: window.mph['nonprofit-country'],
    placeholder: window.mph['nonprofit-country-placeholder'],
    options: countries,
    labelKey: 'name',
    valueKey: 'code',
  });

  // #region Organization select
  const organizationTag = nonprofitSelect({
    createTag,
    name: 'organizationId',
    label: window.mph['nonprofit-organization-name-or-id'],
    placeholder: window.mph['nonprofit-organization-name-or-id-search-placeholder'],
    noOptionsText: window.mph['nonprofit-not-found-in-database'],
    debounce: SEARCH_DEBOUNCE,
    store: organizationsStore,
    disabled: true,
    hideIcon: true,
    clearable: true,
    labelKey: 'name',
    valueKey: 'id',
    renderOption: (option, itemTag) => {
      const nameTag = createTag(
        'span',
        { class: 'np-organization-select-name', title: option.name },
        option.name,
      );
      const idTag = createTag(
        'span',
        { class: 'np-organization-select-id', title: option.registryId },
        option.registryId,
      );

      itemTag.append(nameTag, idTag);
    },
    footerTag: (() => {
      const cannotFindTag = createTag('div', { class: 'np-select-list-tag np-organization-cannot-find' });
      const cannotFindLinkTag = createTag(
        'a',
        { tabindex: 0, 'daa-ll': 'org not found' },
        window.mph['nonprofit-organization-cannot-find'],
      );
      // Cannot find action handler
      const switchToNotFound = () => {
        stepperStore.update((prev) => ({
          ...prev,
          step: 2,
          scenario: SCENARIOS.NOT_FOUND_IN_SEARCH,
        }));
      };
      cannotFindLinkTag.addEventListener('click', switchToNotFound);
      cannotFindLinkTag.addEventListener('keydown', (ev) => {
        if (ev.code !== 'Enter') return;
        switchToNotFound();
      });

      cannotFindTag.append(cannotFindLinkTag);

      return cannotFindTag;
    })(),
  });

  organizationTag.onInput((value, abortController) => {
    if (!value) return;
    fetchOrganizations(value, countryTag.getValue(), abortController);
  });

  organizationTag.onSelect((option) => {
    selectedOrganizationStore.update(option);
  });

  organizationTag.onScroll((listTag, abortController, hasNewInput) => {
    if (
      (Boolean(selectedOrganizationStore.data) && !hasNewInput)
      || organizationsStore.loading
      || !nextOrganizationsPageUrl
    ) return;
    if (listTag.scrollTop + listTag.clientHeight + FETCH_ON_SCROLL_OFFSET >= listTag.scrollHeight) {
      fetchNextOrganizations(abortController);
    }
  });

  countryTag.onSelect((option) => {
    if (hasRenewalUrlParam()) nonprofitFormData.countryAlpha2 = option.alpha2;
    organizationTag.enable();
    organizationTag.clear();
    if (selectedOrganizationStore.data) {
      selectedOrganizationStore.update(null);
    }
  });

  // #endregion

  const selectedOrganizationTag = getSelectedOrganizationTag();

  selectedOrganizationTag.onClear(() => {
    organizationTag.clear();
    selectedOrganizationStore.update(null);
  });

  const submitTag = getSubmitTag();

  formTag.append(countryTag, organizationTag, selectedOrganizationTag, submitTag);

  trackSubmitCondition(formTag);

  formTag.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const formData = new FormData(formTag);
    nonprofitFormData.countryCode = formData.get('country');
    nonprofitFormData.organizationId = formData.get('organizationId');

    stepperStore.update((prev) => ({ ...prev, scenario: SCENARIOS.FOUND_IN_SEARCH, step: 2 }));
  });

  containerTag.replaceChildren(descriptionTag, formTag);
}

// Organization details
function renderOrganizationDetails(containerTag) {
  containerTag.setAttribute('daa-lh', 'confirm org details');

  // Description
  const descriptionTag = getDescriptionTag(window.mph['nonprofit-title-organization-details']);

  // Form
  const formTag = createTag('form', { class: 'np-form' });

  let abortController;

  const countryTag = nonprofitSelect({
    createTag,
    name: 'country',
    label: window.mph['nonprofit-country'],
    placeholder: window.mph['nonprofit-country-placeholder'],
    options: countries,
    labelKey: 'name',
    valueKey: 'code',
  });

  countryTag.onSelect((option) => {
    if (hasRenewalUrlParam()) nonprofitFormData.countryAlpha2 = option.alpha2;
    abortController?.abort();
    abortController = new AbortController();
    fetchRegistries(option.code, abortController);
  });

  const organizationNameTag = getNonprofitInput({
    type: 'text',
    name: 'organizationName',
    label: window.mph['nonprofit-organization-name'],
    placeholder: window.mph['nonprofit-organization-name-placeholder'],
    required: true,
  });

  const registryTag = nonprofitSelect({
    createTag,
    name: 'registry',
    label: window.mph['nonprofit-registry'],
    placeholder: window.mph['nonprofit-registry-placeholder'],
    labelKey: 'name',
    valueKey: 'name',
    disabled: true,
  });

  registriesStore.subscribe((registries, loading) => {
    if (!countryTag.getValue()) return;
    if (loading) {
      registryTag.clear(false);
      return;
    }
    registryTag.enable();
    registryTag.updateOptions(registries);
  });

  const organizationRegistrationIdTag = getNonprofitInput({
    type: 'text',
    name: 'organizationRegistrationId',
    label: window.mph['nonprofit-organization-registration-id'],
    placeholder: window.mph['nonprofit-organization-registration-id-placeholder'],
    required: true,
  });

  const evidenceNonProfitStatusTag = getNonprofitInput({
    type: 'file',
    name: 'evidenceNonProfitStatus',
    label: window.mph['nonprofit-evidence-non-profit-status'],
    placeholder: window.mph['nonprofit-evidence-non-profit-status-placeholder'],
    required: true,
  });

  const websiteTag = getNonprofitInput({
    type: 'text',
    name: 'website',
    label: window.mph['nonprofit-website'],
    placeholder: window.mph['nonprofit-website-placeholder'],
    required: true,
  });

  const submitTag = getSubmitTag();

  formTag.append(
    countryTag,
    organizationNameTag,
    registryTag,
    organizationRegistrationIdTag,
    evidenceNonProfitStatusTag,
    websiteTag,
    submitTag,
  );

  trackSubmitCondition(formTag);

  formTag.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const formData = new FormData(formTag);
    nonprofitFormData.countryCode = formData.get('country');
    nonprofitFormData.organizationName = formData.get('organizationName');
    nonprofitFormData.registryName = formData.get('registry');
    nonprofitFormData.organizationRegistrationId = formData.get('organizationRegistrationId');
    nonprofitFormData.evidenceNonProfitStatus = formData.get('evidenceNonProfitStatus');
    nonprofitFormData.website = formData.get('website');

    stepperStore.update((prev) => ({ ...prev, scenario: SCENARIOS.NOT_FOUND_IN_SEARCH, step: 3 }));
  });

  containerTag.replaceChildren(descriptionTag, formTag);
}

// Organization address
function renderOrganizationAddress(containerTag) {
  containerTag.setAttribute('daa-lh', 'confirm org address');

  // Description
  const descriptionTag = getDescriptionTag(window.mph['nonprofit-title-organization-address']);

  // Form
  const formTag = createTag('form', { class: 'np-form' });

  const streetAddressTag = getNonprofitInput({
    type: 'text',
    name: 'streetAddress',
    label: window.mph['nonprofit-street-address'],
    placeholder: window.mph['nonprofit-street-address-placeholder'],
    required: true,
  });

  const addressDetailsTag = getNonprofitInput({
    type: 'text',
    name: 'addressDetails',
    label: window.mph['nonprofit-address-details'],
    placeholder: window.mph['nonprofit-address-details-placeholder'],
  });

  const stateTag = getNonprofitInput({
    type: 'text',
    name: 'state',
    label: window.mph['nonprofit-state'],
    placeholder: window.mph['nonprofit-state-placeholder'],
  });

  const cityTag = getNonprofitInput({
    type: 'text',
    name: 'city',
    label: window.mph['nonprofit-city'],
    placeholder: window.mph['nonprofit-city-placeholder'],
    required: true,
  });

  const zipCodeTag = getNonprofitInput({
    type: 'text',
    name: 'zipCode',
    label: window.mph['nonprofit-zip-code'],
    placeholder: window.mph['nonprofit-zip-code-placeholder'],
    required: true,
  });

  const submitTag = getSubmitTag();

  formTag.append(streetAddressTag, addressDetailsTag, stateTag, cityTag, zipCodeTag, submitTag);

  trackSubmitCondition(formTag);

  formTag.addEventListener('submit', (ev) => {
    ev.preventDefault();

    const formData = new FormData(formTag);
    nonprofitFormData.streetAddress = formData.get('streetAddress');
    nonprofitFormData.addressDetails = formData.get('addressDetails');
    nonprofitFormData.state = formData.get('state');
    nonprofitFormData.city = formData.get('city');
    nonprofitFormData.zipCode = formData.get('zipCode');

    stepperStore.update((prev) => ({ ...prev, scenario: SCENARIOS.NOT_FOUND_IN_SEARCH, step: 4 }));
  });

  containerTag.replaceChildren(descriptionTag, formTag);
}

// Personal data
function renderPersonalData(containerTag, product) {
  containerTag.setAttribute('daa-lh', 'confirm your details');

  // Description
  const descriptionTag = getDescriptionTag(
    window.mph['nonprofit-title-personal-details'],
    hasRenewalUrlParam() ? null : window.mph['nonprofit-subtitle-personal-details'],
  );

  // Form
  const formTag = createTag('form', { class: 'np-form' });

  const firstNameTag = getNonprofitInput({
    type: 'text',
    name: 'firstName',
    label: window.mph['nonprofit-first-name'],
    placeholder: window.mph['nonprofit-first-name-placeholder'],
    required: true,
    value: nonprofitFormData.firstName,
  });

  const lastNameTag = getNonprofitInput({
    type: 'text',
    name: 'lastName',
    label: window.mph['nonprofit-last-name'],
    placeholder: window.mph['nonprofit-last-name-placeholder'],
    required: true,
    value: nonprofitFormData.lastName,
  });

  const emailTag = getNonprofitInput({
    type: 'email',
    name: 'email',
    label: window.mph['nonprofit-email'],
    placeholder: window.mph['nonprofit-email-placeholder'],
    required: true,
    value: nonprofitFormData.email,
  });

  const disclaimerTag = createTag(
    'span',
    { class: 'np-personal-data-disclaimer' },
    window.mph['nonprofit-personal-data-disclaimer'],
  );
  const emailInput = emailTag.querySelector('input');
  if (hasRenewalUrlParam() && nonprofitFormData.email) {
    emailInput.setAttribute('readonly', 'readonly');
    emailInput.classList.add('np-input-readonly');
  }
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = () => {
    const isValid = emailInput.validity.valid && emailPattern.test(emailInput.value);
    emailInput.classList.toggle('np-error', !isValid);
    return isValid;
  };

  emailInput.addEventListener('input', validateEmail);
  emailInput.addEventListener('blur', validateEmail);

  replaceURL(disclaimerTag);
  const submitTag = getSubmitTag();

  const updateSubmitState = () => {
    const isFormValid = formTag.checkValidity() && validateEmail();
    submitTag.toggleAttribute('disabled', !isFormValid);
  };
  formTag.addEventListener('input', updateSubmitState);

  formTag.append(firstNameTag, lastNameTag, emailTag, disclaimerTag, submitTag);

  formTag.append(firstNameTag, lastNameTag, emailTag, submitTag);
  trackSubmitCondition(formTag);
  if (nonprofitFormData.email) updateSubmitState();

  formTag.addEventListener('submit', async (ev) => {
    ev.preventDefault();

    const formData = new FormData(formTag);
    nonprofitFormData.firstName = formData.get('firstName');
    nonprofitFormData.lastName = formData.get('lastName');
    nonprofitFormData.email = formData.get('email');

    const inputs = formTag.querySelectorAll('input');
    inputs.forEach((input) => {
      input.setAttribute('disabled', 'disabled');
    });

    stepperStore.update((prev) => ({ ...prev, pending: true }));

    const ok = hasRenewalUrlParam()
      ? await submitRenewalValidation(product)
      : await sendOrganizationData(product);

    if (!ok) {
      inputs.forEach((input) => {
        input.removeAttribute('disabled');
      });

      stepperStore.update((prev) => ({ ...prev, pending: false }));
    } else {
      stepperStore.update((prev) => ({ ...prev, step: prev.step + 1 }));
    }
  });

  containerTag.replaceChildren(descriptionTag, formTag);
}

function renderApplicationReview(containerTag, copy) {
  containerTag.setAttribute('daa-lh', 'verification');

  const applicationReviewTag = createTag('div', { class: 'np-application-review-container' });

  const { title, details } = copy || {
    title: window.mph['nonprofit-title-application-review'],
    details: [
      window.mph['nonprofit-detail-1-application-review'],
      window.mph['nonprofit-detail-2-application-review'],
      window.mph['nonprofit-detail-3-application-review'],
    ],
  };

  const titleTag = createTag('h1', { class: 'np-title' }, title);
  const detailTags = details.filter(Boolean).map((text) => {
    const detailTag = createTag(
      'span',
      { class: 'np-application-review-detail' },
      text.replace('__EMAIL__', nonprofitFormData.email),
    );
    replaceURL(detailTag);
    return detailTag;
  });
  applicationReviewTag.append(titleTag, ...detailTags);

  containerTag.replaceChildren(applicationReviewTag, getReturnToNonprofitsButton());
}

function getRenewalStatusCopy(status) {
  const statusKey = status?.toLowerCase();
  return {
    title: window.mph?.[`nonprofit-renewal-status-${statusKey}-title`],
    details: [
      window.mph?.[`nonprofit-renewal-status-${statusKey}-detail-1`],
      window.mph?.[`nonprofit-renewal-status-${statusKey}-detail-2`],
      window.mph?.[`nonprofit-renewal-status-${statusKey}-detail-3`],
    ],
  };
}

function getReturnToNonprofitsButton() {
  return createTag(
    'a',
    {
      class: 'np-button',
      href: 'https://www.adobe.com/nonprofits.html',
      'daa-ll': 'return to acrobat for nonprofits',
    },
    window.mph?.['nonprofit-return-to-acrobat-for-nonprofits'],
  );
}

function renderVerification(containerTag) {
  const status = renewalValidation?.status?.toUpperCase?.();
  if (hasRenewalUrlParam() && TERMINAL_STATUSES.has(status)) {
    renderApplicationReview(containerTag, getRenewalStatusCopy(status));
  } else {
    renderApplicationReview(containerTag);
  }
}

function renderStepContent(containerTag, product) {
  const contentContainerTag = createTag('div', { class: 'np-content-container' });

  let currentStep;
  let currentScenario;
  stepperStore.subscribe(({ step, scenario }) => {
    if (step === currentStep && scenario === currentScenario) return;
    currentStep = step;
    currentScenario = scenario;

    if (step === 1) renderSelectNonprofit(contentContainerTag);
    if (step === 2 && scenario === SCENARIOS.FOUND_IN_SEARCH) renderPersonalData(contentContainerTag, product);
    if (step === 2 && scenario === SCENARIOS.NOT_FOUND_IN_SEARCH) renderOrganizationDetails(contentContainerTag);
    if (step === 3 && scenario === SCENARIOS.FOUND_IN_SEARCH) renderVerification(contentContainerTag);
    if (step === 3 && scenario === SCENARIOS.NOT_FOUND_IN_SEARCH) renderOrganizationAddress(contentContainerTag);
    if (step === 4 && scenario === SCENARIOS.NOT_FOUND_IN_SEARCH) renderPersonalData(contentContainerTag, product);
    if (step === 5 && scenario === SCENARIOS.NOT_FOUND_IN_SEARCH) renderVerification(contentContainerTag);
  });

  containerTag.append(contentContainerTag);
}
// #endregion

let renewalProfile = null;

let renewalValidation = null;

const TERMINAL_STATUSES = new Set(['APPROVED', 'PENDING']);

function hasRenewalUrlParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('workflow') === 'renewal';
}

function formatPersonId(profile) {
  const userId = profile?.userId || profile?.sub;
  return userId ? `${String(userId).split('@')[0]}@AdobeID` : null;
}

async function getEduValidationRequest() {
  const { env } = getConfig();
  const config = env?.name === 'prod' ? EDU_VALIDATION_CONFIG.prod : EDU_VALIDATION_CONFIG.stage;
  const apiKey = getMetadata('edu-validation-api-key') || window.adobeid?.client_id;
  const token = await window.adobeIMS.getAccessToken();
  return {
    baseUrl: config.baseUrl,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token?.token || token}`,
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    environment: env?.name,
    token: token?.token || token,
  };
}

function renderRenewalErrorScreen(element) {
  const containerTag = createTag('div', { class: 'np-container np-renewal-error' });
  const errorTag = createTag('div', { class: 'np-application-review-container' });
  const titleTag = createTag(
    'h1',
    { class: 'np-title' },
    window.mph?.['nonprofit-renewal-error-title'] || 'Unable to load your renewal status',
  );
  const detailTag = createTag(
    'span',
    { class: 'np-application-review-detail' },
    window.mph?.['nonprofit-renewal-error-detail'] || 'Please refresh the page and try again.',
  );
  errorTag.append(titleTag, detailTag);
  containerTag.append(errorTag);
  element.append(containerTag);
}

async function getAnniversaryDate(personId, environment, token) {
  try {
    const { baseUrl } = SUBSCRIPTIONS_CONFIG[environment];

    const apiKey = window.adobeid?.client_id;

    const response = await fetch(
      `${baseUrl}/users/${personId}/subscriptions`,
      {
        headers: {
          'Accept-Language': 'en-US',
          'X-API-Key': apiKey,
          Authorization: `Bearer ${token?.token || token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Subscriptions GET failed with status ${response.status}`,
      );
    }

    const data = await response.json();

    const nonprofitSubscription = data?.find(
      (subscription) => subscription?.offer?.price_point === 'NON_PROFIT',
    );

    return nonprofitSubscription?.contract?.anniversary_date?.match(/\d{4}-\d{2}-\d{2}/)?.[0];
  } catch (error) {
    window.lana?.log(
      `Subscriptions GET failed: ${error}`,
      LANA_OPTIONS,
    );

    return undefined;
  }
}

async function initRenewalValidation() {
  const personId = formatPersonId(renewalProfile);
  if (!personId) return { type: 'error' };

  try {
    const { baseUrl, headers, environment, token } = await getEduValidationRequest();
    const urlParams = new URLSearchParams(window.location.search);
    const renewalDate = (urlParams.get('renewalDate') || urlParams.get('renewal-date') || urlParams.get('effectiveDate') || urlParams.get('effective-date') || '').match(/\d{4}-\d{2}-\d{2}/)?.[0];
    let effectiveDate = renewalDate;
    if (!effectiveDate) {
      effectiveDate = await getAnniversaryDate((renewalProfile?.userId || renewalProfile?.authId), environment, token);
    }

    const query = {
      'person-id': personId,
      'verification-segment': 'NONPROFIT',
      ...(effectiveDate && { 'effective-date': effectiveDate }),
      ...(renewalProfile?.countryCode && { country: renewalProfile.countryCode }),
    };

    const response = await fetch(`${baseUrl}?${new URLSearchParams(query)}`, { headers });
    if (!response.ok) throw new Error(`Edu validation GET failed with status ${response.status}`);

    renewalValidation = await response.json();
    const status = renewalValidation.status?.toUpperCase?.();
    return { type: TERMINAL_STATUSES.has(status) ? 'status' : 'form', status, validation: renewalValidation };
  } catch (error) {
    window.lana?.log(`Renewal validation GET failed: ${error}`, LANA_OPTIONS);
    return { type: 'error', error };
  }
}

async function submitRenewalValidation(product) {
  const personId = formatPersonId(renewalProfile);
  if (!personId) return false;

  try {
    const { ietf } = await getGeoLocaleInfo();
    const { baseUrl, headers } = await getEduValidationRequest();
    const language = String(ietf).split('-')[0] || 'en';

    const foundInSearch = stepperStore.data.scenario === SCENARIOS.FOUND_IN_SEARCH;

    let evidenceUploadPromise = Promise.resolve();
    if (!foundInSearch) {
      evidenceUploadPromise = createValidationInvite(product, ietf)
        .then(({ apiUrl, publishableKey, validationInviteId }) => uploadEvidenceDocument(apiUrl, publishableKey, validationInviteId))
        .catch((error) => {
          window.lana?.log(`Renewal evidence document upload failed: ${error}`, LANA_OPTIONS);
        });
    }

    const payload = {
      'verification-segment': 'NONPROFIT',
      'person-id': personId,
      'email-id': nonprofitFormData.email,
      'first-name': nonprofitFormData.firstName,
      'last-name': nonprofitFormData.lastName,
      country: nonprofitFormData.countryAlpha2,
      'nonprofit-details': { language },
    };

    if (foundInSearch) {
      payload['organization-id'] = nonprofitFormData.organizationId;
    } else {
      payload['organization-name'] = nonprofitFormData.organizationName;
      payload['nonprofit-details'] = {
        language,
        'registry-id': nonprofitFormData.organizationRegistrationId,
        'registry-name': nonprofitFormData.registryName,
        website: nonprofitFormData.website,
      };
    }

    const response = await fetch(baseUrl, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`Edu validation POST failed with status ${response.status}`);

    renewalValidation = await response.json();

    await evidenceUploadPromise;

    return true;
  } catch (error) {
    window.lana?.log(`Renewal validation POST failed: ${error}`, LANA_OPTIONS);
    return false;
  }
}

function prefillRenewalForm(validation) {
  nonprofitFormData.firstName = renewalProfile?.first_name || '';
  nonprofitFormData.lastName = renewalProfile?.last_name || '';
  nonprofitFormData.email = validation?.['email-id'] || renewalProfile?.email || '';
}

function getProductFromClassList(element) {
  const classes = [...element.classList];
  if (classes.length === 1) return 'acrobat';
  const nonprofitIndex = classes.indexOf('nonprofit');
  const product = nonprofitIndex !== -1 ? classes[nonprofitIndex + 1] : undefined;
  if (!product) throw new Error('Product not found');
  return product;
}

function initNonprofit(element) {
  const containerTag = createTag('div', { class: 'np-container' });
  const product = getProductFromClassList(element);
  renderStepper(containerTag);
  renderStepContent(containerTag, product);
  element.append(containerTag);
}

export default function init(element) {
  removeOptionElements(element);

  if (hasRenewalUrlParam()) {
    isSignedInInitialized().then(async () => {
      if (!window.adobeIMS.isSignedInUser()) {
        return window.adobeIMS.signIn({ redirect_uri: window.location.href });
      }
      renewalProfile = await window.adobeIMS.getProfile();
      const result = await initRenewalValidation();
      if (result.type === 'status') {
        prefillRenewalForm(result.validation);
        stepperStore.update((prev) => ({ ...prev, step: 3, scenario: SCENARIOS.FOUND_IN_SEARCH }));
      } else if (result.type === 'form') {
        prefillRenewalForm(result.validation);
      } else if (result.type === 'error') {
        return renderRenewalErrorScreen(element);
      }
      return initNonprofit(element);
    });
    return;
  }

  initNonprofit(element);
}
