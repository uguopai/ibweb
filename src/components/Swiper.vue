<template>
  <div class="wraper">
    <swiper :options="swiperOption" ref="mySwiper" v-if="showSwiper">
      <swiper-slide v-for="item of list" :key="item.id">
        <a :href="item.url" target="_blank" class="link_"><img class="swiper-img" :src="item.img"/></a>
      </swiper-slide>
      <!-- Optional controls -->
      <div class="swiper-pagination" slot="pagination"></div>
    </swiper>
  </div>
</template>
<script>
// swiper options example:
export default {
  name: "carrousel",
  props: {
    list: Array
  },
  data() {
    return {
      swiperOption: {
        // NotNextTick is a component's own property, and if notNextTick is set to true, the component will not instantiate the swiper through NextTick, which means you can get the swiper object the first time (if you need to use the get swiper object to do what Things, then this property must be true)
        // notNextTick是一个组件自有属性，如果notNextTick设置为true，组件则不会通过NextTick来实例化swiper，也就意味着你可以在第一时间获取到swiper对象，假如你需要刚加载遍使用获取swiper对象来做什么事，那么这个属性一定要是true
        // notNextTick: true,
        pagination: {
          el: ".swiper-pagination"
        },
        loop: true,
        autoplay: true,
        effect: "fade",
        type: "bullets",
        watchSlidesProgress:true,
        clickable: true,
        // swiper configs 所有的配置同swiper官方api配置
        // autoplay: 1000,
        // direction : 'horizontal',
         loop:true,
         grabCursor : true,
        setWrapperSize: true,
        // autoHeight: true,
        // pagination : '.swiper-pagination',
        paginationClickable :true,
         mousewheelControl : false,
        // observeParents:true,
        // if you need use plugins in the swiper, you can config in here like this
        // 如果自行设计了插件，那么插件的一些配置相关参数，也应该出现在这个对象中，如下debugger
        // debugger: true,
        // swiper callbacks
        // swiper的各种回调函数也可以出现在这个对象中，和swiper官方一样
        // onTransitionStart(swiper){
        //   console.log(swiper)
        // },
        // more Swiper configs and callbacks...
        // ...
      }
    };
  },
  // you can find current swiper instance object like this, while the notNextTick property value must be true
  // 如果你需要得到当前的swiper对象来做一些事情，你可以像下面这样定义一个方法属性来获取当前的swiper对象，同时notNextTick必须为true
  computed: {
    // swiper() {
    //   return this.$refs.mySwiper.swiper
    // },
    showSwiper() {
      return this.list.length;
    }
  },
  mounted() {
    // you can use current swiper instance object to do something(swiper methods)
    // 然后你就可以使用当前上下文内的swiper对象去做你想做的事了
    // console.log('this is current swiper instance object', this.swiper)
    // this.swiper.slideTo(3, 1000, false)
  }
};

</script>
<style lang="less">
.swiper {
  // height:540px;
  background: red;
  &-container{
    // height:540px;
  }
  a.link_ {
    display: block;
    // height:540px;
    width:100%;
  }
  &-container-horizontal {}
  &-pagination {
    z-index: 10;
    &-bullet {
      cursor: pointer;
      background: rgba(255, 255, 255, .5) !important;
      ;
      width:12px;
      height: 12px;
      &-active {
        background: #fff !important;
      }
    }
  }
  &-img {
    width:100%;
        height: 100%;
  }
}

</style>
