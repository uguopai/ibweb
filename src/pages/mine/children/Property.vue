<template>
  <div class="member-content">
    <div class="property-wrapper">
      <div class="member-title">
        <h1>我的资产</h1>
        <div class="member-total">
          <div class="member-assets">
            总资产折合≈{{mineTotal | decimal(8)}} BTC
            <i>
              <b></b>
            </i>
          </div>
          <div @click="showRecord" class="button button-min">
            <i class="ico ico-order"></i>提币&充币记录
          </div>
        </div>
      </div>
      <div class="top-info">
        <div class="flex-c-b info-left">
          <div class="search-item">
            <span class="ico-search"></span>
            <span class="input-text">
              <input type="text" v-model="searchValue">
            </span>
          </div>
          <span class="check-item">
            <i class="check" :class="{active:this.checked}" @click="handleChecked"></i>隐藏小额资产
          </span>
        </div>
      </div>
      <dl class="coin-info">
        <dt>
          <span>币种</span>
          <span>总数（个）</span>
          <span>可用（个）</span>
          <span>冻结（个）</span>
          <span class="txt-right">操作</span>
        </dt>
        <dd class="list" v-if=" searchList.length>0" v-for="(item, index) in searchList">
          <span class="name">{{item.nameShort}}</span>
          <span class="total">{{item.total || '0.00000000'}}</span>
          <span class="able">{{item.able || '0.00000000'}}</span>
          <span class="frozen">{{item.frozen || '0.00000000'}}</span>
          <span class="txt-right">
            <div @click="fullCoin(index,item.coinId,item.coinName)">充币</div>
            <div
              @click="carryCoin(index,item.coinId,item.able,item.singleMax,item.singleMin,item.nameShort,item.feeValue)"
            >提币</div>
            <!-- <div><router-link to="/Transaction" tag="span">交易</router-link></div> -->
          </span>
          <transition name="fade">
            <div class="carry-coin coin-item" ref="child" v-if="showlist===index">
              <!-- <div class="item">
                        <label class="name">提币地址</label>
                        <input type="text" v-model="coinAddress">
              </div>-->
              <el-form ref="form" :model="form_address" label-width="80px">
                <el-form-item label="提币地址">
                  <el-select
                    v-model="form_address.address"
                    placeholder="请选择提币地址"
                    @change="selectAddress"
                  >
                    <el-option
                      v-for="item in addressList"
                      :label="item.withdrawAddress"
                      :value="[item.coinId+','+item.withdrawAddress]"
                      :key="item.id"
                    ></el-option>
                    <el-option value="">
                      <div @click="addAddress">添加提币地址</div>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
              <div class="item">
                <div class="item-num">
                  <label class="name">数量</label>
                  <div>
                    <span>可用：
                      <i class="use-num">{{ableNum}}</i>
                    </span>
                    <span>限额：
                      <b>{{singleMax}}</b>
                    </span>
                  </div>
                </div>
                <input type="number" v-model="coinNum" @keyup="getfee" step="0.01">
              </div>
              <div class="item">
                <div class="item-input">
                  <div class="rate-text">
                    <label class="name">手续费</label>
                  </div>
                  <input type="number" step="0.01" v-model="finalfee" readonly>
                </div>
                <div class="item-input">
                  <label class="name">到账数量</label>
                  <input type="number" step="0.01" v-model="realNum" readonly>
                </div>
              </div>
              <div class="tips">
                <p>温馨提示：</p>
                <p>最小提币数量为：{{singleMin}} {{coinName_}}</p>
                <p>为保障资金安全，当您账户安全策略变更、密码修改、使用新地址提币，我们会对提币进行人工审核</p>
                <p>请耐心等待工作人员电话或邮件联系</p>
                <p>请务必确认电脑及浏览器安全，防止信息被篡改或泄漏</p>
                <div class="tips-btn" @click="carrycoins">提币</div>
              </div>
            </div>
          </transition>
          <transition name="fade">
            <div class="full-coin coin-item" ref="child1" v-if="showlist1===index">
              <div class="item">
                <label class="name">充币地址</label>
                <div class="address-wrapper">
                  <span class="address">{{fullAddress}}</span>
                  <span
                    class="copy"
                    v-clipboard:copy="fullAddress"
                    @success="handleSuccess"
                    v-if="able"
                  >复制</span>
                  <span class="ewm" @click="showEwm" v-if="able">二维码</span>
                </div>
                <img src="@/assets/images/ewm.png" alt="" class="ewm-img" v-if="isshowEwm">
              </div>
              <div class="item">查看
                <span class="record" @click="showRecord">充币记录</span>跟踪状态
              </div>
              <div class="tips">
                <p>温馨提示：</p>
                <p>为保障资金安全，当您账户安全策略变更、密码修改、使用新地址提币，我们会对提币进行人工审核</p>
                <p>请耐心等待工作人员电话或邮件联系</p>
                <p>请务必确认电脑及浏览器安全，防止信息被篡改或泄漏</p>
              </div>
            </div>
          </transition>
        </dd>
      </dl>
      <el-pagination
        v-show="myAssetsTotal || myAssetsTotal>0"
        @current-change="Change"
        :current-page.sync="pageIndex"
        :page-size="pageSize"
        :total="myAssetsTotal"
        background=""
        layout="total,prev, pager, next"
      ></el-pagination>
    </div>
    <el-dialog title="提示" :visible.sync="dialogAuditing" width="30%">
      <el-form :model="form" class="dialog-wrapper" label-width="120px">
        <el-form-item label="请输入交易密码：">
          <el-input v-model="form.password" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="请输入谷歌验证码：">
          <el-input v-model="form.code" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogAuditing = false">取 消</el-button>
        <el-button type="primary" @click="confirmFull" :plain="true">确定</el-button>
      </div>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="Addressdialog" width="30%">
      <el-form :model="form" class="dialog-wrapper" label-width="120px">
        <el-form-item label="添加提币地址：">
          <el-input v-model="form.address_" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="请输入谷歌验证码：">
          <el-input v-model="form.code_" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="Addressdialog = false">取 消</el-button>
        <el-button type="primary" @click="confirmAdd" :plain="true">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { mapState, mapActions, mapMutations } from "vuex";
export default {
  props: {
    currentTab: {
      type: Boolean
    }
  },

  data() {
    return {
      isOpen:false,
      isOpen1:false,
      mineTotal: "", //我的总资产
      coinKey: "",
      addressList: [],
      pageIndex: 1,
      tradeCoinPairId: "",
      pageSize: 14,
      searchList: null,
      searchValue: "",
      coinAddress: "",
      ableNum: "",
      singleMax: 0,
      singleMin: 0,
      coinNum: "",
      finalfee: "",
      rate: "",
      realNum: "",
      coinId: "",
      able: true,
      coiname: "",
      Addressdialog: false, //添加提币地址对话框
      address_: "",
      coinName_: "", //提币name
      feeValue: "",
      coin_Id: "",
      carryIndex: "",
      dialogAuditing: false,
      form_address: {
        address: ""
      },
      form: {
        code: "",
        password: "",
        code_: ""
      },
      fullAddress: "",
      current: "full",
      isShow: false,
      checked: false, //隐藏小额资产
      isShow1: false,
      isshowEwm: false,
      logoUrl: "",
      coinName: "",
      activeIndex: "",
      propertyLists: [],
      fullCoinRecordList: [],
      showlist: -1,
      showlist1: -1
    };
  },

  created() {
    this.$store.dispatch("assets/allAssets", this.pageIndex);
  },
  mounted() {
    this.getAddress();
    this.getUserTotalProperty();
     this.$api.getValidateById().then(res=>{
       let data=res.datas
       sessionStorage.setItem('google_auth_secret',data.google_auth_secret)
       sessionStorage.setItem('trade_password',data.trade_password)
       sessionStorage.setItem('user_password',data.user_password)
        })
  },
  watch: {
    searchValue(val) {
      if (val) {
        this.searchList = this.myAssets.list.filter(
          item => item.nameShort.indexOf(val.toUpperCase()) >= 0
        );
      } else {
        this.searchList = this.myAssets.list;
      }
    },
    myAssets() {
      this.searchList = this.myAssets.list;
      
    },
    coinNum(newVal, oldVal) {
      const numReg = /^\d+(?:\.\d{1,8})?$/;
      if (numReg.test(newVal) && newVal.toString().length <= 15) {
        this.coinNum = Math.min(this.toNumber(newVal), this.ableNum);
      } else if (newVal == "") {
        this.coinNum = 0;
      } else {
        this.coinNum = oldVal;
      }
    }
  },

  methods: {
    toNumber(s) {
      s = s.toString();
      s = s.replace(/^0+\./, "0.");
      s = s.replace(/^0+([0-9])/, "$1");
      return s;
    },
    //计算资产总和
    getUserTotalProperty() {
      this.$api.getUserTotalProperty().then(res => {
        this.mineTotal = res.datas;
      });
    },
    //确认添加提币地址
    confirmAdd() {
      this.addressList.push({
        withdrawAddress: this.form.address_
      });
      
      this.$api
        .add({
          coinId: this.coin_Id,
          withdrawAddress: this.form.address_,
          coinName: this.coinName_,
          code: this.form.code_
        })
        .then(res => {
          
          if (res.status == 200) {
            this.$message({
              message: "提币地址添加成功",
              type: "success"
            });
            this.Addressdialog = false;
            return;
          }
          this.$message({
            message: res.message,
            type: "warning"
          });
        });
      // this.Addressdialog=false
    },
    //添加提币地址
    addAddress() {
     
      this.Addressdialog = true;
    },
    //获取提币地址
    getAddress() {
      if (this.coinName_&&this.isOpen) {
        this.$api.walistByUserId({ coinKey: this.coinName_ }).then(res => {
          this.addressList = res.datas;
        });
      }
    },
    selectAddress(val) {
      var addressInfo = val.toString().split(",");
      
      this.coin_Id = addressInfo[0];
      this.form_address.address = addressInfo[1];
      // this.tradeCoinPairId=val
    },
    //切换分页
    Change(value) {
      this.pageIndex = value;
      this.$store.dispatch("assets/allAssets", this.pageIndex);
    },

    getfee() {
      this.finalfee = (this.feeValue * this.coinNum).toFixed(10);
      this.realNum = (this.coinNum - this.finalfee).toFixed(10);
      if (this.coinNum == "") {
        this.finalfee = "";
        this.realNum = "";
      }
      if (this.coinNum > this.ableNum) {
        this.$message({
          message: "提币数量超出可用额度",
          type: "warning"
        });
      }
      if (this.coinNum > this.ableNum && this.coinNum > this.singleMax) {
        this.$message({
          message: "提币数量超出可用额度",
          type: "warning"
        });
      }
    },
    //确定提币
    dialogAudit() {},
    carrycoins() {
      if (this.coinNum > this.ableNum) {
        this.$message({
          message: "提币数量超出可用额度",
          type: "warning"
        });
      } else {
        if (
          this.form_address.address &&
          this.coinNum &&
          this.realNum &&
          this.finalfee
        ) {
          this.dialogAuditing = true;
        } else {
          if (this.realNum == "") {
            this.$message({
              message: "到账数量不能为空",
              type: "warning"
            });
          }
          if (this.finalfee == "") {
            this.$message({
              message: "手续费不能为空",
              type: "warning"
            });
          }
          if (this.coinNum == "") {
            this.$message({
              message: "数量不能为空",
              type: "warning"
            });
          }
          if (this.form_address.address == "") {
            this.$message({
              message: "提币不能为空",
              type: "warning"
            });
          }
        }
      }
    },
    //最终确定提币
    confirmFull() {
      if (this.form.password && this.form.code) {
        this.$api
          .withdraw({
            coin_id: this.coin_Id,
            code: this.form.code,
            tradePassword: this.form.password,
            to: this.form_address.address,
            amount: this.coinNum
          })
          .then(res => {
            
            if (res.message == "成功") {
              this.$refs.child[this.carryIndex].style.display = "none";
              this.dialogAuditing = false;
              this.$store.dispatch("assets/allAssets", this.pageIndex);
              this.$message({
                message: "提币成功",
                type: "success"
              });
            } else {
              this.$message({
                message: res.message,
                type: "warning"
              });
            }
          });
      }
      //  this.$prompt('请输入交易密码', '提示', {
      //     confirmButtonText: '确定',
      //     cancelButtonText: '取消',//replace(/[^\d]/g,'')
      //     inputPattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,21}$/ ,
      //     inputErrorMessage: '请输入正确的密码'
      //   }).then(({ value }) => {
      //     // this.$api.withdraw({coin_id:,}).then(res=>{

      //     // })
      //   })
    },
    //隐藏小额资产
    handleChecked() {
      this.checked = !this.checked;
      if (this.checked) {
        this.searchList = this.myAssets.list.filter(item => item.total > 0);
      } else {
        this.searchList = this.myAssets.list;
      }
    },
    //复制成功
    handleSuccess() {
      this.$message({
        message: "复制成功",
        type: "success"
      });
    },
    //提币
    carryCoin(index, id, ableNum, singleMax, singleMin, coinName_, feeValue) {
       
      this.showlist1 = -1;
        
      if (this.showlist === index) {
         this.isOpen = false
        this.showlist = -1;
        
      } else {
        this.showlist = index;
        this.isOpen = true
      }
     
     
      this.coin_Id = id;
      this.carryIndex = index;
      this.ableNum = ableNum;
      this.singleMax = singleMax;
      this.singleMin = singleMin;
      this.coinName_ = coinName_;
      
     
      this.feeValue = feeValue;
      this.getAddress();
      
      
    },
    //充币
    fullCoin(index, id, name) {
      this.showlist = -1;
      if (this.showlist1 === index) {
        this.showlist1 = -1;
        this.isOpen1 = false
      } else {
        this.showlist1 = index;
        this.isOpen1 = true
      }
      
      if(this.isOpen1){
            this.$api.allotRechargeAddr({ coinId: id }).then(res => {
        if (res.message == "成功") {
         
          this.fullAddress = res.datas;
        } else {
          this.fullAddress = res.message;
          this.able = false;
         
        }
        this.coiname = name;

      });
      }
    
    },
    showEwm() {
      this.isshowEwm = !this.isshowEwm;
    },
    showRecord() {
      this.$router.push("coin-record");
    }
  },
  computed: {
    ...mapState("assets", ["myAssets", "myAssetsTotal"])
  }
};
</script>

 <style >
.dialog-wrapper .el-input .el-input__inner {
  color: #000 !important;
}
.el-select .el-input.is-focus .el-input__inner,
.el-select .el-input__inner:focus {
  border-color: #a5bbd5 !important;
}
.el-select {
  width: 100% !important;
}
.el-pagination {
  height: 30px;
}
</style>

<style lang="less" scoped>
.el-input {
  width: 100% !important;
}
// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 0.5s;
// }
// .fade-enter,
// .fade-leave-to {
//   opacity: 0;
// }
.property-wrapper {
  min-height: 920px;
  color: #fff;
  .coin-info {
    font-size: 14px;
    margin-bottom: 50px;
    color: #999ea4 !important;
    dt {
      border-top: 1px solid #3b4148;
      border-bottom: 1px solid #3b4148;
    }
    .txt-right {
      text-align: right;
      float: right;
      & > div {
        display: inline-block;
        padding: 4px 8px;
        color: #2286ff;
        cursor: pointer;
      }
    }
  }
  .list {
    // display: flex;
    // position: relative;
    // height: 48px;
    border-bottom: 1px solid #3b4148;
    align-items: center;
    padding: 14px 0;
    span {
      display: inline-block;
      font-size: 14px;
    }
    .name {
      width: 100px;
    }
    .total {
      width: 150px;
      text-align: right;
    }
    .able,
    .frozen {
      width: 180px;
      text-align: right;
    }
    .wrap-img {
      width: 20px;
      height: 20px;
      display: inline-block;
      margin-right: 5px;
      img {
        width: 100%;
        vertical-align: sub;
      }
    }
  }
  .top-info {
    height: 54px;
    display: flex;
    align-items: center;

    .info-left {
      flex: 1;
      font-size: 16px;
      display: flex;
      align-items: center;

      i {
        font-size: 14px;
        margin-right: 42px;
      }
      .input-text {
        height: 30px;
        display: inline-block;
        // border: 1px solid #3b4148;
        input {
          color: #fff;
          text-indent: 25px;
          height: 30px;
        }
      }
      .search-item {
        position: relative;
        .ico-search {
          position: absolute;
          left: 9px;
          font-size: 14px;
          color: #e5e7e8;
          top: 8px;
        }
        .iconfont {
          position: absolute;
          right: 9px;
          top: 6px;
          cursor: pointer;
        }
      }
      .check-item {
        font-size: 14px;
        .check {
          display: inline-block;
          top: 2px;
          width: 14px;
          height: 14px;
          background: #292f37;
          cursor: pointer;
          position: relative;
          margin-right: 10px;
          border: 1px solid #fff;

          &.active::after {
            content: "";
            height: 7px;
            left: 4px;
            position: absolute;
            top: 0px;
            width: 3px;
            border-bottom: 1px solid #2286ff;
            border-right: 1px solid #2286ff;
            transform: rotate(38deg);
          }
        }
      }
    }
    .info-right {
      color: #2286ff;
      span {
        cursor: pointer;
        font-size: 16px;
      }
    }
  }
  .coin-info {
    dt {
      display: flex;
      height: 48px;
      align-items: center;
      span {
        flex: 1;
      }
    }

    .coin-item {
      z-index: 999;
      border: 1px solid #898c91;
      padding: 20px 30px;
      border-radius: 2px;
      position: relative;
      top: 15px;
      background: #181f27;
      width: 100%;
      .item {
        margin-bottom: 20px;
        overflow: hidden;
        .item-num {
          display: flex;
          align-items: center;
          .use-num {
            color: #2286ff;
            margin-right: 30px;
          }
          .name {
            flex: 1;
          }
        }
        .name {
          line-height: 30px;
        }
        input {
          display: block;
          width: 100%;
          height: 40px;
          line-height: 40px;
          background: rgba(255, 255, 255, 0.06);
          color: #fff;
          text-indent: 10px;
        }
        .item-input {
          float: left;
          width: 48%;
          .rate-text {
            display: flex;
            align-items: center;
            .name {
              flex: 1;
            }
            span {
              text-align: right;
            }
          }
          &:first-child {
            margin-right: 4%;
          }
        }
      }
      .tips {
        margin-top: 40px;
        font-size: 14px;
        position: relative;
        p {
          line-height: 30px;
        }
        .tips-btn {
          width: 132px;
          height: 42px;
          line-height: 42px;
          background: #2286ff;
          text-align: center;
          position: absolute;
          right: 0;
          bottom: 0;
          border-radius: 2px;
          font-size: 16px;
          cursor: pointer;
          color: #ffffff;
        }
      }
    }

    .carry-coin {
      background: #181f27;
      &::before,
      &::after {
        border: solid transparent;
        content: " ";
        height: 0;
        right: 10px;
        position: absolute;
        width: 0;
      }
      &::before {
        border-width: 10px;
        border-bottom-color: #898c91;
        top: -21px;
      }
      &::after {
        border-width: 10px;
        border-bottom-color: #292f37;
        top: -20px;
      }
    }
    .full-coin {
      .copy,
      .ewm,
      .record {
        color: #2286ff;
        font-size: 14px;
        cursor: pointer;
      }
      .item {
        font-size: 14px;
        .ewm-img {
          position: absolute;
          left: 330px;
        }
      }
      .address,
      .copy {
        margin-right: 10px;
      }
      &::before,
      &::after {
        border: solid transparent;
        content: " ";
        height: 0;
        right: 58px;
        position: absolute;
        width: 0;
      }
      &::before {
        border-width: 10px;
        border-bottom-color: #898c91;
        top: -21px;
      }
      &::after {
        border-width: 10px;
        border-bottom-color: #292f37;
        top: -20px;
      }
    }
  }
}
</style>

<style>
</style>
