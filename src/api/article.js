import request from "@/utils/request";

export function queryArticles(data) {
  return request({
    url: "/article/query",
    method: "post",
    data,
  });
}

export function getArticleDetail(articleId) {
  return request({
    url: `/article/detail/${articleId}`,
    method: "get",
  });
}

export function createArticle(data) {
  return request({
    url: "/article/create",
    method: "post",
    data,
  });
}

export function updateArticle(data) {
  return request({
    url: "/article/update",
    method: "put",
    data,
  });
}

export function deleteArticle(articleId) {
  return request({
    url: `/article/delete/${articleId}`,
    method: "delete",
  });
}

export function operateArticle(articleId, operationType) {
  return request({
    url: "/article/operate",
    method: "post",
    data: {
      articleId,
      operationType,
    },
  });
}

export function getHotArticles(data = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: "/article/hot",
    method: "post",
    data,
  });
}

export function getLatestArticles(data = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: "/article/latest",
    method: "post",
    data,
  });
}

export function getRecommendArticles(data = { pageNum: 1, pageSize: 10 }) {
  return request({
    url: "/article/recommend",
    method: "post",
    data,
  });
}

export function getMyArticles(params) {
  return request({
    url: "/article/my",
    method: "get",
    params,
  });
}

export function getMyCollects(params) {
  return request({
    url: "/article/my-collects",
    method: "get",
    params,
  });
}

// ==================== 时间轴相关接口 ====================

/**
 * 获取月份文章统计
 * @param {Object} data - { year: 2024, month: 3 }
 */
export function getMonthStatistics(data) {
  return request({
    url: "/article/timeline/month-statistics",
    method: "post",
    data,
  });
}

/**
 * 获取指定日期及之前的文章（时间轴向前查询）
 * @param {Object} data - { date: '2024-03-15', pageNum: 1, pageSize: 10 }
 */
export function getArticlesBefore(data) {
  return request({
    url: "/article/timeline/before",
    method: "post",
    data,
  });
}

/**
 * 获取指定日期及之后的文章（时间轴向后查询）
 * @param {Object} data - { date: '2024-03-15', pageNum: 1, pageSize: 10 }
 */
export function getArticlesAfter(data) {
  return request({
    url: "/article/timeline/after",
    method: "post",
    data,
  });
}
