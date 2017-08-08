function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('/');
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getweeksteptotal(stepInfoList) {
  var myDate   =  new Date();
  var week_cnt =  Math.floor( (Date.parse(myDate)/1000 - 8*3600 - 3*24*3600)/ (24 * 3600 * 7) );

  var total = 0;
  for (var idx in stepInfoList) {
    var this_week_cnt = Math.floor( (stepInfoList[idx].timestamp - 8 * 3600 - 3 * 24 * 3600)/ (24*3600*7) );
    console.log("util c ", this_week_cnt, week_cnt)
    if (this_week_cnt == week_cnt) {
      total = total + stepInfoList[idx].step;
    }
  }
  return total;
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
    var x = a[key]; var y = b[key];
    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
  });
}

function get_params_md5(data) {
  
}

module.exports = {
  formatTime: formatTime,
  getweeksteptotal: getweeksteptotal,
  sortByKey: sortByKey,
  get_params_md5: get_params_md5
}
