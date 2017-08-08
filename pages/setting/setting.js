var utilsmd5 = require("../../utils/md5.js");

//获取应用实例
var app = getApp()

Page({
  data: {
    groupname: "please input here",
    teamleader: false,
    teammember: false,
    support_sports: [
      {
        id: "steppoint", name: "计步", value: "1", checked: true
      },
      {
        id: "swimpoint", name: "游泳", value: "4000", checked: false
      },
      {
        id: "ridepoint", name: "骑行", value: "2000", checked: false
      },
      {
        id: "ballpoint", name: "球类", value: "2000", checked: false
      },
      {
        id: "fitpoint", name: "健身", value: "2000", checked: false
      },
      {
        id: "yogapoint", name: "瑜伽", value: "2000", checked: false
      },
      {
        id: "runpoint", name: "跑步", value: "2000", checked: false
      },
      {
        id: "otherpoint", name: "其他", value: "1000", checked: false
      },
    ],
    picker_values: [500, 1000, 2000, 3000, 4000, 5000],
    passpoint: 7000
  },
  onShow: function () {
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {

      console.log('onShow globalData ', app.globalData);

      //更新数据
      that.setData({
        userInfo: userInfo,
        point: app.globalData.point,
        need_point: app.globalData.need_point
      })

      if (app.globalData.group_info) {
        that.setData({
          groupid: app.globalData.group_info.groupid,
          groupname: decodeURI(app.globalData.group_info.groupname),
          passpoint: app.globalData.group_info.passpoint
        })

        console.log("leader or member ", app.globalData.group_info.groupid, " ", app.globalData.usersecret.openid);
        if (app.globalData.group_info.groupid == app.globalData.usersecret.openid) {
          that.setData({
            teamleader: true
          })
          console.log("you are team leader");
        } else {
          that.setData({
            teammember: true
          })
          console.log("you are team member");
        }

        var mew_support_sports = that.data.support_sports;
        for (var idx in mew_support_sports) {
          var key = mew_support_sports[idx].id;
          console.log("group sports ------ ", key, " ", app.globalData.group_info[key]);

          if (app.globalData.group_info[key]) {
            if (parseInt(app.globalData.group_info[key]) > 0) {
              mew_support_sports[idx].checked = true;
              mew_support_sports[idx].value = app.globalData.group_info[key];
            }
          }
        }
        that.setData({
          support_sports: mew_support_sports
        })

      } else {
        console.log("you are not in a team");
      }
    })
  },

  update_need_point: function () {
    app.globalData.need_point = this.data.need_point;
    wx.setStorage({
      key: "need_point",
      data: app.globalData.need_point
    })
    wx.navigateBack();
  },
  change_4_slider: function (e) {
    this.data.need_point = e.detail.value;
  },

  change_4_slider_pass: function (e) {
    this.data.passpoint = e.detail.value;
  },

  checkboxChange: function (e) {
    console.log('checkbox发生change事件，携带value值为��?', e);
    var sports = this.data.support_sports;
    for (var idx in sports) {
      sports[idx].checked = false;
    }
    for (var idx in e.detail.value) {
      sports[e.detail.value[idx]].checked = true;
    }
    this.setData({
      support_sports: sports
    })
  },

  bindPickerChange: function (e) {
    console.log(e);
    var sports = this.data.support_sports;
    console.log(sports);
    sports[parseInt(e.target.id)].value = this.data.picker_values[e.detail.value];
    console.log(sports);
    this.setData({
      support_sports: sports
    })
    console.log(e.target.id);
    console.log(this.data);
  },

  bindInputValue: function (e) {
    this.setData({
      groupname: e.detail.value
    })
  },
  createGroup: function (e) {
    var that = this;
    var action = e.currentTarget.dataset.action;

    if (this.data.groupname == "please input here" || this.data.groupname == "") {
      wx.showModal({
        title: '小组名不能为��?',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }

    var tmpdata = {
      cmd: 'set_groupinfo',
      openid: app.globalData.usersecret.openid,
      groupname: encodeURI(this.data.groupname),
      passpoint: this.data.passpoint
    }
    for (var idx in this.data.support_sports) {
      if (idx == 0 || this.data.support_sports[idx].checked == false)
        continue;
      tmpdata[this.data.support_sports[idx].id] = this.data.support_sports[idx].value;
    }

    console.log('set_groupinfo ', tmpdata, ' md5sum: ', utilsmd5.calcsig(tmpdata));
    tmpdata.sig = utilsmd5.calcsig(tmpdata);

    wx.request({
      url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
      data: tmpdata,
      success: function (res) {
        console.log('"set_groupinfo succ, ', res);
        if (res.data.retcode == 0) {
          app.globalData.groupid = app.globalData.usersecret.openid;
          app.globalData.group_info = tmpdata;
          that.setData({
            groupid: app.globalData.usersecret.openid,
            teamleader: true
          })

          tmpdata.groupid = tmpdata.openid;
          wx.setStorage({
            key: 'group_info',
            data: tmpdata,
          })

          if (action == "create") {
            wx.showToast({
              title: '创建小组成功',
              icon: 'success',
              duration: 1500
            })
          } else {
            wx.showToast({
              title: '修改小组设置成功',
              icon: 'success',
              duration: 1500
            })
          }

          app.globalData.gotoupdate = true;
          setTimeout(function () {
            wx.navigateBack();
          }, 1500);
        }
      },
      fail: function (res) {
        console.log('"set_groupinfo failed, ', res);
      }
    })
  },

  exitGroup: function (res) {
    var that = this;

    var tmpdata = {
      cmd: 'exit_group',
      openid: app.globalData.usersecret.openid,
      groupid: app.globalData.group_info.groupid
    }
    console.log('exit_group ', tmpdata, ' md5sum ', utilsmd5.calcsig(tmpdata));
    tmpdata.sig = utilsmd5.calcsig(tmpdata);

    wx.request({
      url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
      data: tmpdata,
      success: function (res) {
        console.log('exit_group succ, ', res);
        if (res.data.retcode == 0) {
          app.globalData.group_info = null;
          app.globalData.users_info = null;
          app.globalData.user_info.rank = 1;

          wx.setStorage({
            key: 'group_info',
            data: null,
          })

          wx.setStorage({
            key: 'users_info',
            data: null,
          })

          wx.setStorage({
            key: 'user_info',
            data: app.globalData.user_info,
          })

          that.setData({
            groupid: '',
            teamleader: false,
            teammember: false
          })

          wx.showToast({
            title: '成功退出小组',
            icon: 'success',
            duration: 1500
          })

          app.globalData.gotoupdate = true;
          setTimeout(function () {
            wx.navigateBack();
          }, 1500);
        }
      },
      fail: function (res) {
        console.log('"set_groupinfo failed, ', res);
      }
    })

  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh()
  }
})
