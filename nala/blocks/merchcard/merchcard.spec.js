module.exports = {
  name: 'merchcard',
  features: [
    {
      tcid: '0',
      name: '@merchcard-ui',
      path: '/creativecloud/animation/testdoc/automation-pw/merchcard?languageBanner=off',
      tags: '@cc @cc-merchcard @cc-merchcardui',
    },
    {
      tcid: '1',
      name: '@merchcard-prices',
      path: '/creativecloud/animation/testdoc/automation-pw/merchcard?languageBanner=off',
      tags: '@cc @cc-merchcard @cc-merchcardprices',
      urls: {
        freetrial: 'https://commerce.adobe.com/store/commitment',
        buynow: 'https://commerce.adobe.com/store/',
      },
    },
    {
      tcid: '2',
      name: '@merchcard-fragmentrefecence',
      path: '/creativecloud/animation/testdoc/automation-pw/merchcard?languageBanner=off',
      tags: '@cc @cc-merchcard @cc-merchcardrefernce',
    },
  ],
};
