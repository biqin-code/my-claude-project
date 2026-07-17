# 财务管家 - Spring Boot 后端服务

## 技术栈

- **Spring Boot 3.2.0** - 核心框架
- **MyBatis-Plus 3.5.5** - ORM 框架
- **MySQL 8.x** - 数据库（端口 3307）
- **HikariCP** - 连接池
- **Knife4j** - API 文档
- **Lombok** - 简化代码

## 项目结构

```
finance-manager
├── src/main/java/com/finance
│   ├── FinanceManagerApplication.java    # 启动类
│   ├── config/                          # 配置类
│   │   ├── MybatisPlusConfig.java      # MyBatis-Plus 配置
│   │   ├── CorsConfig.java             # 跨域配置
│   │   ├── SwaggerConfig.java          # Swagger 文档配置
│   │   └── WebConfig.java              # Web 配置
│   ├── controller/                      # 控制层
│   │   ├── UserController.java         # 用户管理
│   │   ├── CategoryController.java     # 分类管理
│   │   ├── TransactionController.java   # 交易记录
│   │   ├── StatisticsController.java   # 统计报表
│   │   ├── BudgetController.java        # 预算管理
│   │   └── HealthController.java        # 健康检查
│   ├── service/                        # 服务层
│   │   └── impl/                        # 服务实现
│   ├── mapper/                         # 数据访问层
│   ├── entity/                         # 实体类
│   ├── dto/                            # 数据传输对象
│   │   ├── req/                         # 请求DTO
│   │   └── resp/                        # 响应DTO
│   ├── common/                         # 通用类
│   │   ├── Result.java                  # 统一响应
│   │   ├── BusinessException.java       # 业务异常
│   │   ├── GlobalExceptionHandler.java  # 全局异常处理
│   │   └── Constants.java               # 常量类
│   ├── context/                        # 上下文
│   │   └── UserContext.java             # 用户上下文
│   ├── interceptor/                    # 拦截器
│   │   ├── AuthInterceptor.java        # 认证拦截
│   │   └── AuthInterceptorHandler.java # 拦截处理器
│   └── utils/                          # 工具类
│       ├── PasswordUtil.java            # 密码加密
│       ├── TokenUtil.java              # Token生成
│       └── DateUtil.java                # 日期工具
├── src/main/resources
│   ├── application.yml                 # 配置文件
│   └── sql/
│       └── init_database.sql           # 数据库初始化脚本
└── pom.xml                            # Maven 配置
```

## 快速开始

### 1. 初始化数据库

执行 SQL 脚本创建数据库和表结构：

```bash
mysql -u root -p -P 3307 < src/main/resources/sql/init_database.sql
```

或登录 MySQL 后执行：
```sql
source src/main/resources/sql/init_database.sql
```

### 2. 修改配置（可选）

编辑 `src/main/resources/application.yml`，修改数据库连接信息：

```yaml
spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3307/finance_db
    username: root
    password: 123456
```

### 3. 启动服务

```bash
# 编译并运行
mvn spring-boot:run

# 或打包后运行
mvn clean package -DskipTests
java -jar target/finance-manager-1.0.0.jar
```

### 4. 访问文档

- Swagger UI: http://localhost:8080/api/swagger-ui
- Knife4j: http://localhost:8080/api/doc.html

## API 列表

### 用户管理 `/api/users`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /register | 用户注册 |
| POST | /login | 用户登录 |
| POST | /logout | 用户登出 |
| GET | /me | 获取当前用户信息 |
| PUT | /profile | 更新用户资料 |
| PUT | /password | 修改密码 |

### 交易记录 `/api/transactions`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /today-summary | 获取今日汇总 |
| GET | /recent | 获取最近记录 |
| GET | / | 分页获取记录 |
| POST | / | 添加新记录 |
| GET | /categories | 获取所有分类 |

### 分类管理 `/api/categories`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | / | 获取所有分类 |
| POST | / | 添加自定义分类 |
| DELETE | /{id} | 删除自定义分类 |

### 统计报表 `/api/statistics`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /monthly | 获取月度统计 |
| GET | /category-distribution | 获取分类分布 |
| GET | /weekly-trend | 获取7天趋势 |
| GET | /yearly-trend | 获取12个月趋势 |

### 预算管理 `/api/budgets`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /?month=YYYY-MM | 获取指定月份预算 |
| POST | / | 添加或更新预算 |
| DELETE | /{id} | 删除预算 |
| GET | /category-spending | 获取分类支出 |
| GET | /categories | 获取可设置预算的分类 |

### 健康检查

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |

## 接口规范

### 统一响应格式

```json
{
    "code": 200,
    "message": "操作成功",
    "data": {}
}
```

### 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 认证方式

除 `/api/users/register`、`/api/users/login`、`/api/health` 外，其他接口需要在请求头中携带 Token：

```
Authorization: Bearer <token>
```

## 前端对接

后端服务默认运行在 `http://localhost:8080/api`

前端只需修改 API 请求的 baseURL，即可对接本后端服务。

## 端口说明

- 后端服务端口：**8080**
- 数据库端口：**3307**（与 Node.js 后端一致）
- 上下文路径：**/api**

## 版本

- v1.0.0 - 初始版本
