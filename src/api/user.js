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

// 查询用户收藏的文章
export function getUserCollections(data) {
  return request({
    url: '/user/foot/collection',
    method: 'post',
    data
  })
}

// 查询用户点赞的文章
export function getUserPraises(data) {
  return request({
    url: '/user/foot/praise',
    method: 'post',
    data
  })
}

// 查询用户浏览的文章
export function getUserReads(data) {
  return request({
    url: '/user/foot/read',
    method: 'post',
    data
  })
}

// 查询用户发布的文章
export function getUserPublished(data) {
  return request({
    url: '/user/articles/published',
    method: 'post',
    data
  })
}