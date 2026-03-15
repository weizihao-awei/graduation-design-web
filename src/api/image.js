import request from '@/utils/request'

export function uploadImage(category, file) {
  const formData = new FormData()
  formData.append('category', category)
  formData.append('file', file)

  return request({
    url: '/image/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function updateImage(category, oldUri, file) {
  const formData = new FormData()
  formData.append('category', category)
  formData.append('file', file)
  
  if (oldUri) {
    formData.append('oldUri', oldUri)
  }

  return request({
    url: '/image/update',
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
