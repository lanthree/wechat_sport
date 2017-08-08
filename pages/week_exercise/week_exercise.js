var utilsmd5 = require("../../utils/md5.js");
var utils = require("../../utils/util.js");

//获取应用实例
var app = getApp()

const date = new Date()
const years = []
const months = []
const days = []

for (let i = 2016; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}

Page({
  data: {
    motto: 'hello history',
    groupname: "please input here",
    support_sports: [
      {
        id: "step", name: "计步"
      },
      {
        id: "swimtimes", name: "游泳"
      },
      {
        id: "ridetimes", name: "骑行"
      },
      {
        id: "balltimes", name: "球类"
      },
      {
        id: "fittimes", name: "健身"
      },
      {
        id: "yogatimes", name: "瑜伽"
      },
      {
        id: "runtimes", name: "跑步"
      },
      {
        id: "otherstimes", name: "其他"
      },
      {
        id: "cleartimes", name: "清空"
      }
    ],
    years: years,
    months: months,
    days: days,
    month: date.getMonth()+1,
    day: date.getDate(),
    year: date.getFullYear(),
    value: [9999, date.getMonth(), date.getDate()-1],
  },

  onShow: function () {

    this.setData({
      support_sports_map : {
        steps: "计步",
        swimtimes: "游泳",
        ridetimes: "骑行",
        balltimes: "球类",
        fittimes: "健身",
        yogatimes: "瑜伽",
        runtimes: "跑步",
        otherstimes: "其他",
        cleartimes: "清空"
      }
    })

    this.setData({
      user_info: app.globalData.user_info,
      group_info: app.globalData.group_info
    })

    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {

      console.log('onShow globalData ', app.globalData);

      var sports_record = utils.sortByKey(app.globalData.user_info.point_dat, 'data');

      console.log('onShow sports_record ', sports_record);

      var new_sports_record = new Array();
      var cnt = 0;
      for (var idx in sports_record) {
        for (var key in sports_record[idx]) {
          if (key == "data" || !(parseInt(sports_record[idx][key]) >0) || key=="steps") {
            continue;
          }

          new_sports_record[cnt] = {
            date: sports_record[idx].data.substring(0, 4) + "-" + sports_record[idx].data.substring(4, 6) + "-" + sports_record[idx].data.substring(6, 9),
            name: that.data.support_sports_map[key],
            times: parseInt(sports_record[idx][key])
          }
          cnt += 1;
        }
      }
      console.log("new_sports_record ", new_sports_record);


      //更新数据
      that.setData({
        userInfo: userInfo,
        sports_record: new_sports_record,
      })
    })
  },

  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo,
        point: app.globalData.point,
        need_point: app.globalData.need_point
      })
    })
  },

  bindChange: function (e) {
    const val = e.detail.value
    this.setData({
      year: this.data.years[val[0]],
      month: this.data.months[val[1]],
      day: this.data.days[val[2]]
    })
  },

  checkboxChange: function (e) {

    var new_update_sport = new Array();
    for (var idx in e.detail.value) {
      new_update_sport[idx] = this.data.support_sports[ e.detail.value[idx] ].id;
    }
    this.setData({
      update_sport: new_update_sport
    });
  },

  update_sport: function (e) {

    console.log('update sport ', this.data.year, ' ', this.data.month, ' ', this.data.day, ' ', this.data.update_sport);

    if (!this.data.update_sport || this.data.update_sport.length == 0) {
      wx.showModal({
        title: "您还没有选择运动类型",
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

    var maxday = 31;
    switch(this.data.month) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
       break;
      case 2:
        if ( (year%100 != 0 && year%4 == 0)|| (year %400 == 0) )
          maxday = 29;
        else
          maxday = 28;
      default:
        maxday = 30;
    }

    if (this.data.day > maxday) {
      wx.showModal({
        title: "当前月份只有 " + maxday + "天",
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

    var sel = this.data.year.toString()
      + (this.data.month < 10 ? "0" + this.data.month : this.data.month).toString()
      + (this.data.day < 10 ? "0" + this.data.day : this.data.day).toString();

    var nnn = date.getFullYear().toString()
      + ((date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)).toString()
      + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()).toString();

    if (sel > nnn) {
      wx.showModal({
        title: "请不要选择未来日期",
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

    var tmpdate = this.data.year.toString();
    if (this.data.month < 10)
      tmpdate += "0";
    tmpdate += this.data.month.toString();
    if (this.data.day < 10)
      tmpdate += "0";
    tmpdate += this.data.day.toString();

    var tmpdata = {
      cmd: "set_user_sports_info",
      date: tmpdate,
    }
    for (var idx in this.data.update_sport) {
      tmpdata[this.data.update_sport[idx]] = "1";
    }
    if (this.data.group_info) {
      tmpdata.groupid = this.data.group_info.groupid;
    }
    tmpdata.openid = this.data.user_info.openid;
    console.log("set_user_sports_info ", tmpdata, " md5sum ", utilsmd5.calcsig(tmpdata));
    tmpdata.sig = utilsmd5.calcsig(tmpdata);

    wx.request({
      url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
      data: tmpdata,
      success: function(res) {
        console.log("set_user_sports_info res ", res);
        if (parseInt(res.data.retcode) == 0) {
          wx.showToast({
            title: '上传成功',
            icon: 'success',
            duration: 1500
          })

          app.globalData.gotoupdate = true;
          setTimeout(function () {
            wx.navigateBack();
          }, 1500);

        } else {
          wx.showModal({
            title: "上传失败",
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }
      }
    })

  },
  onPullDownRefresh: function (e) {
    wx.stopPullDownRefresh()
  },
  change_4_slider: function (e) {
    this.data.realsteps = e.detail.value;
  },
  fix_steps:function () {

  }
})
