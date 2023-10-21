/* 
    封装ajax请求  参数为 url data method
*/

// 引入服务器地址配置文件
import config from "./config";

/**
 *
 * @param {String} url /xxx
 * @param {Object} data {}
 * @param {String} method 'GET' or 'POST'
 * @return {Promise}
 */
function request(url, data = {}, method = "GET") {
  const header = data.vxid ? { "content-type": "application/json" } : {};
  return new Promise((resolve, reject) => {
    wx.request({
      header,
      url: config.host + url,
      data,
      method,
      success: (res) => {
        // 取出data返回
        resolve(res.data);
      },
      fail: (err) => {
        console.log(err.errMsg);
        reject(err);
      },
    });
  });
}

export default request;
