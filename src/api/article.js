import request from '@/utils/request'

// 通用文章查询接口（公开）
export function queryArticles(data) {
  return request({
    url: '/article/query',
    method: 'post',
    data
  })
}

// 获取文章列表（公开）
export function getArticleList(params) {
  return request({
    url: '/article/list',
    method: 'get',
    params
  })
}

// 根据标签获取文章列表（公开）
export function getArticlesByTag(tagId, params) {
  return request({
    url: `/article/tag/${tagId}`,
    method: 'get',
    params
  })
}

// 获取文章详情（公开）
export function getArticleDetail(articleId) {
  return request({
    url: `/article/detail/${articleId}`,
    method: 'get'
  })
}

// 创建文章
export function createArticle(data) {
  return request({
    url: '/article/create',
    method: 'post',
    data
  })
}

// 更新文章
export function updateArticle(data) {
  return request({
    url: '/article/update',
    method: 'put',
    data
  })
}

// 删除文章
export function deleteArticle(articleId) {
  return request({
    url: `/article/delete/${articleId}`,
    method: 'delete'
  })
}

// 点赞文章
export function likeArticle(articleId) {
  return request({
    url: `/article/like/${articleId}`,
    method: 'post'
  })
}

// 取消点赞
export function unlikeArticle(articleId) {
  return request({
    url: `/article/like/${articleId}`,
    method: 'delete'
  })
}

// 收藏文章
export function collectArticle(articleId) {
  return request({
    url: `/article/collect/${articleId}`,
    method: 'post'
  })
}

// 取消收藏
export function uncollectArticle(articleId) {
  return request({
    url: `/article/collect/${articleId}`,
    method: 'delete'
  })
}

// 获取热门文章（公开）
export function getHotArticles(data = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: '/article/hot',
    method: 'post',
    data
  })
}

// 获取最新文章（公开）
export function getLatestArticles(data = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: '/article/latest',
    method: 'post',
    data
  })
}

// 获取推荐文章（公开）
export function getRecommendArticles(data = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: '/article/recommend',
    method: 'post',
    data
  })
}

// 获取我的文章列表
export function getMyArticles(params) {
  return request({
    url: '/article/my',
    method: 'get',
    params
  })
}

// 获取我的收藏列表
export function getMyCollects(params) {
  return request({
    url: '/article/my-collects',
    method: 'get',
    params
  })
}