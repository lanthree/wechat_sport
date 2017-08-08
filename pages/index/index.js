//index.js
var util = require("../../utils/util.js")
var utilsmd5 = require("../../utils/md5.js");

function clone(myObj) {
  if (typeof (myObj) != 'object') return myObj;
  if (myObj == null) return myObj;

  var myNewObj = new Object();

  for (var i in myObj)
    myNewObj[i] = clone(myObj[i]);

  return myNewObj;
}

//获取应用实例
var app = getApp()
var interval, interval2;
var varName, varName2, varName3;
var ctx = wx.createCanvasContext('canvasArcCir');

Page({
  data: {
    point: '0',
    need_point: '0',
    userInfo: {},
    showModalStatus: false,
    rank: 0,
    progress: 0,
    other_sports: 0,
    gotoupdate: false
  },

  onLoad: function (query) {
    console.log("onLoad ", query);

    app.globalData.gotoupdate = true;

    if (!query.groupid) {
      return;
    }

    if (app.globalData.group_info != null && app.globalData.group_info.groupid == query.groupid) {
      return;
    }

    wx.showModal({
      title: '加入 ' + decodeURI(query.groupname) + ' 小组吗？',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')

          app.getUserInfo(function (userInfo) {

            var tmpdata = {
              cmd: "join_group",
              openid: app.globalData.usersecret.openid,
              groupid: query.groupid,
            };
            console.log("join_group ", tmpdata, " md5sum ", utilsmd5.calcsig(tmpdata));
            tmpdata.sig = utilsmd5.calcsig(tmpdata);

            wx.request({
              url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
              data: tmpdata,
              success: function (res) {

              }
            })
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },

  onShow: function () {

    console.log("onShow")
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo) {
      //更新数据
      console.log("index on show update: ", app.globalData.point);
      console.log("+++, ", app.globalData.gotoupdate);
      if (app.globalData.gotoupdate) {

        that.update(app.globalData.gotoupdate);
        that.setData({
          userInfo: userInfo,
          need_point: app.globalData.need_point,
          gotoupdate: false
        });

        app.globalData.gotoupdate = false;


      } else {
        if (app.globalData.group_info) {
          app.globalData.progress = Math.floor(app.globalData.user_info.currentpoints / (app.globalData.group_info.passpoint * 7) * 100);
          app.globalData.groupid = app.globalData.group_info.openid;
        } else {
          app.globalData.progress = Math.floor(app.globalData.user_info.currentpoints / (app.globalData.need_point * 7) * 100);
        }
        if (!app.globalData.progress) {
          app.globalData.progress = 0;
        }


        that.setData({
          userInfo: userInfo,
          point: app.globalData.point,
          need_point: app.globalData.need_point,
          user_info: app.globalData.user_info,
          users_info: app.globalData.users_info,
          group_info: app.globalData.group_info,
          progress: app.globalData.progress,
          rank: app.globalData.user_info.rank,
          maxsteps: app.globalData.maxsteps,
          other_sports: app.globalData.other_sports,
          week_now: app.globalData.week_now,
          week_pre: app.globalData.week_pre,
        });


        that.drawCircle();
        that.drawBar();
      }

      // 设置小组信息 TODO
    })

    var wh = wx.getSystemInfoSync();
    this.setData({
      bar_chart_width: wh.windowWidth * 0.8,
      bar_chart_height: wh.windowHeight - 430
    });
  },

  onReady: function () {
    //创建并返回绘图上下文context对象。
    var cxt_arc = wx.createCanvasContext('canvasCircle');
    cxt_arc.setLineWidth(10);
    cxt_arc.setStrokeStyle('#eaeaea');
    cxt_arc.setLineCap('round');
    cxt_arc.beginPath();
    cxt_arc.arc(100, 100, 95, 0, 2 * Math.PI, false);
    cxt_arc.stroke();
    cxt_arc.draw();

    // ?
    var cxt_bar_back = wx.createCanvasContext('canvas_bar_back');
    cxt_bar_back.beginPath()

    cxt_bar_back.setStrokeStyle('#eaeaea');
    cxt_bar_back.setLineWidth(6)
    cxt_bar_back.setLineCap('round');
    var interval_x = this.data.bar_chart_width / 7;
    var max_y = 25;
    var now_x = interval_x / 2;
    cxt_bar_back.moveTo(now_x, this.data.bar_chart_height);
    for (var idx = 0; idx < 7; ++idx) {
      cxt_bar_back.lineTo(now_x, max_y);
      cxt_bar_back.stroke()

      now_x = now_x + interval_x;
      cxt_bar_back.moveTo(now_x, this.data.bar_chart_height);
    }

    cxt_bar_back.draw()

    cxt_bar_back = wx.createCanvasContext('canvas_bar_back_2');
    cxt_bar_back.beginPath()

    cxt_bar_back.setStrokeStyle('#eaeaea');
    cxt_bar_back.setLineWidth(6)
    cxt_bar_back.setLineCap('round');
    var interval_x = this.data.bar_chart_width / 7;
    var max_y = 25;
    var now_x = interval_x / 2;
    cxt_bar_back.moveTo(now_x, this.data.bar_chart_height);
    for (var idx = 0; idx < 7; ++idx) {
      cxt_bar_back.lineTo(now_x, max_y);
      cxt_bar_back.stroke()

      now_x = now_x + interval_x;
      cxt_bar_back.moveTo(now_x, this.data.bar_chart_height);
    }

    cxt_bar_back.draw()
  },

  update: function (para) {
    var that = this;

    if (wx.vibrateShort){
      wx.vibrateShort();
    }

    if (!wx.getWeRunData){
      wx.showModal({
        title: '微信版本过低，请先升级微信！',
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

    wx.showLoading({
      title: '同步中……',
    })

    wx.getWeRunData({
      success: function (res) {
        const encryptedData = res.encryptedData
        console.log(res);

        var runres = res;

        var md5str = 'cmd' + 'set_user_sports_info'
          + 'grouid' + 'iv' + runres.iv
          + 'openid' + app.globalData.usersecret.openid
          + 'sessionkey' + app.globalData.usersecret.session_key
          + 'steps' + encryptedData
          + 'testtest';

        wx.request({
          url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
          //url: 'https://xcx.lanthree.com',
          data: {
            cmd: 'set_user_sports_info',
            openid: app.globalData.usersecret.openid,
            grouid: "",
            sessionkey: app.globalData.usersecret.session_key,
            steps: encryptedData,
            iv: runres.iv,
            sig: utilsmd5.hexMD5(md5str)
          },
          success: function (res) {

            var tmpdata = {
              cmd: 'get_sports_info',
              openid: app.globalData.usersecret.openid
            };

            console.log('get_sports_info : ', tmpdata, ' md5sum: ', utilsmd5.calcsig(tmpdata));
            tmpdata.sig = utilsmd5.calcsig(tmpdata);

            wx.request({
              url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
              data: tmpdata,
              success: function (res) {

                wx.hideLoading();
                console.log("something!");
                console.log(res)

                app.globalData.group_info = res.data.group_info;
                wx.setStorage({
                  key: "group_info",
                  data: res.data.group_info
                })

                app.globalData.users_info = res.data.user_info;
                wx.setStorage({
                  key: "users_info",
                  data: res.data.user_info
                })

                if (res.data.group_info) {
                  console.log("you are in a group");

                  for (var idx in res.data.user_info) {
                    if (app.globalData.usersecret.openid == res.data.user_info[idx].openid) {
                      app.globalData.point = res.data.user_info[idx].point_dat[res.data.user_info[idx].point_dat.length - 1].steps;
                      app.globalData.user_info = res.data.user_info[idx];
                      app.globalData.progress = Math.floor(app.globalData.user_info.currentpoints / (app.globalData.group_info.passpoint * 7) * 100);
                    }
                  }
                } else {
                  console.log("you are not in a group");
                  app.globalData.user_info = res.data;
                  app.globalData.point = res.data.point_dat[res.data.point_dat.length - 1].steps;
                  app.globalData.progress = Math.floor(app.globalData.user_info.currentpoints / (that.data.need_point * 7) * 100);
                }

                var other_sports = 0;
                for (var idx = 7; idx < app.globalData.user_info.point_dat.length; ++idx) {
                  for (var key in app.globalData.user_info.point_dat[idx]) {
                    if (key != "steps" && key != "data" && parseInt(app.globalData.user_info.point_dat[idx][key]) != 0) {
                      other_sports += 1;
                    }
                  }
                }


                var week_now = new Array();
                var week_pre = new Array();

                var maxsteps = 0;
                var tmpsteps = app.globalData.user_info.point_dat;
                for (var idx in tmpsteps) {
                  if (idx < 7) {
                    week_pre[idx] = {
                      date: tmpsteps[idx].data.substring(0, 4) + "/" + tmpsteps[idx].data.substring(4, 6) + "/" + tmpsteps[idx].data.substring(6, 8),
                      steps: tmpsteps[idx].steps
                    }
                  } else {
                    week_now[idx - 7] = {
                      date: tmpsteps[idx].data.substring(0, 4) + "/" + tmpsteps[idx].data.substring(4, 6) + "/" + tmpsteps[idx].data.substring(6, 8),
                      steps: tmpsteps[idx].steps
                    }
                  }

                  if (maxsteps < parseInt(tmpsteps[idx].steps)) {
                    maxsteps = parseInt(tmpsteps[idx].steps);
                  }
                }

                that.setData({
                  point: app.globalData.point,
                  user_info: app.globalData.user_info,
                  group_info: app.globalData.group_info,
                  progress: app.globalData.progress,
                  maxsteps: maxsteps,
                  other_sports: other_sports,
                  week_now: week_now,
                  week_pre: week_pre
                });

                app.globalData.maxsteps = maxsteps;
                wx.setStorage({
                  key: "maxsteps",
                  data: app.globalData.maxsteps
                })

                app.globalData.other_sports = other_sports;
                wx.setStorage({
                  key: "other_sports",
                  data: app.globalData.other_sports
                })

                app.globalData.week_now = week_now;
                wx.setStorage({
                  key: "week_now",
                  data: app.globalData.week_now
                })

                app.globalData.week_pre = week_pre;
                wx.setStorage({
                  key: "week_pre",
                  data: app.globalData.week_pre
                })

                wx.setStorage({
                  key: "point",
                  data: app.globalData.point
                })

                wx.setStorage({
                  key: "user_info",
                  data: app.globalData.user_info
                })

                that.drawCircle();
                that.drawBar();
              },
              fail: function (res) {
                console.log("nothing!");
                wx.hideLoading();
              }
            })
          },
          fail: function (res) {
            console.log("nothing!");
            wx.hideLoading();
          }
        })


      },
      fail: function (res) {
        console.log("nothing! ", res);
        wx.hideLoading();

        if (para == true) {
          wx.showModal({
            title: "您的设备不支持同步步数，请在本周进度内手动上传",
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
        }

        var tmpdata = {
          cmd: 'get_sports_info',
          openid: app.globalData.usersecret.openid
        };

        console.log('get_sports_info : ', tmpdata, ' md5sum: ', utilsmd5.calcsig(tmpdata));
        tmpdata.sig = utilsmd5.calcsig(tmpdata);

        wx.request({
          url: 'https://dev.api.unipay.qq.com/cgi-bin/sports_xcx.fcg',
          data: tmpdata,
          success: function (res) {

            wx.hideLoading();
            console.log("something!");
            console.log(res)

            app.globalData.group_info = res.data.group_info;
            wx.setStorage({
              key: "group_info",
              data: res.data.group_info
            })

            app.globalData.users_info = res.data.user_info;
            wx.setStorage({
              key: "users_info",
              data: res.data.user_info
            })

            if (res.data.group_info) {
              console.log("you are in a group");
              console.log("+++------------------ ", app.globalData.usersecret);

              for (var idx in res.data.user_info) {
                if (app.globalData.usersecret.openid == res.data.user_info[idx].openid) {
                  var datetime = new Date();
                  var year = datetime.getFullYear();
                  var month = datetime.getMonth() + 1;
                  if (month <= 9) {
                    month = "0" + month;
                  }
                  var date = datetime.getDate();//获取日(1-31)
                  if (date <= 9) {
                    date = "0" + date;
                  }
                  var dateformat = year + month + date;
                  console.log("today, ", dateformat);
                  if (res.data.user_info[idx].point_dat.length >= 1
                    && dateformat == res.data.user_info[idx].point_dat[res.data.user_info[idx].point_dat.length - 1].data) {

                    app.globalData.point = res.data.user_info[idx].point_dat[res.data.user_info[idx].point_dat.length - 1].steps;
                  } else {
                    app.globalData.point = 0;
                  }
                  app.globalData.user_info = res.data.user_info[idx];

                  app.globalData.progress = Math.floor(app.globalData.user_info.currentpoints / (app.globalData.group_info.passpoint * 7) * 100);
                }
              }
            } else {
              console.log("you are not in a group");
              app.globalData.user_info = res.data;
              app.globalData.point = res.data.point_dat[res.data.point_dat.length - 1].steps;
              app.globalData.progress = Math.floor(app.globalData.user_info.currentpoints / (that.data.need_point * 7) * 100);
            }

            // app.globalData.user_info.point_dat 不够长

            var datetime = new Date();
            var dayscnt = datetime.getDay();
            if (dayscnt == 0) {
              dayscnt = 7;
            }
            dayscnt += 7;

            // app.globalData.user_info.point_dat 不够长
            if (!app.globalData.user_info.point_dat) {
              console.log("app.globalData.user_info.point_dat empty");
            } else if (app.globalData.user_info.point_dat.length < dayscnt) {
              console.log("app.globalData.user_info.point_dat 不够长");
              var newpoint_dat = new Array(dayscnt);
              for (var idx = 1; idx <= dayscnt; ++idx) {

                var year = datetime.getFullYear();
                var month = datetime.getMonth() + 1;
                if (month <= 9) {
                  month = "0" + month;
                }
                var date = datetime.getDate();//获取日(1-31)
                if (date <= 9) {
                  date = "0" + date;
                }
                var dateformat = year + month + date;

                var foundsomething = false;
                for (var inneridx = 0; inneridx < app.globalData.user_info.point_dat.length; ++inneridx) {
                  if (app.globalData.user_info.point_dat[inneridx].data == dateformat) {
                    newpoint_dat[dayscnt-idx] = clone(app.globalData.user_info.point_dat[inneridx]);
                    foundsomething = true;
                    break;
                  }
                }
                if (!foundsomething) {
                  newpoint_dat[dayscnt-idx] = {
                    balltimes: "0",
                    data: dateformat,
                    fittimes: "0",
                    othertimes: "0",
                    ridetimes: "0",
                    runtimes: "0",
                    steps: "0",
                    swimtimes: "0",
                    yogatimes: "0"
                  }
                }

                var today = datetime.getDate();
                var preday = today - 1;
                datetime.setDate(preday);
              }

              console.log("补全ok, ", newpoint_dat);
              app.globalData.user_info.point_dat = newpoint_dat;
            }


            var other_sports = 0;
            for (var idx = 7; idx < app.globalData.user_info.point_dat.length; ++idx) {
              for (var key in app.globalData.user_info.point_dat[idx]) {
                if (key != "steps" && key != "data" && parseInt(app.globalData.user_info.point_dat[idx][key]) != 0) {
                  other_sports += 1;
                }
              }
            }


            var week_now = new Array();
            var week_pre = new Array();

            var maxsteps = 0;
            var tmpsteps = app.globalData.user_info.point_dat;
            for (var idx in tmpsteps) {
              if (idx < 7) {
                week_pre[idx] = {
                  date: tmpsteps[idx].data.substring(0, 4) + "/" + tmpsteps[idx].data.substring(4, 6) + "/" + tmpsteps[idx].data.substring(6, 8),
                  steps: tmpsteps[idx].steps
                }
              } else {
                week_now[idx - 7] = {
                  date: tmpsteps[idx].data.substring(0, 4) + "/" + tmpsteps[idx].data.substring(4, 6) + "/" + tmpsteps[idx].data.substring(6, 8),
                  steps: tmpsteps[idx].steps
                }
              }

              if (maxsteps < parseInt(tmpsteps[idx].steps)) {
                maxsteps = parseInt(tmpsteps[idx].steps);
              }
            }

            that.setData({
              point: app.globalData.point,
              user_info: app.globalData.user_info,
              group_info: app.globalData.group_info,
              progress: app.globalData.progress,
              maxsteps: maxsteps,
              other_sports: other_sports,
              week_now: week_now,
              week_pre: week_pre
            });

            app.globalData.maxsteps = maxsteps;
            wx.setStorage({
              key: "maxsteps",
              data: app.globalData.maxsteps
            })

            app.globalData.other_sports = other_sports;
            wx.setStorage({
              key: "other_sports",
              data: app.globalData.other_sports
            })

            app.globalData.week_now = week_now;
            wx.setStorage({
              key: "week_now",
              data: app.globalData.week_now
            })

            app.globalData.week_pre = week_pre;
            wx.setStorage({
              key: "week_pre",
              data: app.globalData.week_pre
            })

            wx.setStorage({
              key: "point",
              data: app.globalData.point
            })

            wx.setStorage({
              key: "user_info",
              data: app.globalData.user_info
            })

            that.drawCircle();
            that.drawBar();
          },
          fail: function (res) {
            console.log("nothing!");
            wx.hideLoading();
          }
        })
      }
    })
  },

  week_exercise: function (e) {
    wx.navigateTo({
      url: '../week_exercise/week_exercise'
    })
  },

  week_steps: function (e) {
    wx.navigateTo({
      url: '../week_steps/week_steps'
    })
  },

  history_personal: function (e) {
    wx.navigateTo({
      url: '../history/history?scene=personal',
      success: function (res) { },
    })
    this.setData({
      motto: 'MINA'
    })
  },
  team_rank: function (e) {
    if (app.globalData.group_info) {
      wx.navigateTo({
        url: '../team_rank/team_rank'
      })
    } else {
      wx.showModal({
        title: '请先设置中创建小组，并分享邀请更多人加入',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  group_create: function (e) {
    wx.navigateTo({
      url: '../group_create/group_create'
    })
  },

  setting: function (e) {
    wx.navigateTo({
      url: '../setting/setting',
      success: function (res) { },
    })
  },

  info: function (e) {
    wx.navigateTo({
      url: '../info/info',
      success: function (res) { },
    })
  },

  drawBar: function () {

    if (!this.data.maxsteps) {
      return;
    }
    var y_c = [0, 0, 0, 0, 0, 0, 0];
    for (var idx in this.data.week_now) {
      y_c[idx] = this.data.week_now[idx].steps / this.data.maxsteps;
    }
    var y_c_2 = [0, 0, 0, 0, 0, 0, 0];
    for (var idx in this.data.week_pre) {
      y_c_2[idx] = this.data.week_pre[idx].steps / this.data.maxsteps;
    }
    console.log(y_c);

    var that = this;
    clearInterval(varName2);
    function drawbar(cnt, frames, second) {
      var y_c_this = y_c;
      var cxt_bar_back = wx.createCanvasContext('canvas_bar_real');
      if (second) {
        y_c_this = y_c_2;
        cxt_bar_back = wx.createCanvasContext('canvas_bar_real_2')
      }
      cxt_bar_back.beginPath()

      cxt_bar_back.setStrokeStyle('#04ABFF');
      cxt_bar_back.setLineWidth(6)
      cxt_bar_back.setLineCap('round');
      var interval_x = that.data.bar_chart_width / 7;
      var max_y = 25;
      var now_x = interval_x / 2;
      cxt_bar_back.moveTo(now_x, that.data.bar_chart_height);
      for (var idx = 0; idx < 7; ++idx) {
        cxt_bar_back.lineTo(now_x, that.data.bar_chart_height - (that.data.bar_chart_height - 25) * (y_c_this[idx] * cnt / frames));
        cxt_bar_back.stroke()

        cxt_bar_back.setFontSize(12);
        cxt_bar_back.setTextAlign('center');
        var text_x = now_x;
        var text_y = that.data.bar_chart_height - (that.data.bar_chart_height -25) * (y_c_this[idx] * cnt / frames) - 7;
        var text_v = 0;
        if (second) {
          if (that.data.week_pre[idx]) {
            text_v = that.data.week_pre[idx].steps * cnt / frames;
          }
        } else {
          if (that.data.week_now[idx]) {
            text_v = that.data.week_now[idx].steps * cnt / frames;
          }
        }
        text_v = parseInt(text_v);

        cxt_bar_back.setFillStyle('#656D78')
        cxt_bar_back.fillText(text_v.toString(), text_x, text_y);

        now_x = now_x + interval_x;

        cxt_bar_back.moveTo(now_x, that.data.bar_chart_height);
      }

      cxt_bar_back.draw()
    }

    var step = 1, frames = 120;
    var animation_interval = 5;
    var animation = function () {
      if (step <= frames) {
        drawbar(step, frames, false);
        step++;
      } else {
        clearInterval(varName2);
      }
    };
    var step_2 = 1;
    var animation_2 = function () {
      if (step_2 <= frames) {
        drawbar(step_2, frames, true);
        step_2++;
      } else {
        clearInterval(varName3);
      }
    };
    varName2 = setInterval(animation, animation_interval);
    varName3 = setInterval(animation_2, animation_interval);

  },

  drawCircle: function asd() {

    clearInterval(varName);
    function drawArc(s, e) {
      var x = 100, y = 100, radius = 95;
      ctx.setLineWidth(10);
      ctx.setStrokeStyle('#387AEB');
      ctx.setLineCap('round');
      ctx.beginPath();
      ctx.arc(x, y, radius, s, e, false);
      ctx.stroke()
      ctx.draw()
    }

    var step = 1, startAngle = 1.5 * Math.PI, endAngle = 0;
    var animation_interval = 5, n = 120, target_angle = Math.PI * parseFloat(this.data.point) / parseFloat(this.data.need_point);
    if (target_angle > Math.PI) {
      target_angle = Math.PI;
    }
    var animation = function () {
      if (step <= n) {
        endAngle = step * 2 * target_angle / n + 1.5 * Math.PI;
        drawArc(startAngle, endAngle);
        step++;
      } else {
        clearInterval(varName);
      }
    };
    varName = setInterval(animation, animation_interval);
  },

  onShareAppMessage: function () {
    wx.showShareMenu({
      withShareTicket: true
    });

    if (app.globalData.group_info) {
      return {
        title: '加入 ' + decodeURI(app.globalData.group_info.groupname) + ' 小组吧~',
        path: '/pages/index/index?groupid=' + app.globalData.group_info.groupid + "&groupname=" + app.globalData.group_info.groupname,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    } else {
      return {
        title: '快来使用运动积分吧~',
        path: '/pages/index/index',
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }

  },

  powerDrawer: function (e) {
    var currentStatu = e.currentTarget.dataset.statu;
    this.util(currentStatu)
  },
  util: function (currentStatu) {
    /* 动画部分 */
    // 第1步：创建动画实例
    var animation = wx.createAnimation({
      duration: 150, //动画时长
      timingFunction: "ease-in-out", //线性
      delay: 0 //0则不延迟
    });

    // 第2步：这个动画实例赋给当前的动画实例
    this.animation = animation;

    // 第3步：执行第一组动画
    animation.opacity(0).step();

    // 第4步：导出动画对象赋给数据对象储存
    this.setData({
      animationData: animation.export()
    })

    // 第5步：设置定时器到指定时候后，执行第二组动画
    setTimeout(function () {
      // 执行第二组动画
      animation.opacity(1).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
      this.setData({
        animationData: animation
      })

      //关闭
      if (currentStatu == "close" || currentStatu == "confirm_need_data") {
        if (currentStatu == "close") {
          this.recover_need_point();
        } else if (currentStatu == "confirm_need_data") {
          this.update_need_point();
        }

        this.setData(
          {
            showModalStatus: false
          }
        );
      }
    }.bind(this), 50)

    // 显示
    if (currentStatu == "open") {
      this.setData(
        {
          showModalStatus: true
        }
      );
    }
  },
  onPullDownRefresh: function (e) {
    this.update();
    wx.stopPullDownRefresh()
  }
})
