//app.js

var utilsmd5 = require("utils/md5.js");

App({
  onLaunch: function () {
    this.globalData.need_point = wx.getStorageSync('need_point');
    if (!this.globalData.need_point) {
      this.globalData.need_point = "8000";
    }

    this.globalData.point = wx.getStorageSync('point');
    if (!this.globalData.point) {
      this.globalData.point = "0";
    }

    this.globalData.user_info = wx.getStorageSync('user_info');
    this.globalData.users_info = wx.getStorageSync('users_info');
    this.globalData.group_info = wx.getStorageSync('group_info');

    this.globalData.maxsteps = wx.getStorageSync('maxsteps');
    if (!this.globalData.maxstep) {
      this.globalData.maxstep = 0;
    }
    this.globalData.other_sports = wx.getStorageSync('other_sports');
    if (!this.globalData.other_sports) {
      this.globalData.other_sports = 0;
    }
    this.globalData.week_now = wx.getStorageSync('week_now');
    this.globalData.week_pre = wx.getStorageSync('week_pre');

    console.log("init ", this.globalData);
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res) {
          console.log('sys login ', res);
          var loginres = res;

          wx.getUserInfo({
            success: function (res) {
              console.log('sys getUserInfo ', res);
              that.globalData.userInfo = res.userInfo

              wx.request({
                url: 'https://api.weixin.qq.com/sns/jscode2session',
                data: {
                  appid: 'wxf4d9b11f7f1909ed',
                  secret: 'bc4b62300f51bc039fe57a19a1ba7773',
                  js_code: loginres.code,
                  grant_type: 'authorization_code',
                },
                success: function (res) {
                  console.log("openid: ", res.data.openid);
                  console.log("session_key: ", res.data.session_key);

                  that.globalData.usersecret = {
                    openid: res.data.openid,
                    session_key: res.data.session_key
                  };

                  var md5str = 'avatar' + that.globalData.userInfo.avatarUrl
                    + 'cmd' + 'set_get_userinfo'
                    + 'nickname' + encodeURI(that.globalData.userInfo.nickName)
                    + 'openid' + res.data.openid
                    + that.globalData.sig_key;

                  var tmpdata = {
                    cmd: 'set_get_userinfo',
                    openid: res.data.openid,
                    nickname: encodeURI(that.globalData.userInfo.nickName),
                    avatar: that.globalData.userInfo.avatarUrl
                  }
                  console.log('set_get_userinfo ', tmpdata, ' md5sum: ', utilsmd5.calcsig(tmpdata));
                  tmpdata.sig = utilsmd5.calcsig(tmpdata);

                  wx.request({
                    url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
                    data: tmpdata,
                    success: function (res) {
                      console.log('set_get_userinfo succ, ', res);
                      if (res.data.groupid != "NULL" && res.data.groupid != "" && res.data.groupid != undefined) {
                        that.globalData.groupid = res.data.groupid;
                        console.log("your groupid is ", res.data.groupid);
                      } else {
                        console.log("not in a group!");
                      }

                      typeof cb == "function" && cb(that.globalData.userInfo)
                    },
                    fail: function (res) {
                      console.log('set_get_userinfo failed, ', res);
                    }
                  })
                }
              })
            },
            fail: function (res) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    "scope.userInfo": true,
                  }
                }
              })
            }
          })
        }
      })



    }
  },

  globalData: {
    userInfo: null
  }
})
