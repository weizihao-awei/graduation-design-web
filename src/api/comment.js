import request from '@/utils/request'

// 获取文章评论列表（公开，树形结构）
export function getCommentList(articleId) {
  return request({
    url: `/comment/list/${articleId}`,
    method: 'get'
  })
}

// 创建评论
export function createComment(data) {
  return request({
    url: '/comment/create',
    method: 'post',
    data
  })
}

// 删除评论
export function deleteComment(commentId) {
  return request({
    url: `/comment/delete/${commentId}`,
    method: 'delete'
  })
}

// 更新评论状态（管理员）
export function updateCommentStatus(commentId, status) {
  return request({
    url: `/comment/${commentId}/status/${status}`,
    method: 'put'
  })
}

// 获取评论列表（管理员分页）
export function getAdminCommentList(params) {
  return request({
    url: '/comment/admin-list',
    method: 'get',
    params
  })
}