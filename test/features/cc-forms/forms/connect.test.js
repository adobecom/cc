import sinon from 'sinon';
import { readFile } from '@web/test-runner-commands';
import { setLibs, getLibs } from '../../../../creativecloud/scripts/utils.js';
import { expect } from '@esm-bundle/chai';
import ConnectTrials from '../../../../creativecloud/features/cc-forms/forms/connect.js';

const miloLibs = '/libs';
setLibs(miloLibs);
const { setConfig } = await import(`${getLibs()}/utils/utils.js`);
const CONFIG = {
  stage: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  live: { odinEndpoint: 'https://stage-odin.adobe.com/' },
  prod: { odinEndpoint: 'https://odin.adobe.com/' },
};
setConfig(CONFIG);

window.adobeIMS = {
    initialized: true,
    getProfile: () => {
      const pr = new Promise((res) => res({ countryCode: 'US', userId: 'mathuria' }));
      return pr;
    },
    isSignedInUser: () => true,
    getAccessToken: () => 'token',
    adobeid: { locale: 'en' },
  };
  
window.adobeid = {
api_parameters: {},
locale: 'en',
};

window.digitalData = {};
window.alloy_all = { 'data': { '_adobe_corpnew' : { 'digitalData' : {}}}};

function delay(ms) {
    return new Promise((res) => { setTimeout(() => { res(); }, ms); });
  }

const { default: init } = await import('../../../../creativecloud/blocks/cc-forms/cc-forms.js');

document.body.innerHTML = await readFile({ path: './mocks/connect-body.html' });
describe('ConnectTrials Form', () => {
  const fetchStub = sinon.stub(window, 'fetch');
    before(async () => {
      const el = document.querySelector('.cc-forms');
      fetchStub.callsFake((url) => {
        let payload = {};
        if (url.includes('countries')) {
          payload = {'data':{'countryList':{'items':[{'_path':'/content/dam/acom/country/us/en/US','id':'US','title':'United States','value':'US','isTop':false},{'_path':'/content/dam/acom/country/us/en/IN','id':'IN','title':'India','value':'IN','isTop':false}]}}};
        }
        if (url.includes('connectregions')) {
          payload = {
            "data": {
                "formfieldvaluesList": {
                    "items": [
                        {
                            "id": 2,
                            "title": "United States/Canada",
                            "value": "0"
                        },
                        {
                            "id": 0,
                            "title": "Asia Pacific",
                            "value": "20"
                        },
                        {
                            "id": 1,
                            "title": "EMEA",
                            "value": "10"
                        },
                        {
                            "id": 3,
                            "title": "Rest of the World",
                            "value": "30"
                        }
                    ]
                }
            }
        };
        }
        if (url.includes('timezone')) {
          payload = {
            "data": {
                "formfieldvaluesList": {
                    "items": [
                        {
                            "id": 0,
                            "title": "(GMT-12:00) International Date Line West",
                            "value": "0"
                        },
                        {
                            "id": 1,
                            "title": "(GMT-11:00) Midway Island, Samoa",
                            "value": "1"
                        },
                        {
                            "id": 10,
                            "title": "(GMT-07:00) Mountain Time (US and Canada)",
                            "value": "10"
                        },
                        {
                            "id": 100,
                            "title": "(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
                            "value": "100"
                        },
                        {
                            "id": 105,
                            "title": "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
                            "value": "105"
                        },
                        {
                            "id": 110,
                            "title": "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
                            "value": "110"
                        },
                        {
                            "id": 113,
                            "title": "(GMT+01:00) West Central Africa",
                            "value": "113"
                        },
                        {
                            "id": 115,
                            "title": "(GMT+02:00) Bucharest",
                            "value": "115"
                        },
                        {
                            "id": 120,
                            "title": "(GMT+02:00) Cairo",
                            "value": "120"
                        },
                        {
                            "id": 125,
                            "title": "(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
                            "value": "125"
                        },
                        {
                            "id": 13,
                            "title": "(GMT-07:00) Chihuahua, La Paz, Mazatlan",
                            "value": "13"
                        },
                        {
                            "id": 130,
                            "title": "(GMT+02:00) Athens, Istanbul, Minsk",
                            "value": "130"
                        },
                        {
                            "id": 135,
                            "title": "(GMT+02:00) Jerusalem",
                            "value": "135"
                        },
                        {
                            "id": 140,
                            "title": "(GMT+02:00) Harare, Pretoria",
                            "value": "140"
                        },
                        {
                            "id": 145,
                            "title": "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
                            "value": "145"
                        },
                        {
                            "id": 15,
                            "title": "(GMT-07:00) Arizona",
                            "value": "15"
                        },
                        {
                            "id": 150,
                            "title": "(GMT+03:00) Kuwait, Riyadh",
                            "value": "150"
                        },
                        {
                            "id": 155,
                            "title": "(GMT+03:00) Nairobi",
                            "value": "155"
                        },
                        {
                            "id": 158,
                            "title": "(GMT+03:00) Baghdad",
                            "value": "158"
                        },
                        {
                            "id": 160,
                            "title": "(GMT+03:30) Tehran",
                            "value": "160"
                        },
                        {
                            "id": 165,
                            "title": "(GMT+04:00) Abu Dhabi, Muscat",
                            "value": "165"
                        },
                        {
                            "id": 170,
                            "title": "(GMT+04:00) Baku, Tbilisi, Yerevan",
                            "value": "170"
                        },
                        {
                            "id": 175,
                            "title": "(GMT+04:30) Kabul",
                            "value": "175"
                        },
                        {
                            "id": 180,
                            "title": "(GMT+05:00) Ekaterinburg",
                            "value": "180"
                        },
                        {
                            "id": 185,
                            "title": "(GMT+05:00) Islamabad, Karachi, Tashkent",
                            "value": "185"
                        },
                        {
                            "id": 190,
                            "title": "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi",
                            "value": "190"
                        },
                        {
                            "id": 193,
                            "title": "(GMT+05:45) Kathmandu",
                            "value": "193"
                        },
                        {
                            "id": 195,
                            "title": "(GMT+06:00) Astana, Dhaka",
                            "value": "195"
                        },
                        {
                            "id": 2,
                            "title": "(GMT-10:00) Hawaii",
                            "value": "2"
                        },
                        {
                            "id": 20,
                            "title": "(GMT-06:00) Central Time (US and Canada)",
                            "value": "20"
                        },
                        {
                            "id": 200,
                            "title": "(GMT+06:00) Sri Jayawardenepura",
                            "value": "200"
                        },
                        {
                            "id": 201,
                            "title": "(GMT+06:00) Almaty, Novosibirsk",
                            "value": "201"
                        },
                        {
                            "id": 203,
                            "title": "(GMT+06:30) Rangoon",
                            "value": "203"
                        },
                        {
                            "id": 205,
                            "title": "(GMT+07:00) Bangkok, Hanoi, Jakarta",
                            "value": "205"
                        },
                        {
                            "id": 207,
                            "title": "(GMT+07:00) Krasnoyarsk",
                            "value": "207"
                        },
                        {
                            "id": 210,
                            "title": "(GMT+08:00) Beijing, Chongqing, Hong Kong SAR, Urumqi",
                            "value": "210"
                        },
                        {
                            "id": 215,
                            "title": "(GMT+08:00) Kuala Lumpur, Singapore",
                            "value": "215"
                        },
                        {
                            "id": 220,
                            "title": "(GMT+08:00) Taipei",
                            "value": "220"
                        },
                        {
                            "id": 225,
                            "title": "(GMT+08:00) Perth",
                            "value": "225"
                        },
                        {
                            "id": 227,
                            "title": "(GMT+08:00) Irkutsk, Ulaan Bataar",
                            "value": "227"
                        },
                        {
                            "id": 230,
                            "title": "(GMT+09:00) Seoul",
                            "value": "230"
                        },
                        {
                            "id": 235,
                            "title": "(GMT+09:00) Osaka, Sapporo, Tokyo",
                            "value": "235"
                        },
                        {
                            "id": 240,
                            "title": "(GMT+09:00) Yakutsk",
                            "value": "240"
                        },
                        {
                            "id": 245,
                            "title": "(GMT+09:30) Darwin",
                            "value": "245"
                        },
                        {
                            "id": 25,
                            "title": "(GMT-06:00) Saskatchewan",
                            "value": "25"
                        },
                        {
                            "id": 250,
                            "title": "(GMT+09:30) Adelaide",
                            "value": "250"
                        },
                        {
                            "id": 255,
                            "title": "(GMT+10:00) Canberra, Melbourne, Sydney",
                            "value": "255"
                        },
                        {
                            "id": 260,
                            "title": "(GMT+10:00) Brisbane",
                            "value": "260"
                        },
                        {
                            "id": 265,
                            "title": "(GMT+10:00) Hobart",
                            "value": "265"
                        },
                        {
                            "id": 270,
                            "title": "(GMT+10:00) Vladivostok",
                            "value": "270"
                        },
                        {
                            "id": 275,
                            "title": "(GMT+10:00) Guam, Port Moresby",
                            "value": "275"
                        },
                        {
                            "id": 280,
                            "title": "(GMT+11:00) Magadan, Solomon Islands, New Caledonia",
                            "value": "280"
                        },
                        {
                            "id": 285,
                            "title": "(GMT+12:00) Fiji Islands, Kamchatka, Marshall Islands",
                            "value": "285"
                        },
                        {
                            "id": 290,
                            "title": "(GMT+12:00) Auckland, Wellington",
                            "value": "290"
                        },
                        {
                            "id": 3,
                            "title": "(GMT-09:00) Alaska",
                            "value": "3"
                        },
                        {
                            "id": 30,
                            "title": "(GMT-06:00) Guadalajara, Mexico City, Monterrey",
                            "value": "30"
                        },
                        {
                            "id": 300,
                            "title": "(GMT+13:00) Nuku'alofa",
                            "value": "300"
                        },
                        {
                            "id": 33,
                            "title": "(GMT-06:00) Central America",
                            "value": "33"
                        },
                        {
                            "id": 35,
                            "title": "(GMT-05:00) Eastern Time (US and Canada)",
                            "value": "35"
                        },
                        {
                            "id": 4,
                            "title": "(GMT-08:00) Pacific Time (US and Canada); Tijuana",
                            "value": "4"
                        },
                        {
                            "id": 40,
                            "title": "(GMT-05:00) Indiana (East)",
                            "value": "40"
                        },
                        {
                            "id": 45,
                            "title": "(GMT-05:00) Bogota, Lima, Quito",
                            "value": "45"
                        },
                        {
                            "id": 50,
                            "title": "(GMT-04:00) Atlantic Time (Canada)",
                            "value": "50"
                        },
                        {
                            "id": 55,
                            "title": "(GMT-04:00) Caracas, La Paz",
                            "value": "55"
                        },
                        {
                            "id": 56,
                            "title": "(GMT-04:00) Santiago",
                            "value": "56"
                        },
                        {
                            "id": 60,
                            "title": "(GMT-03:30) Newfoundland",
                            "value": "60"
                        },
                        {
                            "id": 65,
                            "title": "(GMT-03:00) Brasilia",
                            "value": "65"
                        },
                        {
                            "id": 70,
                            "title": "(GMT-03:00) Buenos Aires, Georgetown",
                            "value": "70"
                        },
                        {
                            "id": 73,
                            "title": "(GMT-03:00) Greenland",
                            "value": "73"
                        },
                        {
                            "id": 75,
                            "title": "(GMT-02:00) Mid-Atlantic",
                            "value": "75"
                        },
                        {
                            "id": 80,
                            "title": "(GMT-01:00) Azores",
                            "value": "80"
                        },
                        {
                            "id": 83,
                            "title": "(GMT-01:00) Cape Verde Islands",
                            "value": "83"
                        },
                        {
                            "id": 85,
                            "title": "(GMT) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London",
                            "value": "85"
                        },
                        {
                            "id": 90,
                            "title": "(GMT) Casablanca, Monrovia",
                            "value": "90"
                        },
                        {
                            "id": 95,
                            "title": "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
                            "value": "95"
                        }
                    ]
                }
            }
        };
        }
        if (url.includes('orgsize')) {
          payload = {
            "data": {
                "formfieldvaluesList": {
                    "items": [
                        {
                            "id": 1,
                            "title": "10-99",
                            "value": "10-99"
                        },
                        {
                            "id": 2,
                            "title": "100-499",
                            "value": "100-499"
                        },
                        {
                            "id": 4,
                            "title": "1000-4999",
                            "value": "1000-4999"
                        },
                        {
                            "id": 0,
                            "title": "1-9",
                            "value": "1-9"
                        },
                        {
                            "id": 3,
                            "title": "500-999",
                            "value": "500-999"
                        },
                        {
                            "id": 5,
                            "title": "5000+",
                            "value": "5000+"
                        }
                    ]
                }
            }
        };
        }
        if (url.includes('industry')) {
          payload = {
            "data": {
                "formfieldvaluesList": {
                    "items": [
                        {
                            "id": 1,
                            "title": "Advertising",
                            "value": "ADVERTISING"
                        },
                        {
                            "id": 40,
                            "title": "Agriculture & Forestry",
                            "value": "AGRICULTURE_AND_FORESTRY"
                        },
                        {
                            "id": 41,
                            "title": "Construction",
                            "value": "CONSTRUCTION"
                        },
                        {
                            "id": 56,
                            "title": "Education - Higher Ed",
                            "value": "EDUCATION_HIGHER_ED"
                        },
                        {
                            "id": 9,
                            "title": "Education - K12",
                            "value": "EDUCATION_K_12"
                        },
                        {
                            "id": 10,
                            "title": "Energy, Mining, Oil & Gas",
                            "value": "ENERGY_MINING_OIL_GAS"
                        },
                        {
                            "id": 13,
                            "title": "Financial Services",
                            "value": "FINANCIAL_SERVICES"
                        },
                        {
                            "id": 14,
                            "title": "Government - Federal",
                            "value": "GOVERNMENT_FEDERAL"
                        },
                        {
                            "id": 58,
                            "title": "Government - Local",
                            "value": "GOVERNMENT_LOCAL"
                        },
                        {
                            "id": 57,
                            "title": "Government - Military",
                            "value": "GOVERNMENT_MILITARY"
                        },
                        {
                            "id": 59,
                            "title": "Government - State",
                            "value": "GOVERNMENT_STATE"
                        },
                        {
                            "id": 16,
                            "title": "Health Care",
                            "value": "HEALTH_CARE"
                        },
                        {
                            "id": 42,
                            "title": "Insurance",
                            "value": "INSURANCE"
                        },
                        {
                            "id": 20,
                            "title": "Manufacturing - Aerospace",
                            "value": "MANUFACTURING_AEROSPACE"
                        },
                        {
                            "id": 44,
                            "title": "Manufacturing - Automotive",
                            "value": "MANUFACTURING_AUTOMOTIVE"
                        },
                        {
                            "id": 55,
                            "title": "Manufacturing - Consumer Goods",
                            "value": "MANUFACTURING_CONSUMERGOODS"
                        },
                        {
                            "id": 40,
                            "title": "Manufacturing - Industrial",
                            "value": "MANUFACTURING_INDUSTRIAL"
                        },
                        {
                            "id": 43,
                            "title": "Media & Entertainment",
                            "value": "MEDIA_ENTERTAINMENT"
                        },
                        {
                            "id": 54,
                            "title": "Membership Organizations",
                            "value": "MEMBERSHIP_ORGANIZATIONS"
                        },
                        {
                            "id": 45,
                            "title": "Non-Profit",
                            "value": "NON_PROFIT"
                        },
                        {
                            "id": 23,
                            "title": "Pharmaceuticals & Biotech",
                            "value": "PHARMACEUTICALS_BIOTECH"
                        },
                        {
                            "id": 48,
                            "title": "Professional & Technical Services",
                            "value": "PROFESSIONAL_TECHNICALSERVICES"
                        },
                        {
                            "id": 32,
                            "title": "Public Relations",
                            "value": "PUBLIC_RELATIONS"
                        },
                        {
                            "id": 27,
                            "title": "Real Estate, Rental & Leasing",
                            "value": "REALESTATE_RENTAL_LEASING"
                        },
                        {
                            "id": 30,
                            "title": "Retail",
                            "value": "RETAIL"
                        },
                        {
                            "id": 0,
                            "title": "Technology Hardware",
                            "value": "TECHNOLOGY_HARDWARE"
                        },
                        {
                            "id": 50,
                            "title": "Technology Software & Services",
                            "value": "TECHNOLOGY_SOFTWARE_SERVICES"
                        },
                        {
                            "id": 51,
                            "title": "Telecommunications",
                            "value": "TELECOMMUNICATIONS"
                        },
                        {
                            "id": 52,
                            "title": "Transportation & Warehousing",
                            "value": "TRANSPORTATION_WAREHOUSING"
                        },
                        {
                            "id": 59,
                            "title": "Travel, Leisure & Hospitality",
                            "value": "TRAVEL_LEISURE_HOSPITALITY"
                        },
                        {
                            "id": 53,
                            "title": "Utilities",
                            "value": "UTILITIES"
                        }
                    ]
                }
            }
        }
        }
        if (url.includes('jobfunction')) {
            payload = {
                "data": {
                    "formfieldvaluesList": {
                        "items": [
                            {
                                "id": 1,
                                "title": "Accounting/Finance",
                                "value": "ACCOUNTING_FINANCE"
                            },
                            {
                                "id": 2,
                                "title": "Administrative Support",
                                "value": "ADMINISTRATIVE_SUPPORT"
                            },
                            {
                                "id": 3,
                                "title": "Advertising/Marketing/PR",
                                "value": "ADVERTISING_MARKETING_PR"
                            },
                            {
                                "id": 60,
                                "title": "Business Consultant",
                                "value": "BUSINESS_CONSULTANT"
                            },
                            {
                                "id": 6,
                                "title": "Chairman/Owner/CEO/Partner",
                                "value": "CHAIRMAN_OWNER_CEO_PARTNER"
                            },
                            {
                                "id": 78,
                                "title": "Developer (Application)",
                                "value": "DEVELOPER_APPLICATION"
                            },
                            {
                                "id": 79,
                                "title": "Developer (Web)",
                                "value": "DEVELOPER_WEB"
                            },
                            {
                                "id": 75,
                                "title": "Educational Administrator",
                                "value": "EDUCATIONAL_ADMINISTRATOR"
                            },
                            {
                                "id": 9,
                                "title": "Educator",
                                "value": "EDUCATOR_TRAINER"
                            },
                            {
                                "id": 11,
                                "title": "Engineer (Other)",
                                "value": "ENGINEER_OTHER"
                            },
                            {
                                "id": 14,
                                "title": "Healthcare Practitioner/Medical Service",
                                "value": "HEALTHCARE_PRACTITIONER_MEDICAL_SERVICE"
                            },
                            {
                                "id": 76,
                                "title": "Law Enforcement and Protective Services",
                                "value": "LAW_ENFORCEMENT_AND_PROTECTIVE_SERVICES"
                            },
                            {
                                "id": 18,
                                "title": "Legal Occupations",
                                "value": "LEGAL_OCCUPATIONS"
                            },
                            {
                                "id": 73,
                                "title": "Musician/Recording Engineer",
                                "value": "MUSICIAN_RECORDING_ENGINEER"
                            },
                            {
                                "id": 30,
                                "title": "Other",
                                "value": "OTHER"
                            },
                            {
                                "id": 21,
                                "title": "Photographer",
                                "value": "PHOTOGRAPHER"
                            },
                            {
                                "id": 74,
                                "title": "Production Artist/Manager",
                                "value": "PRODUCTION_ARTIST_MANAGER"
                            },
                            {
                                "id": 26,
                                "title": "Scientist/Researcher",
                                "value": "SCIENTIST_RESEARCHER"
                            },
                            {
                                "id": 77,
                                "title": "Social Services",
                                "value": "SOCIAL_SERVICES"
                            },
                            {
                                "id": 31,
                                "title": "Student",
                                "value": "STUDENT"
                            },
                            {
                                "id": 27,
                                "title": "Technical Writer/Documentation",
                                "value": "TECHNICAL_WRITER_DOCUMENTATION"
                            },
                            {
                                "id": 29,
                                "title": "Web Designer",
                                "value": "WEB_DESIGNER"
                            },
                            {
                                "id": 4,
                                "title": "Architect (Building/Landscape)",
                                "value": "ARCHITECT_(BUILDING/LANDSCAPE)"
                            },
                            {
                                "id": 5,
                                "title": "Art Director/Manager",
                                "value": "ART_DIRECTOR/MANAGER"
                            },
                            {
                                "id": 7,
                                "title": "Creative Director",
                                "value": "CREATIVE_DIRECTOR"
                            },
                            {
                                "id": 61,
                                "title": "Customer Care/Tech Support",
                                "value": "CUSTOMER_CARE/TECH_SUPPORT"
                            },
                            {
                                "id": 68,
                                "title": "Designer (Commercial/Industrial)",
                                "value": "DESIGNER_(COMMERCIAL/INDUSTRIAL)"
                            },
                            {
                                "id": 71,
                                "title": "Designer (Motion Graphics/Animation)",
                                "value": "DESIGNER_(MOTION_GRAPHICS/ANIMATION)"
                            },
                            {
                                "id": 69,
                                "title": "Designer (Fashion, Interior)",
                                "value": "DESIGNER_(FASHION_INTERIOR)"
                            },
                            {
                                "id": 70,
                                "title": "Designer (Graphics, Illustration)",
                                "value": "DESIGNER_(GRAPHICS_ILLUSTRATION)"
                            },
                            {
                                "id": 89,
                                "title": "Educator",
                                "value": "Educator"
                            },
                            {
                                "id": 80,
                                "title": "Engineer (Software)",
                                "value": "ENGINEER_(SOFTWARE)"
                            },
                            {
                                "id": 72,
                                "title": "Film/Video Editor/Producer ",
                                "value": "FILM/VIDEO_EDITOR/PRODUCER"
                            },
                            {
                                "id": 62,
                                "title": "General Contractor",
                                "value": "GENERAL_CONTRACTOR"
                            },
                            {
                                "id": 72,
                                "title": "Home User/Hobbyist",
                                "value": "HOMEUSER_HOBBYIST"
                            },
                            {
                                "id": 15,
                                "title": "Human Resources",
                                "value": "HUMAN_RESOURCES"
                            },
                            {
                                "id": 17,
                                "title": "IT/IS/MIS",
                                "value": "IT/IS/MIS"
                            },
                            {
                                "id": 86,
                                "title": "Analyst",
                                "value": "Analyst"
                            },
                            {
                                "id": 87,
                                "title": "Architect",
                                "value": "Architect"
                            },
                            {
                                "id": 93,
                                "title": "Consultant",
                                "value": "Consultant"
                            },
                            {
                                "id": 81,
                                "title": "CXO/EVP",
                                "value": "CXO_EVP"
                            },
                            {
                                "id": 88,
                                "title": "Developer",
                                "value": "Developer"
                            },
                            {
                                "id": 85,
                                "title": "Elected Official",
                                "value": "Elected_Official"
                            },
                            {
                                "id": 92,
                                "title": "Individual Contributor",
                                "value": "Individual_Contributor"
                            },
                            {
                                "id": 96,
                                "title": "Other",
                                "value": "Other"
                            },
                            {
                                "id": 90,
                                "title": "Professional Staff",
                                "value": "Professional_Staff"
                            },
                            {
                                "id": 95,
                                "title": "Self Employed",
                                "value": "Self_Employed"
                            },
                            {
                                "id": 83,
                                "title": "Senior Director/Director",
                                "value": "Senior_Director_Director"
                            },
                            {
                                "id": 84,
                                "title": "Senior Manager/Manager",
                                "value": "Senior_Manager_Manager"
                            },
                            {
                                "id": 94,
                                "title": "Student",
                                "value": "Student"
                            },
                            {
                                "id": 91,
                                "title": "Support Staff",
                                "value": "Support_Staff"
                            },
                            {
                                "id": 82,
                                "title": "SVP/VP",
                                "value": "SVP_VP"
                            },
                            {
                                "id": 63,
                                "title": "Operations",
                                "value": "OPERATIONS"
                            },
                            {
                                "id": 64,
                                "title": "Project Manager",
                                "value": "PROJECT_MANAGER"
                            },
                            {
                                "id": 25,
                                "title": "Purchasing Management",
                                "value": "PURCHASING_MANAGEMENT"
                            },
                            {
                                "id": 65,
                                "title": "Sales",
                                "value": "SALES"
                            },
                            {
                                "id": 66,
                                "title": "Training and Development",
                                "value": "TRAINING_AND_DEVELOPMENT"
                            }
                        ]
                    }
                }
            }
          }
          if (url.includes('connecttrialpurchaseintent')) {
            payload = {
                "data": {
                    "formfieldvaluesList": {
                        "items": [
                            {
                                "id": 0,
                                "title": "Adobe Connect Learning",
                                "value": "learning"
                            },
                            {
                                "id": 0,
                                "title": "Adobe Connect Webinar",
                                "value": "webinars"
                            }
                        ]
                    }
                }
            };
          }
        return Promise.resolve({
          json: async () => payload,
          status: 200,
          ok: true,
        });
      });
      await init(el);
      await delay(1000);
    });

  after(() => {
    fetchStub.restore();
  });

  it('Consent should be monitored', () => {
    const checkbox1 = document.body.querySelector('#consentexplicitemail');
    expect(checkbox1).to.exist;
  });

  it('Text patterns should be validated', () => {
    const postalcode = document.body.querySelector('#postalcode');
    postalcode.value = 'postal code';
    postalcode.dispatchEvent(new Event('input'));
  });

  it('Submit check', () => {
    document.body.querySelector('#email').value = 'email@gmail.com';
    document.body.querySelector('#fname').value = 'val';
    document.body.querySelector('#lname').value = 'val';
    document.body.querySelector('#phonenumber').value = 'val';
    document.body.querySelector('#orgname').value = 'val';
    document.body.querySelector('#country').selectedIndex = 1;
    document.body.querySelector('#state').selectedIndex = 1;
    document.body.querySelector('#postalcode').value = 'val';
    document.body.querySelector('#region').selectedIndex = 1;
    document.body.querySelector('#timezone').selectedIndex = 1;
    document.body.querySelector('#orgsize').selectedIndex = 1;
    document.body.querySelector('#industry').selectedIndex = 1;
    document.body.querySelector('#jobfunction').selectedIndex = 1;
    document.body.querySelector('#connectpurchaseintent').selectedIndex = 1;
    document.body.querySelector('#accept-agreement').checked = true;
    document.body.querySelector('.cc-form-component.submit').dispatchEvent(new Event('click'));
  });
});