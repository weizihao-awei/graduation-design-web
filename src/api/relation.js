import request from "@/utils/request";

// 关注或取消关注用户
export function followUser(data) {
  return request({
    url: "/relation/follow",
    method: "post",
    data,
  });
}

// 获取粉丝列表
export function getFollowers(data) {
  return request({
    url: "/relation/followers",
    method: "post",
    data,
  });
}

// 获取关注列表
export function getFollowing(data) {
  return request({
    url: "/relation/following",
    method: "post",
    data,
  });
}

// 获取粉丝数量
export function getFollowersCount(userId) {
  return request({
    url: "/relation/followers/count",
    method: "get",
    params: { userId },
  });
}

// 获取关注数量
export function getFollowingCount(userId) {
  return request({
    url: "/relation/following/count",
    method: "get",
    params: { userId },
  });
}
