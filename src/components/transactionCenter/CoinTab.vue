<template>
    <div class="coin-tab">
        <div class="search-wrap">
          <div class="search-input">
            <i class="ico ico-search"></i>
            <input type="text" v-model="searchValue" placeholder="查询" class="search">
          </div>
          <!-- <div class="change button" @click="$store.dispatch('trading/testClick','sss')"><b class="ico-changecny"></b><i>CNY</i></div> -->
        </div>
        <ul class="nav-bar">
            <li
              v-for="(item, index) of allCoin" 
              @click="selectZone(index)"
              :class="{ active: index == selectedZoneIndex}"
            >
              {{item.zoneCoinName}}
            </li>
            <li
              @click="selectZone(-1)"
              :class="{ active: -1 == selectedZoneIndex}"
            >
              <span class="ico-star-fill" ></span>
            </li>
        </ul>
        <div class="coin-list-wrap">
            <div class="title">
                <span class="coin-type">币种</span>
                <span class="price" @click="togglePrice">
                  价格
                  <b>
                    <i class="up" :class="{ active: sort == 'price_up'}"></i>
                    <i class="down" :class="{ active: sort == 'price_down'}"></i>
                  </b>
                </span>
                <span class="rate" @click="toggleRate">
                  涨幅
                  <b>
                    <i class="up" :class="{ active: sort == 'rate_up'}"></i>
                    <i class="down" :class="{ active: sort == 'rate_down'}"></i>
                  </b>
                </span>
                <span class="num" @click="toggleNum">
                  24h交易量
                  <b>
                    <i class="up" :class="{ active: sort == 'num_up'}"></i>
                    <i class="down" :class="{ active: sort == 'num_down'}"></i>
                  </b>
                </span>
            </div>
            <div
              class="coin-list"
              v-for="(item, index) of (searchList || allCoin[selectedZoneIndex].list)"
              :class="{'active': item.id == selectedId }"
              @click='selectCoin(item, index)'
            >
              <div v-if="selectedZoneIndex!==-1" class="coin-type">{{item.name}}</div>
              <div v-if="selectedZoneIndex==-1" class="coin-type">{{item.name}}/{{item.zoneCoinName}}</div>
              
              <div class="price">{{item.deal_price}}</div>
              <div class="rate" :class="{ red: !item.increase, green: item.increase}">
                {{item.increase ? '+' : '-'}}{{item.increase_24H | decimal(2)}}%
              </div>
              <div class="num">{{item.amount_24H}}</div>
              <div @click.stop="$store.dispatch('favoriteCoin',{trade_coin_pair_id:item.id,collect:item.collect?'0':'1'})"
              class="ico ico-star-fill" 
              :class="{'ico-star':!item.collect}"></div>
            </div>
        </div>
        <div class="tab-content">
        </div>
    </div>
</template>
<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex"

const search = {

}
export default {
  data() {
    return {
      searchValue:'',
      searchList: null,
      sort: '',
      selectedZoneIndex: 0,
      selectedId: 0,
    };
  },

  created() {
    // 默认打开选中的交易区
    this.selectedZoneIndex = this.allCoin.findIndex( item => item.zoneCoinName == this.zoneName);
    this.selectedId = this.marketInfo.id;
   
    let getcoinId=this.marketInfo.id
    this.$store.dispatch('trading/saveCoinId',{getcoinId})
    
  },


  watch: {
    searchValue(val) {
      if (val) {
        this.searchList = this.getCoinList().filter(item => item.name.indexOf(val.toUpperCase()) >= 0);
      } else {
        this.searchList = this.getCoinList();
      }
    },
    selectedZoneIndex() {
      this.searchList = this.getCoinList();
    },
    allCoin() {
      this.searchList = this.getCoinList();
    }
  },

  computed: {
    ...mapState(["allCoin", 'zoneName', 'marketInfo']),
  },

  methods: {
    getCoinList() {
      if (this.selectedZoneIndex == -1) {
        let list = [];
        this.allCoin.map( zone => {
          zone.list.map( coin => {
            coin.collect && list.push(coin);
          });
        });
        return list;
      } else {
        return this.allCoin[this.selectedZoneIndex].list;
      }
    },
    togglePrice() {
      
      this.searchList = this.allCoin[this.selectedZoneIndex].list;
      if (this.sort == 'price_down') {
        this.sort = 'price_up';
        this.searchList.sort((a, b) => {return a.deal_price - b.deal_price});
        sessionStorage.setItem('price_up', true)    
        sessionStorage.removeItem('price_down');    
        let coinList=this.searchList
        this.$store.dispatch('getcoinList', { coinList })
       
      } else {
        this.sort = 'price_down'
        this.searchList.sort((a, b) => {return b.deal_price - a.deal_price});

        let coinList=this.searchList
        this.$store.dispatch('getcoinList', { coinList })
        sessionStorage.setItem('price_down', true)   
        sessionStorage.removeItem('price_up');    


      }
    },
    toggleRate() {
      this.searchList = this.allCoin[this.selectedZoneIndex].list;
      if (this.sort == 'rate_down') {
        this.sort = 'rate_up'
        this.searchList.sort((a, b) => a.increase_24H > b.increase_24H);
      } else {
        this.sort = 'rate_down'
        this.searchList.sort((a, b) => b.increase_24H > a.increase_24H);
      }
    },
    toggleNum() {
      this.searchList = this.allCoin[this.selectedZoneIndex].list;
      if (this.sort == 'num_down') {
        this.sort = 'num_up'
        this.searchList.sort((a, b) => a.amount_24H > b.amount_24H);
      } else {
        this.sort = 'num_down'
        this.searchList.sort((a, b) => b.amount_24H > a.amount_24H);
      }
    },
    selectZone(index) {
      this.selectedZoneIndex = index;
    },
    selectCoin(item) {
      
      sessionStorage.setItem('isTabChange',false)
      let zone = this.allCoin[this.selectedZoneIndex];
      this.selectedId = item.id;
      this.$store.dispatch('setZone', zone);
      this.$router.push(`/transaction/${item.name}_${zone.zoneCoinName}`)
    }
  }
}
</script>


<style lang="less" scoped>
.fav {
  display: flex;
  align-items: center;
}
.search {
  &-input{
    position: relative;
    flex-grow:2;
    input {
      width:100%;
      background: #3b4249;
      border-radius: 2px;
      padding: 6px 0 7px 7px;
      font-size: 13px;
      color: #b6b7b7;
      text-indent: 30px;
      font-size: 14px;
    }
      &:focus {
        border-color: #1fc56d;
      }
      .ico {
      position: absolute;
      left:10px;
      top: 0;
      line-height:32px;
      }
  }
  &-wrap{
    position: relative;
    padding:20px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    .active {
      color: #1fc56d;
    }
  
    .change {
      margin-left: 5px;
      display: flex;
      align-items:center;
      cursor: pointer;
      background: #292f37;
      border-radius: 2px;
      padding: 0 15px 0 10px;
      font-size: 13px;
      display: inline-block;
      line-height:32px;
    }
    .ico-changecny {
      font-size: 14px;
      margin-right:8px;
      cursor: pointer;
    }
  }
}
.coin-list-wrap {
  background: #292f37;
  height: 427px;
  & > div {
    padding: 0 15px;
  }
  span {
    &:first-child {
      padding-left: 1%;
    }
  }
  .title {
    height: 30px;
    line-height: 30px;
    font-size: 12px;
    color: #9e9fa6;
    border-bottom: 1px solid #3f4449;
    display: flex;
    span {
      position: relative;
      display: inline-block;
      cursor: pointer;

      b {
        height: 14px;
        width: 14px;
        display: inline-block;
        margin-left: 10px;
        position: relative;
        i {
          position: absolute;
        }
      }
    }
    .up {
      &::before {
        position: absolute;
        top: 4px;
        right: -10px;
        width: 0;
        height: 0;
        border-width: 0 4px 4px;
        border-style: solid;
        border-color: transparent transparent #696d73; /*透明 透明  灰*/
        content: " ";
      }
    }

    .down {
      &::after {
        content: " ";
        position: absolute;
        top: 10px;
        right: -10px;
        width: 0;
        height: 0;
        border-width: 4px 4px 0;
        border-style: solid;
        border-color: #696d73 transparent transparent;
      }
    }
    .down.active {
      &::after {
        border-color: #fff transparent transparent;
      }
    }
    .up.active {
      &::before {
        border-color: transparent transparent #fff ;
      }
    }
  }
  .coin-type {
    width: 15.7%;
    margin-right: 5.3%;
  }
  .price {
    width: 16.7%;
    margin-right: 7.4%;
    b{
      margin-left: 5px!important;
    }
  }
  .rate {
    // width: 8.9%;
    margin-right: 8.4%;
     font-weight:800;
    &.red{
      color: #ef6e59;
    }
    &.green {
      color:#1fc56d;
    }
  }
  .num {
    width: 28%;
    text-align: right;
  }
  .coin-list {
    color: #e7e7e7;
    font-size: 0;
    border-bottom:1px solid rgba(255,255,255,.1);
    transition: 0.5s;
    display: flex;
    justify-content:space-between;
    align-items:center;
    *{
      line-height:32px;
    }
    &:hover {
      background: #181f27;
      cursor: pointer;
    }
    &.active{
      background: #181f27;
    }
    &>div {
      display: inline-block;
      font-size: 11px;
      width: 22.5%;
      &.ico{
        width:10%;
        text-align:center;
      }
    }
    
    .ico-star,
    .ico-star-fill {
      font-size: 14px;
      cursor: pointer;
    }
    .select.icon-save {
      background: url("~@/assets/images/star.png") no-repeat center center;
    }
    .num {
      padding-right: 7px;
    }
  }
}
.coin-tab {
  .ico-star-fill {
    font-size: 17px;
  }
  background: #161c24;
  margin: 0 9px 0 12px;

  .nav-bar {
    overflow: hidden;
    li {
      float: left;
      font-family: PingFangTC-Semibold;
      font-size: 12px;
      color: #999ea4;
      padding: 6.5px 5%;
      cursor: pointer;
      height: 30px;
      display: flex;
      align-items:center;
      &.active {
        background: #292f37;
        color: #1fc56d;
      }
      &:last-child{
        padding-left:10px;
        span{
          margin-right:4px;
          font-size:16px;
        }
      }
    }
    .fr {
      float: right;
      font-size: 0;
      height: 30px;
      .check {
        font-size: 12px;
        margin-left: 3.7px;
        color: #9e9fa6;
      }
      .ico-star-fill {
        font-size: 15px;
        color: #65696e;
      }
    }
  }
}
</style>

<style>
@media only screen and (max-width: 1920px) and (min-width: 1400px) {
  .transaction-wrap .transaction-top div.left {
    width: 72%;
  }
  #app .transaction-wrap .transaction-top .right {
    width: 27%;
  }
}
</style>