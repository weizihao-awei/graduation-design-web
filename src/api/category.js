import request from '@/utils/request'

// 获取分类列表（公开）
export function getCategoryList() {
  return request({
    url: '/category/list',
    method: 'get'
  })
}

// 获取分类详情（公开）
export function getCategoryDetail(categoryId) {
  return request({
    url: `/category/detail/${categoryId}`,
    method: 'get'
  })
}

// 创建分类（管理员）
export function createCategory(data) {
  return request({
    url: '/category/create',
    method: 'post',
    data
  })
}

// 更新分类（管理员）
export function updateCategory(data) {
  return request({
    url: '/category/update',
    method: 'put',
    data
  })
}

// 删除分类（管理员）
export function deleteCategory(categoryId) {
  return request({
    url: `/category/delete/${categoryId}`,
    method: 'delete'
  })
}

// 获取分类列表（管理员分页）
export function getAdminCategoryList(params) {
  return request({
    url: '/category/admin-list',
    method: 'get',
    params
  })
}