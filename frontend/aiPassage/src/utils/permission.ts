import { USER_ROLE_ADMIN } from '@/constants/user'

/**
 * 权限判断工具
 */

/**
 * 判断用户是否为管理员
 */
export const isAdmin = (user?: API.LoginUserVO): boolean => {
  return user?.userRole === USER_ROLE_ADMIN
}
