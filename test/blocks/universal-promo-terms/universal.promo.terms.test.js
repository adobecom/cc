import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon from 'sinon';

document.body.innerHTML = await readFile({ path: './mocks/body.html' });
const mockData = JSON.parse(await readFile({ path: './mocks/de_DE.json' }));
const { getLibs, locales } = await import('../../../creativecloud/scripts/utils.js');
const { default: init, getLocaleInfo } = await import('../../../creativecloud/blocks/universal-promo-terms/universal-promo-terms.js');

describe('universal-promo-terms', () => {
  const block = document.body.querySelector('.universal-promo-terms');
  let fetchStub;
  let locationHrefDescriptor;

  beforeEach(() => {
    sinon.spy(console, 'log');
    // Stub fetch to return mock data - ensure it matches any URL
    fetchStub = sinon.stub(window, 'fetch').callsFake(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData),
    }));

    // Prevent navigation by overriding window.location.href setter
    try {
      locationHrefDescriptor = Object.getOwnPropertyDescriptor(window.location, 'href');
      if (locationHrefDescriptor && locationHrefDescriptor.configurable) {
        // Override href setter to prevent navigation in tests
        Object.defineProperty(window.location, 'href', {
          set: () => {
            // No-op: prevent navigation in tests
          },
          get: locationHrefDescriptor.get || (() => 'http://localhost:2000/'),
          configurable: true,
        });
      }
    } catch (e) {
      locationHrefDescriptor = null;
    }
  });

  afterEach(() => {
    console.log.restore();
    if (fetchStub) {
      fetchStub.restore();
    }
    // Restore original location.href descriptor if we modified it
    if (locationHrefDescriptor && locationHrefDescriptor.configurable) {
      try {
        Object.defineProperty(window.location, 'href', locationHrefDescriptor);
      } catch (e) {
        // Ignore errors when restoring
      }
    }
  });

  before(async () => {
    const { setConfig } = await import(`${getLibs()}/utils/utils.js`);
    setConfig({ locales });
  });

  it('Get API from query parameters', async () => {
    await init(block, '?offer_id=1B365A793986BBEEE26F3E372BDAAB09&locale=de_DE&promotion_code=fixed_dis_20&country=DE&env=stage');
    expect(document.querySelector('.universal-promo-terms').textContent).to.not.equal('false');
  });
});

describe('getLocaleInfo', () => {
  before(async () => {
    const { setConfig } = await import(`${getLibs()}/utils/utils.js`);
    setConfig({ locales });
  });

  // All locale inputs in lang_COUNTRY format mapped to config.locales IETF values
  // Format: { input: 'lang_COUNTRY', expectedIetf: 'from config.locales', expectedPrefix: 'key/' }
  const localeInputs = [
    // Americas
    { input: 'es_AR', expectedIetf: 'es-AR', expectedPrefix: 'ar/' },
    { input: 'pt_BR', expectedIetf: 'pt-BR', expectedPrefix: 'br/' },
    { input: 'en_CA', expectedIetf: 'en-CA', expectedPrefix: 'ca/' },
    { input: 'fr_CA', expectedIetf: 'fr-CA', expectedPrefix: 'ca_fr/' },
    { input: 'es_CL', expectedIetf: 'es-CL', expectedPrefix: 'cl/' },
    { input: 'es_CO', expectedIetf: 'es-CO', expectedPrefix: 'co/' },
    { input: 'es_LA', expectedIetf: 'es-LA', expectedPrefix: 'la/' },
    { input: 'es_MX', expectedIetf: 'es-MX', expectedPrefix: 'mx/' },
    { input: 'es_PE', expectedIetf: 'es-PE', expectedPrefix: 'pe/' },
    { input: 'en_US', expectedIetf: 'en-US', expectedPrefix: '' },
    { input: 'es_419', expectedIetf: 'es-419', expectedPrefix: 'cr/' }, // cr, ec, pr, gt all map to es-419
    // EMEA
    { input: 'fr_BE', expectedIetf: 'fr-BE', expectedPrefix: 'be_fr/' },
    { input: 'en_BE', expectedIetf: 'en-BE', expectedPrefix: 'be_en/' },
    { input: 'nl_BE', expectedIetf: 'nl-BE', expectedPrefix: 'be_nl/' },
    { input: 'en_CY', expectedIetf: 'en-CY', expectedPrefix: 'cy_en/' },
    { input: 'da_DK', expectedIetf: 'da-DK', expectedPrefix: 'dk/' },
    { input: 'de_DE', expectedIetf: 'de-DE', expectedPrefix: 'de/' },
    { input: 'et_EE', expectedIetf: 'et-EE', expectedPrefix: 'ee/' },
    { input: 'es_ES', expectedIetf: 'es-ES', expectedPrefix: 'es/' },
    { input: 'fr_FR', expectedIetf: 'fr-FR', expectedPrefix: 'fr/' },
    { input: 'en_GR', expectedIetf: 'en-GR', expectedPrefix: 'gr_en/' },
    { input: 'en_GB', expectedIetf: 'en-GB', expectedPrefix: 'ie/' }, // ie, uk, in, my_en, nz, za, ng all map to en-GB
    { input: 'en_IL', expectedIetf: 'en-IL', expectedPrefix: 'il_en/' },
    { input: 'it_IT', expectedIetf: 'it-IT', expectedPrefix: 'it/' },
    { input: 'lv_LV', expectedIetf: 'lv-LV', expectedPrefix: 'lv/' },
    { input: 'lt_LT', expectedIetf: 'lt-LT', expectedPrefix: 'lt/' },
    { input: 'de_LU', expectedIetf: 'de-LU', expectedPrefix: 'lu_de/' },
    { input: 'en_LU', expectedIetf: 'en-LU', expectedPrefix: 'lu_en/' },
    { input: 'fr_LU', expectedIetf: 'fr-LU', expectedPrefix: 'lu_fr/' },
    { input: 'hu_HU', expectedIetf: 'hu-HU', expectedPrefix: 'hu/' },
    { input: 'en_MT', expectedIetf: 'en-MT', expectedPrefix: 'mt/' },
    { input: 'nl_NL', expectedIetf: 'nl-NL', expectedPrefix: 'nl/' },
    { input: 'no_NO', expectedIetf: 'no-NO', expectedPrefix: 'no/' },
    { input: 'pl_PL', expectedIetf: 'pl-PL', expectedPrefix: 'pl/' },
    { input: 'pt_PT', expectedIetf: 'pt-PT', expectedPrefix: 'pt/' },
    { input: 'ro_RO', expectedIetf: 'ro-RO', expectedPrefix: 'ro/' },
    { input: 'de_CH', expectedIetf: 'de-CH', expectedPrefix: 'ch_de/' },
    { input: 'sl_SI', expectedIetf: 'sl-SI', expectedPrefix: 'si/' },
    { input: 'sk_SK', expectedIetf: 'sk-SK', expectedPrefix: 'sk/' },
    { input: 'fr_CH', expectedIetf: 'fr-CH', expectedPrefix: 'ch_fr/' },
    { input: 'fi_FI', expectedIetf: 'fi-FI', expectedPrefix: 'fi/' },
    { input: 'sv_SE', expectedIetf: 'sv-SE', expectedPrefix: 'se/' },
    { input: 'it_CH', expectedIetf: 'it-CH', expectedPrefix: 'ch_it/' },
    { input: 'tr_TR', expectedIetf: 'tr-TR', expectedPrefix: 'tr/' },
    { input: 'de_AT', expectedIetf: 'de-AT', expectedPrefix: 'at/' },
    { input: 'cs_CZ', expectedIetf: 'cs-CZ', expectedPrefix: 'cz/' },
    { input: 'bg_BG', expectedIetf: 'bg-BG', expectedPrefix: 'bg/' },
    { input: 'ru_RU', expectedIetf: 'ru-RU', expectedPrefix: 'ru/' },
    { input: 'uk_UA', expectedIetf: 'uk-UA', expectedPrefix: 'ua/' },
    // RTL locales
    { input: 'he_IL', expectedIetf: 'he', expectedPrefix: 'il_he/' },
    { input: 'ar_AE', expectedIetf: 'ar', expectedPrefix: 'ae_ar/' }, // ae_ar, mena_ar, sa_ar, eg_ar, kw_ar, qa_ar
    // Asia Pacific
    { input: 'en_AU', expectedIetf: 'en-AU', expectedPrefix: 'au/' },
    { input: 'en_HK', expectedIetf: 'en-HK', expectedPrefix: 'hk_en/' },
    { input: 'id_ID', expectedIetf: 'id', expectedPrefix: 'id_id/' },
    { input: 'ms_MY', expectedIetf: 'ms', expectedPrefix: 'my_ms/' },
    { input: 'fil_PH', expectedIetf: 'fil-PH', expectedPrefix: 'ph_fil/' },
    { input: 'en_SG', expectedIetf: 'en-SG', expectedPrefix: 'sg/' },
    { input: 'hi_IN', expectedIetf: 'hi', expectedPrefix: 'in_hi/' },
    { input: 'th_TH', expectedIetf: 'th', expectedPrefix: 'th_th/' },
    { input: 'zh_CN', expectedIetf: 'zh-CN', expectedPrefix: 'cn/' },
    { input: 'zh_HK', expectedIetf: 'zh-HK', expectedPrefix: 'hk_zh/' },
    { input: 'zh_TW', expectedIetf: 'zh-TW', expectedPrefix: 'tw/' },
    { input: 'ja_JP', expectedIetf: 'ja-JP', expectedPrefix: 'jp/' },
    { input: 'ko_KR', expectedIetf: 'ko-KR', expectedPrefix: 'kr/' },
    { input: 'vi_VN', expectedIetf: 'vi', expectedPrefix: 'vn_vi/' },
    // Greek
    { input: 'el_GR', expectedIetf: 'el', expectedPrefix: 'gr_el/' },
  ];

  describe('lang_COUNTRY format lookups', () => {
    localeInputs.forEach(({ input, expectedIetf, expectedPrefix }) => {
      it(`should resolve locale "${input}" to ietf "${expectedIetf}" and prefix "${expectedPrefix}"`, () => {
        const params = new URLSearchParams(`?locale=${input}`);
        const result = getLocaleInfo(params);
        expect(result.ietf).to.equal(expectedIetf);
        expect(result.prefix).to.equal(expectedPrefix);
      });
    });
  });

  describe('Edge cases', () => {
    it('should return default locale when no locale param is provided', () => {
      const params = new URLSearchParams('?offer_id=123');
      const result = getLocaleInfo(params);
      expect(result.ietf).to.be.a('string');
      expect(result.prefix).to.be.a('string');
    });

    it('should fallback for unknown locale', () => {
      const params = new URLSearchParams('?locale=xx_YY');
      const result = getLocaleInfo(params);
      expect(result.ietf).to.equal('xx-YY');
      expect(result.prefix).to.equal('');
    });

    it('should handle empty locale param', () => {
      const params = new URLSearchParams('?locale=');
      const result = getLocaleInfo(params);
      expect(result.ietf).to.be.a('string');
    });
  });
});
