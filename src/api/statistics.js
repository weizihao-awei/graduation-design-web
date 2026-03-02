import request from '@/utils/request'

// 获取统计数据（公开）
export function getStatistics() {
  return request({
    url: '/statistics',
    method: 'get'
  })
}