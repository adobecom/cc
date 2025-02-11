import sinon from 'sinon';
import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { setLibs, getLibs, createTag } from '../../../../creativecloud/scripts/utils.js';
import DemandBase from '../../../../creativecloud/features/cc-forms/forms/demandbase.js';

const miloLibs = '/libs';
setLibs(miloLibs);
const { setConfig } = await import(`${getLibs()}/utils/utils.js`);
const CONFIG = {
  stage: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  live: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  prod: { odinEndpoint: 'https://odin.adobe.com/' },
};
setConfig(CONFIG);

const { default: init } = await import('../../../../creativecloud/blocks/cc-forms/cc-forms.js');
function delay(ms) {
  return new Promise((res) => { setTimeout(() => { res(); }, ms); });
}

document.body.innerHTML = await readFile({ path: '../../../features/cc-forms/forms/mocks/demandbase-body.html' });
describe('Demand base integration', async () => {
  let form;
  let db;

  before(async () => {
    const el = document.querySelector('.cc-forms');
    await init(el);
    form = document.querySelector('.cc-forms form');
    const osField = form.querySelector('#orgsize');
    const opts = [
      { value: '1-499', text: '1-499' },
      { value: '500-999', text: '500-999' },
      { value: '1000+', text: '1000+' },
    ];
    opts.forEach((opt) => {
      const op = document.createElement('option');
      op.value = opt.value;
      op.textContent = opt.text;
      op.setAttribute('data-value', opt.value);
      op.setAttribute('data-istop', 'undefined');
      op.setAttribute('role', 'option');
      op.setAttribute('sku', 'undefined');
      osField.appendChild(op);
    });
    const dbConf = {
      endpoint: 'https://autocomplete.demandbase.com/forms/autocomplete',
      apiKey: 'DcJ5JpU7attMHR6KoFgKA1oWr7djrtGidd4pC7dD',
      delay: 400,
      parentNode: form,
      fieldMapping: {
        orgname: 'company_name',
        postalcode: 'zip',
        'custom.questions_comments': 'company_name, phone, industry, sub_industry, annual_sales, fortune_1000, forbes_2000, web_site',
        orgsize: 'employee_range',
        industry: 'industry',
        state: 'state',
        country: 'country_name',
      },
      industryMapping: {
        TRANSPORTATION_WAREHOUSING: 'Transportation & Logistics',
        TECHNOLOGY_SOFTWARE_SERVICES: 'Software & Technology',
        EDUCATION_HIGHER_ED: 'Education',
      },
      payloadMappings: { 'custom.questions_comments': 'company_name, phone, industry, sub_industry, annual_sales, fortune_1000, forbes_2000, web_site' },
    };
    db = new DemandBase(dbConf);
  });

  it('should call demandbase constructor', () => {
    expect(db).to.exist;
  });

  it('should return if dbConf is not an object', () => {
    const dbConf2 = 123;
    const db2 = new DemandBase(dbConf2);
    expect(db2).to.be.empty;
  });

  it('should handle different key events properly', async () => {
    const handleEnterKeySpy = sinon.spy(db, 'handleEnterKey');
    const handleUpArrowSpy = sinon.spy(db, 'handleUpArrow');
    const handleDownArrowSpy = sinon.spy(db, 'handleDownArrow');
    const escSpy = sinon.spy(db, 'clearSuggestionList');
    const fetchDBSpy = sinon.stub(window, 'fetch');
    const mockDBJson = {
      error: null,
      ip: null,
      picks: [
        {
          account_ownership: 'Public',
          annual_sales: 19202700000,
          business_structure: 'Global Parent',
          city: 'Roseland',
          company_id: 724570,
          company_linkedin_profile: 'https://www.linkedin.com/company/adpbrazillabs',
          company_name: 'Automatic Data Processing Inc',
          company_status: 'Operating',
          company_type: 'Public',
          country: 'US',
          primary_naics: '513210',
          primary_sic: '7371',
          revenue_range: 'Enterprise',
          state: 'NJ',
          street_address: 'One Adp Boulvard',
          sub_industry: 'Human Resources Software',
          web_site: 'adp.com',
          zip: '07068-1728',
        },
        {
          account_ownership: 'Public',
          annual_sales: 20429000000,
          business_structure: 'Global Parent',
          city: 'San Jose',
          company_id: 724292,
          company_linkedin_profile: 'https://www.linkedin.com/company/adobe',
          company_name: 'Adobe Inc',
          company_status: 'Operating',
          employee_range: 'Enterprise',
          industry: 'Computer Software',
          marketing_alias: 'Adobe Inc',
          phone: '+1 408 536 6000',
          primary_naics: '513210',
          primary_sic: '7371',
          revenue_range: 'Enterprise',
          state: 'CA',
          street_address: '345 Park Ave',
          sub_industry: 'Multimedia and Graphics Software',
          web_site: 'adobe.com',
          zip: '95110-2704',
        },
        {
          account_ownership: 'Private',
          annual_sales: 14000900000,
          business_structure: 'Global Parent',
          city: 'Altamonte Springs',
          company_id: 19433,
          company_linkedin_profile: 'https://www.linkedin.com/company/adventist-health-system',
          company_name: 'AdventHealth',
          company_status: 'Operating',
          company_type: 'Private',
          country: 'US',
          country_name: 'United States',
          custom_fields: { marketing_alias: 'AdventHealth' },
          industry: 'Hospitals and Healthcare',
          marketing_alias: 'AdventHealth',
          phone: '+1 407 357 1000',
          primary_naics: '622',
          primary_sic: '8099',
          revenue_range: 'Enterprise',
          state: 'FL',
          street_address: '900 Hope Way',
          sub_industry: 'Integrated Healthcare Networks',
          web_site: 'adventhealth.com',
          zip: '32714',
        },
        {
          account_ownership: 'Private',
          annual_sales: 4946150000,
          business_structure: 'Subsidiary',
          city: 'Jacksonville',
          company_id: 101950,
          company_linkedin_profile: 'https://www.linkedin.com/company/adecco-staffing-usa',
          company_name: 'Adecco USA, Inc.',
          company_status: 'Operating',
          company_type: 'Private',
          country: 'US',
          country_name: 'United States',
          custom_fields: { marketing_alias: 'Adecco' },
          industry: 'Corporate Services',
          marketing_alias: 'Adecco',
          parent: {
            account_ownership: 'Public',
            annual_sales: 25797010000,
            business_structure: 'Global Parent',
            city: 'Zuerich',
            popularity: 17208,
            primary_naics: '541612',
            primary_sic: '7361',
            revenue_range: 'Enterprise',
            street_address: 'Bellerivestrasse 30',
            sub_industry: 'Human Resources and Staffing',
            web_site: 'adeccogroup.com',
            zip: '8008',
          },
          parent_id: 810610,
          parent_name: 'Adecco Group AG',
          phone: '+1 904 232 4520',
          primary_naics: '541612',
          primary_sic: '7361',
          revenue_range: 'Enterprise',
          state: 'FL',
          street_address: '10151 Deerwood Park Blvd Bldg 200 Ste 400',
          sub_industry: 'Human Resources and Staffing',
          ultimate_parent: {
            account_ownership: 'Public',
            annual_sales: 25797010000,
            business_structure: 'Global Parent',
            city: 'Zuerich',
            company_id: 810610,
            company_linkedin_profile: 'https://www.linkedin.com/company/theadeccogroup',
            company_name: 'Adecco Group AG',
            company_status: 'Operating',
            company_type: 'Public',
            country: 'CH',
            country_name: 'Switzerland',
            revenue_range: 'Enterprise',
            street_address: 'Bellerivestrasse 30',
            sub_industry: 'Human Resources and Staffing',
            web_site: 'adeccogroup.com',
            zip: '8008',
          },
          ultimate_parent_id: 810610,
          ultimate_parent_name: 'Adecco Group AG',
          web_site: 'adeccousa.com',
          zip: '32256',
        },
        {
          account_ownership: 'Private',
          business_structure: 'Subsidiary',
          city: 'Portland',
          company_id: 439590,
          company_linkedin_profile: 'https://www.linkedin.com/company/adidas-america',
          company_name: 'Adidas America, Inc.',
          company_status: 'Operating',
          company_type: 'Private',
          country: 'US',
          country_name: 'United States',
          industry: 'Consumer Product Manufacturing',
          marketing_alias: 'Adidas America',
          parent: {
            business_structure: 'Subsidiary',
            city: 'Portland',
            company_id: 1003836,
            company_linkedin_profile: 'https://www.linkedin.com/company/adidas-salomon-north-america',
            company_name: 'Adidas North America, Inc.',
            company_status: 'Operating',
            company_type: 'Private',
            country: 'US',
            country_name: 'United States',
            sub_industry: 'Footwear',
            ultimate_parent_id: 861207,
            ultimate_parent_name: 'adidas AG',
            web_site: 'adidas.com',
            zip: '97217',
          },
          parent_id: 1003836,
          revenue_range: 'Unknown',
          state: 'OR',
          street_address: '5055 North Greeley Avenue Adidas Village',
          sub_industry: 'Footwear',
          ultimate_parent: {
            account_ownership: 'Public',
            annual_sales: 24095730000,
            business_structure: 'Global Parent',
            city: 'Herzogenaurach',
            country_name: 'Germany',
            employee_count: 58564,
            employee_range: 'Enterprise',
            industry: 'Consumer Product Manufacturing',
            street_address: 'Adi-Dassler-Strasse 1',
            sub_industry: 'Sporting Goods, Outdoor Gear and Apparel',
            web_site: 'adidas-group.com',
            zip: '91074',
          },
          ultimate_parent_id: 861207,
          ultimate_parent_name: 'adidas AG',
          web_site: 'global.adidas.com',
          zip: '97217-3524',
        },
        {
          account_ownership: 'Public',
          annual_sales: 949970000,
          street_address: '901 Explorer Boulevard, P.O. Box 140000,',
          sub_industry: 'Wireless Networking Equipment',
          web_site: 'adtran.com',
          zip: '35806',
        },
        {
          account_ownership: 'Public',
          annual_sales: 1584650000,
          business_structure: 'Global Parent',
          city: 'Chicago',
          company_id: 727907,
          company_linkedin_profile: 'https://www.linkedin.com/company/devry-education-group',
          company_name: 'Adtalem Global Education Inc',
          company_status: 'Operating',
          company_type: 'Public',
          country: 'US',
          country_name: 'United States',
          custom_fields: { marketing_alias: 'Adtalem Global Education' },
          street_address: '500 W Monroe St Fl 28',
          sub_industry: 'Educational Services',
          web_site: 'adtalem.com',
          zip: '60661-3773',
        },
        {
          account_ownership: 'Public',
          annual_sales: 24095730000,
          business_structure: 'Global Parent',
          city: 'Herzogenaurach',
          company_id: 861207,

          state: 'Bavaria',
          street_address: 'Adi-Dassler-Strasse 1',
          sub_industry: 'Sporting Goods, Outdoor Gear and Apparel',
          web_site: 'adidas-group.com',
          zip: '91074',
        },
        {
          account_ownership: 'Organization',
          annual_sales: 4114520000,
          company_type: 'Organization',
          country: 'US',
          state: 'CA',
          street_address: 'ONE Adventist Health Way',
          sub_industry: 'Integrated Healthcare Networks',
          web_site: 'adventisthealth.org',
          zip: '95661',
        },
        {
          account_ownership: 'Private',
          annual_sales: 2700590000,
          business_structure: 'Subsidiary',
          fortune_1000: false,
          industry: 'Hospitals and Healthcare',
          marketing_alias: 'AdventHealth Orlando',
          parent: {
            account_ownership: 'Private',
            annual_sales: 14000900000,
            business_structure: 'Global Parent',
            industry: 'Hospitals and Healthcare',
            marketing_alias: 'AdventHealth',
            phone: '+1 407 357 1000',
            zip: '32714',
          },
          parent_id: 19433,
          primary_sic: '8099',
          revenue_range: 'Enterprise',
          state: 'FL',
          street_address: '601 East Rollins Street',
          sub_industry: 'Integrated Healthcare Networks',
          ultimate_parent: {
            account_ownership: 'Private',
            annual_sales: 14000900000,
            country: 'US',
            country_name: 'United States',
            efx_id: '95691891',
            primary_sic: '8099',
            revenue_range: 'Enterprise',
            state: 'FL',
            street_address: '900 Hope Way',
            sub_industry: 'Integrated Healthcare Networks',
            web_site: 'adventhealth.com',
            zip: '32714',
          },
          ultimate_parent_id: 19433,
          ultimate_parent_name: 'AdventHealth',
          web_site: 'floridahospital.com',
          zip: '32803',
        },
      ],
      runtime: 30.38393,
      sequence: 1,
      status: 'ok',
    };
    fetchDBSpy.resolves({
      ok: true,
      json: async () => mockDBJson,
    });
    const orgField = form.querySelector('#orgname');
    orgField.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 65 }));
    await delay(500);
    orgField.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 27 }));
    orgField.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9 }));
    expect(escSpy.calledTwice).to.be.true;
    orgField.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 40 }));
    orgField.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 40 }));
    expect(handleDownArrowSpy.calledTwice).to.be.true;
    orgField.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 38 }));
    expect(handleUpArrowSpy.calledOnce).to.be.true;
    orgField.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13 }));
    expect(handleEnterKeySpy.calledOnce).to.be.true;
  });

  it('should handle click event on a menu item', async () => {
    const orgField = form.querySelector('#orgname');
    ['a', 'd'].forEach((char) => {
      orgField.value += char; // Update the value of the input element
      const event = new Event('input', { bubbles: true, cancelable: true });
      orgField.dispatchEvent(event);
    });
    const menuItem = form.querySelector('.db-Menu-item');
    menuItem.click();
  });

  it('should return if orgname field is absent', () => {
    const elem = createTag('div');
    const dbConf = {
      endpoint: '',
      apiKey: '',
      delay: 400,
      parentNode: elem,
      fieldMapping: {},
      industryMapping: {},
      payloadMappings: {},
    };
    const db2 = new DemandBase(dbConf);
    const spy = sinon.spy(db2, 'registerDemandBaseHandlers');
    db2.registerDemandBaseHandlers();
    expect(spy.calledOnce).to.be.true;
  });
});
