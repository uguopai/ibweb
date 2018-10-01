import api from '../../api'
import Axios from 'axios'
export default {
  state: {
    pageLoading: false,
    isMember: true,
    tradingList: {}, //主币区交易对列表
    tradingCategory: [], //主币分类
    currentCategoryIndex: 1,
    marketInfo: {},
    currentTradingIndex: 0,
    currentCoinId: 2, //当前币种id
    zoneName: '', //交易区类型
    zoneId: '', //交易区id
    tradeId: '', //交易对id
    allCoin: [],
  },
  actions: {

    //初始化交易对列表
    initTradingList({
      commit,
      state
    }, params) {
      api.classificationList({}).then(res => {
        // console.log(res,'交易列表=++++++===》')
        if (res.datas) {
          let datas = res.datas
          let category = datas.filter(item => item.zoneSwitch === 1)
          if (params.pair) {
            var [coinName, zoneName] = params.pair.split('_');
            let [zone] = state.allCoin.filter( item => item.zoneCoinName == zoneName);
            let [coin] = zone.list.filter( item => item.name == coinName);
            var coinId = coin.id;
            state.zoneName = zone.zoneCoinName
            state.zoneId = zone.zoneCoinId
          } else {
            var coinId = category[0].id;
            state.zoneName = res.datas[0].zoneName
            state.zoneId = res.datas[0].tradeCoinId
          }

          category.push({
            zoneName: '自选',
            id: -1
          })
          commit('setTradingCategory', category);
          commit('toggleTrading', {
            id: coinId,
            callback: params.callback
          })
        }
      })
    },
    //收藏币种
    favoriteCoin({
      commit,
      state
    }, params) {
      api.collect(params).then(res => {
        commit('toggleTrading', {
          id: state.currentCategoryIndex
        }) //刷新列表
      })
    },
    toggleTrading({
      commit,
      state
    }, id) {
      commit('toggleTrading', {
        id
      }) //刷新列表
    },
    timestampToTime({
      commit,
      state
    }, timestamp) {
      var date = new Date(timestamp)
      var Y = date.getFullYear() + '-'
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
      var D = date.getDate() + ' '
      return Y + M + D
    },
    getAllCoin({commit, state }) {
      commit('getAllCoin');
    }
  },

  getters: {
    //搜索过滤币种
    filterCoin: (state, getters) => (value) => {
      console.log(getters.tradingList)
      return state.tradingList.filter(item => item.name.indexOf(value) != '-1')
    },
    tradingList(state) {
      return state.tradingList
    },
    getUserInfo(state) {
      return 'sss'
    },
  },
  mutations: {
    showLoading(state) {
      state.pageLoading = true
    },
    searchCoin(state, arg) {},
    hideLoading(state) {
      state.pageLoading = false
    },
    setTradingList(state, tradingList) {
      state.tradingList = tradingList
    },
    //设置主币分类
    setTradingCategory(state, tradingCategory) {
      // console.log(tradingCategory,'11111111111交易区+++++')
      state.tradingCategory = tradingCategory
      // state.currentCategoryIndex = tradingCategory[0].id

    },
    //查询币种
    getAllCoin(state) {
      api.getTradeInfo().then(res=>{
        state.allCoin = res.datas
      })
    },
    setToken(state) {
      state.userToken = localStorage.getItem('token')
    },
    checkLogin(state, cb) {
      if (!localStorage.getItem('token')) {
        cb()
      } else {
        cb()
      }
    },

    //交易对切换
    toggleTrading(state, params) {

      api.getTradeInfoByZone({
        id: params.id
      }).then(res => {
        if (res.datas.list.length > 0) {
          state.tradingList = res.datas.list
          state.marketInfo = res.datas.list[0]
          state.currentCoinId = res.datas.list[0].coinId
          state.tradeId = res.datas.list[0].id
          params.callback && params.callback();
        }
        console.log(state.tradingList, '---------.......>>>>>>>>>切换交易对')
        state.currentCategoryIndex = id
      })
    },
    //搜索币种
    searchTradingCoin(state, params) {
      console.log("state")
    }

  }
}