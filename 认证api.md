# 认证系统 API 文档

## 基础信息

- **基础 URL**: `http://localhost:8081`
- **接口前缀**: `/api/auth`
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 统一响应格式

所有接口都返回统一的响应格式：

```typescript
interface ResultVO<T> {
  code: number;      // 状态码：200 表示成功，其他表示失败
  message: string;   // 响应消息
  data: T;          // 响应数据（泛型）
  timestamp: number; // 时间戳（毫秒）
}
```

### 成功响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {},
  "timestamp": 1746518400000
}
```

### 失败响应示例

```json
{
  "code": 500,
  "message": "错误信息描述",
  "data": null,
  "timestamp": 1746518400000
}
```

---

## API 接口列表

### 1. 用户登录

**接口地址**: `POST /api/auth/login`

**接口描述**: 用户使用用户名和密码登录系统

**请求参数**:

```typescript
interface LoginRequest {
  username: string;    // 用户名（必填，不能为空）
  password: string;    // 密码（必填，不能为空）
}
```

**请求示例**:

```json
POST /api/auth/login
Content-Type: application/json

{
  "username": "zhangsan",
  "password": "123456"
}
```

**响应数据**:

```typescript
interface LoginResponse {
  token: string;       // JWT 令牌
  tokenType: string;   // Token 类型，固定为 "Bearer"
  userId: number;      // 用户 ID
  username: string;    // 用户名
  nickname: string;    // 昵称
  avatar: string;      // 头像 URL
  role: number;        // 角色：0-普通用户，1-管理员
}
```

**响应示例**:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "userId": 1,
    "username": "zhangsan",
    "nickname": "张三",
    "avatar": "****",
    "role": 0
  },
  "timestamp": 1746518400000
}
```

**前端使用说明**:

```javascript
// 登录成功后，将 token 存储到 localStorage 或 sessionStorage
localStorage.setItem('token', response.data.token);

// 后续请求需要在 Header 中携带 Token
// Authorization: Bearer {token}
```

**错误码**:

- `500`: 用户名或密码错误
- `400`: 参数验证失败（用户名或密码为空）

---

### 2. 用户注册

**接口地址**: `POST /api/auth/register`

**接口描述**: 新用户通过邮箱验证码进行注册

**请求参数**:

```typescript
interface RegisterRequest {
  username: string;         // 用户名（必填，3-20 个字符）
  password: string;         // 密码（必填，6-20 个字符）
  confirmPassword: string;  // 确认密码（必填，必须与密码一致）
  nickname?: string;        // 昵称（可选）
  email: string;            // 邮箱（必填，必须是有效邮箱格式）
  verificationCode: string; // 验证码（必填，6 位数字）
}
```

**请求示例**:

```json
POST /api/auth/register
Content-Type: application/json

{
  "username": "zhangsan",
  "password": "123456",
  "confirmPassword": "123456",
  "nickname": "张三",
  "email": "zhangsan@example.com",
  "verificationCode": "123456"
}
```

**响应数据**:

```typescript
// 注册成功无返回数据，data 为 null
null
```

**响应示例**:

```json
{
  "code": 200,
  "message": "注册成功",
  "data": null,
  "timestamp": 1746518400000
}
```

**前端使用说明**:

```javascript
// 1. 先调用发送验证码接口
await sendVerificationCode({ email, type: 'register' });

// 2. 等待用户输入验证码后，再调用注册接口
await register({
  username,
  password,
  confirmPassword,
  nickname,
  email,
  verificationCode: userInputCode
});

// 3. 注册成功后跳转到登录页
```

**错误码**:

- `500`: 注册失败（用户名已存在、邮箱已存在、验证码错误等）
- `400`: 参数验证失败
  - 用户名长度不在 3-20 之间
  - 密码长度不在 6-20 之间
  - 两次密码不一致
  - 邮箱格式不正确
  - 验证码为空

---

### 3. 发送验证码

**接口地址**: `POST /api/auth/send-code`

**接口描述**: 向指定邮箱发送验证码，用于注册或重置密码

**请求参数**:

```typescript
interface SendCodeRequest {
  email: string;  // 邮箱（必填，必须是有效邮箱格式）
  type: string;   // 验证码类型（必填）
                  // "register" - 注册
                  // "reset" - 重置密码
}
```

**验证码类型说明**:

| 类型代码 | 说明           | 使用场景           |
| -------- | -------------- | ------------------ |
| register | 注册验证码     | 用户注册新账号     |
| reset    | 重置密码验证码 | 忘记密码时重置密码 |

**请求示例**:

```json
POST /api/auth/send-code
Content-Type: application/json

{
  "email": "zhangsan@example.com",
  "type": "register"
}
```

**响应数据**:

```typescript
// 发送成功无返回数据，data 为 null
null
```

**响应示例**:

```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": null,
  "timestamp": 1746518400000
}
```

**前端使用说明**:

```javascript
// 发送验证码
const sendCode = async (email, type) => {
  const response = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, type })
  });
  
  if (response.code === 200) {
    // 开始倒计时（建议 60 秒）
    startCountdown(60);
  }
};

// 注册页面调用
sendCode('zhangsan@example.com', 'register');

// 重置密码页面调用
sendCode('zhangsan@example.com', 'reset');
```

**错误码**:

- `500`: 发送失败（邮箱已注册、发送频率过高等）
- `400`: 参数验证失败
  - 邮箱为空
  - 邮箱格式不正确
  - 验证码类型为空或无效

**限制说明**:

- 同一邮箱发送间隔：60 秒
- 同一邮箱 1 小时内最多发送：5 次
- 验证码有效期：10 分钟
- 验证码为 6 位数字

---

### 4. 重置密码

**接口地址**: `POST /api/auth/reset-password`

**接口描述**: 用户通过邮箱验证码重置登录密码

**请求参数**:

```typescript
interface ResetPasswordRequest {
  email: string;            // 邮箱（必填，必须是有效邮箱格式）
  verificationCode: string; // 验证码（必填，6 位数字）
  newPassword: string;      // 新密码（必填，6-20 个字符）
  confirmPassword: string;  // 确认密码（必填，必须与新密码一致）
}
```

**请求示例**:

```json
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "zhangsan@example.com",
  "verificationCode": "123456",
  "newPassword": "new123456",
  "confirmPassword": "new123456"
}
```

**响应数据**:

```typescript
// 重置成功无返回数据，data 为 null
null
```

**响应示例**:

```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null,
  "timestamp": 1746518400000
}
```

**前端使用说明**:

```javascript
// 1. 先调用发送验证码接口（type 为 reset）
await sendVerificationCode({ email, type: 'reset' });

// 2. 用户输入验证码和新密码后，调用重置密码接口
await resetPassword({
  email,
  verificationCode: userInputCode,
  newPassword,
  confirmPassword
});

// 3. 重置成功后跳转到登录页
```

**错误码**:

- `500`: 重置失败（邮箱不存在、验证码错误、验证码已过期等）
- `400`: 参数验证失败
  - 邮箱为空或格式不正确
  - 验证码为空
  - 新密码长度不在 6-20 之间
  - 两次密码不一致

---

## 前端开发建议

### 1. Token 处理

```javascript
// 登录成功后保存 Token
const login = async (username, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  if (response.code === 200) {
    // 存储 Token
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('userInfo', JSON.stringify(response.data));
  
    // 设置默认请求头
    setAuthHeader(response.data.token);
  }
};

// 设置请求头
con
```
