export default defineAppConfig({
  pages: [
    'pages/policy/index',
    'pages/asset/index',
    'pages/claim/index',
    'pages/reminder/index',
    'pages/statistics/index',
    'pages/policyDetail/index',
    'pages/policyAdd/index',
    'pages/assetDetail/index',
    'pages/claimAdd/index',
    'pages/claimDetail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2B5FCE',
    navigationBarTitleText: '资产保险管理',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#A0AEC0',
    selectedColor: '#2B5FCE',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/policy/index',
        text: '保单'
      },
      {
        pagePath: 'pages/asset/index',
        text: '资产'
      },
      {
        pagePath: 'pages/claim/index',
        text: '理赔'
      },
      {
        pagePath: 'pages/reminder/index',
        text: '提醒'
      },
      {
        pagePath: 'pages/statistics/index',
        text: '统计'
      }
    ]
  }
})
