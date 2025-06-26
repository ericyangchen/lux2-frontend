import { UserActivityAction } from "@/lib/enums/users/user-activity-action.enum";

export const USER_ACTIVITY_ACTION_DISPLAY_NAMES = {
  [UserActivityAction.LOGIN]: "登入",
  [UserActivityAction.LOGOUT]: "登出",
  [UserActivityAction.CREATE_USER]: "建立使用者",
  [UserActivityAction.UPDATE_USER]: "更新使用者",
  [UserActivityAction.DELETE_USER]: "刪除使用者",
  [UserActivityAction.ENABLE_OTP]: "啟用OTP",
  [UserActivityAction.DISABLE_OTP]: "停用OTP",
  [UserActivityAction.ADD_LOGIN_IP]: "新增登入IP",
  [UserActivityAction.REMOVE_LOGIN_IP]: "移除登入IP",
  [UserActivityAction.CREATE_MERCHANT_REQUESTED_WITHDRAWAL]: "建立商家提領申請",
  [UserActivityAction.CREATE_ORGANIZATION]: "建立單位",
  [UserActivityAction.UPDATE_ORGANIZATION]: "更新單位",
  [UserActivityAction.ADD_WITHDRAWAL_IP]: "新增提領IP",
  [UserActivityAction.REMOVE_WITHDRAWAL_IP]: "移除提領IP",
  [UserActivityAction.MODIFY_TRANSACTION_FEE_SETTINGS]: "修改交易手續費設定",
  [UserActivityAction.MODIFY_BALANCE]: "修改餘額",
};
