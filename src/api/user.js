import request from '@/utils/request'

// 获取当前用户信息
export function getUserInfo() {
  return request({
    url: '/user/info',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserInfo(data) {
  return request({
    url: '/user/info',
    method: 'put',
    data
  })
}

// 修改密码
export function updatePassword(data) {
  return request({
    url: '/user/password',
    method: 'put',
    data
  })
}

// 获取用户列表（管理员）
export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  })
}

// 更新用户状态（管理员）
export function updateUserStatus(userId, status) {
  return request({
    url: `/user/${userId}/status/${status}`,
    method: 'put'
  })
}

// 删除用户（管理员）
export function deleteUser(userId) {
  return request({
    url: `/user/${userId}`,
    method: 'delete'
  })
}