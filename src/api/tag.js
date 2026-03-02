import request from '@/utils/request'

// 获取标签列表（公开）
export function getTagList() {
  return request({
    url: '/tag/list',
    method: 'get'
  })
}

// 获取热门标签（公开）
export function getHotTags(limit = 10) {
  return request({
    url: '/tag/hot',
    method: 'get',
    params: { limit }
  })
}

// 获取标签详情（公开）
export function getTagDetail(tagId) {
  return request({
    url: `/tag/detail/${tagId}`,
    method: 'get'
  })
}

// 创建标签（管理员）
export function createTag(data) {
  return request({
    url: '/tag/create',
    method: 'post',
    data
  })
}

// 更新标签（管理员）
export function updateTag(data) {
  return request({
    url: '/tag/update',
    method: 'put',
    data
  })
}

// 删除标签（管理员）
export function deleteTag(tagId) {
  return request({
    url: `/tag/delete/${tagId}`,
    method: 'delete'
  })
}

// 获取标签列表（管理员分页）
export function getAdminTagList(params) {
  return request({
    url: '/tag/admin-list',
    method: 'get',
    params
  })
}