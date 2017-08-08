var utilsmd5 = require("../../utils/md5.js");
var utils    = require("../../utils/util.js");

//获取应用实例
var app = getApp()

Page({
  data: {
  },
  onShow: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {

      console.log('onShow globalData ', app.globalData);

      var new_users_info = new Array();
      for (var idx in app.globalData.users_info){
        new_users_info[idx] = {
          nickname : decodeURI(app.globalData.users_info[idx].nickname),
          currentpoints : app.globalData.users_info[idx].currentpoints,
          prepoints : app.globalData.users_info[idx].prepoints,
          currentmonthpoints : app.globalData.users_info[idx].currentmonthpoints,
          premonthpoints : app.globalData.users_info[idx].premonthpoints,
          avatar: app.globalData.users_info[idx].avatar
        }
      }

      var datenow = new Date();
      var day = datenow.getDay();
      if (day == 0)
        day = 7;

      for (var idx in new_users_info) {
        new_users_info[idx].currentpoints = Math.floor(new_users_info[idx].currentpoints/day);
        new_users_info[idx].prepoints = Math.floor(new_users_info[idx].prepoints/7);
      }

      var users_info_0 = new Array();
      users_info_0 = new_users_info.slice().sort(function(a, b) {
        return b["currentpoints"] - a["currentpoints"];
      });
      var users_info_1 = new Array();
      users_info_1 = new_users_info.slice().sort(function (a, b) {
        return b["prepoints"] - a["prepoints"];
      });
      var users_info_2 = new Array();
      users_info_2 = new_users_info.slice().sort(function (a, b) {
        return b["currentmonthpoints"] - a["currentmonthpoints"];
      });
      var users_info_3 = new Array();
      users_info_3 = new_users_info.slice().sort(function (a, b) {
        return b["premonthpoints"] - a["premonthpoints"];
      });

      var users_info_array = new Array();
      users_info_array[0] = users_info_0;
      users_info_array[1] = users_info_1;
      users_info_array[2] = users_info_2;
      users_info_array[3] = users_info_3;


      //更新数据
      that.setData({
        userInfo: userInfo,
        user_info: app.globalData.user_info,
        users_info_array: users_info_array,
        now_item: 0,
        rank_info: ["本周日均 Rank", "上周日均 Rank", "本月日均 Rank", "上月日均 Rank"],
        rank_attr: ["currentpoints", "prepoints", "currentmonthpoints", "premonthpoints"],
        group_info: app.globalData.group_info,
        groupname: decodeURI(app.globalData.group_info.groupname),
        passpoint: app.globalData.group_info.passpoint
      })
    })
  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh()
  },
  startmove: function (e) {
    this.setData({
      startX: e.changedTouches[0].clientX
    })
    
  },
  endmove: function (e) {
    var that = this;
    var ani_interval = 250;

    if (e.changedTouches.length == 1) {
      var endX   = e.changedTouches[0].clientX;
      var diffX = this.data.startX - endX;
      var flag = 1;

      var switchX = wx.getSystemInfoSync().windowWidth/5;

      if (diffX > switchX){
        console.log("右滑");
        var idx = this.data.now_item;
        idx = (idx+1)%4;
        flag = -1;
      } else if (diffX < switchX*-1){
        console.log("左滑");
        var idx = this.data.now_item;
        idx = idx - 1;
        if (idx < 0){
          idx = 3;
        }
      } else {
        return;
      }

      var that = this;
      setTimeout(function () {
        that.setData({
          now_item: idx
        })
      }, ani_interval);

      var animation = wx.createAnimation({
        duration: ani_interval,
        timingFunction: 'ease',
      })

      var width = wx.getSystemInfoSync().windowWidth;
      animation.translateX(flag * width).step();
      animation.opacity(0).step({ duration: 1 });
      animation.translateX(-1*flag*width).step({ duration: 1 });
      animation.opacity(1).step({ duration: 1 });
      animation.translateX(0).step();
      this.setData({
        moveanimation: animation.export()
      })

    }
  },
  cancelmove: function (e) {
    console.log(e);
  }
})