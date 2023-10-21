// 引入封装的request
import request from "../../utils/request.js";
// 引入Message
import Message from "tdesign-miniprogram/message/index";
// 声明
const defaultAvatarUrl =
  "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";

// page
Page({
  data: {
    footerText: "Copyright © 2021-2031 FMD, All Rights Reserved",
    avatarUrl: defaultAvatarUrl,
    overlay: "",
    nickName: "",
    submitBtnDisabled: false,
    copyRxCodeBtnShow: false,
    rxCode: "xxxx",
    errlog: 0,
  },

  // 昵称输入框change回调
  nicknameChange(e) {
    const nickName = e.detail.value;
    this.setData({ nickName: nickName });
  },

  // 提交按钮
  onSubmit(e) {
    console.log(this.data.nickName);

    // 改变按钮状态
    this.setData({ submitBtnDisabled: true });

    // 节流防暴力破解
    if (this.data.errlog > 5) {
      this.showErrorMessage("操作频繁，请30s之后再试");
      // 30s后解除禁用
      this.submitBtnFree(30000, false, false);
      // 重置errlog
      this.setData({ errlog: 0 });
      return;
    }

    const { nickName } = this.data;

    if (!nickName) {
      this.showErrorMessage("输入不能为为空");
      this.submitBtnFree();
      return;
    }

    const vxid = nickName;
    const data = { vxid: vxid };
    // 发请求
    request("/rxcode", data, "POST")
      .then((res) => {
        // console.log(res);
        // 判断返回的状态码
        if (res.code === 200) {
          this.showSuccessMessage("领取成功");
          // 成功领取到
          this.setData({
            rxCode: res.data.rxCode,
            copyRxCodeBtnShow: true,
          });
          // 本地缓存
          this.setStorage({ vxid: vxid, rxCode: res.data.rxCode });
        } else {
          // 领取失败
          if (res.code === 202) {
            // vxid错误
            this.showErrorMessage("昵称错误");
          } else if (res.code === 203) {
            // 已领取
            this.showErrorMessage("此昵称已领取");
          } else {
            // 其他错误
            this.showErrrrMessage(res.msg);
          }
          // 延迟开启
          this.submitBtnFree();
        }
      })
      .catch((err) => {
        this.showErrorMessage("请求失败：网络异常，请稍后再试");
        this.submitBtnFree();
      });
  },

  /**
   * 延迟禁用/解禁submit按钮（默认惩罚）
   * @param {String} time 延迟时间 默认3000ms
   * @param {Boolean} disable 是否禁用 默认false
   * @param {Boolean} punish 惩罚记录 默认true
   * @return {void}
   */
  submitBtnFree(time = 3000, disable = false, punish = true) {
    setTimeout(() => {
      // 改变按钮状态 errlog增加
      this.setData({
        submitBtnDisabled: disable,
        errlog: this.data.errlog + punish,
      });
    }, time);
  },

  // 复制rxCode的回调
  copyRxCodeBtn(e) {
    // 复制兑换码到手机剪切板
    wx.setClipboardData({
      data: this.data.rxCode,
      success() {},
    });
  },

  // 本地缓存
  setStorage(dataObj) {
    wx.setStorage({
      key: "userInfo",
      data: dataObj,
      success(res) {},
    });
  },

  // message弹出回调
  showSuccessMessage(msg) {
    Message.success({
      context: this,
      offset: ["150rpx", "32rpx"],
      duration: 5000,
      content: msg,
    });
  },
  showWarnMessage(msg) {
    Message.warning({
      context: this,
      offset: ["150rpx", "32rpx"],
      duration: 5000,
      content: msg,
    });
  },
  showErrorMessage(msg) {
    Message.error({
      context: this,
      offset: ["150rpx", "32rpx"],
      duration: 5000,
      content: msg,
    });
  },

  // onChooseAvatar(e) {
  //   const { avatarUrl } = e.deatail;
  //   this.setData({
  //     avatarUrl,
  //   });
  // },

  // 钩子
  onLoad: function () {
    console.log("onLoad");
    const that = this;
    // 监测是否领取过
    wx.getStorage({
      key: "userInfo",
      success: (res) => {
        // console.log(res.data)
        if (res.data.vxid) {
          that.setData({
            submitBtnDisabled: true,
            rxCode: res.data.rxCode,
            copyRxCodeBtnShow: true,
          });
        }
      },
    });
  },
});
