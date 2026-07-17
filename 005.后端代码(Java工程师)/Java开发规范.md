# Java 开发规范文档

> 本规范适用于基于 Spring Boot 的 Java 后端项目开发，遵循阿里巴巴 Java 开发手册及业界最佳实践。

## 一、项目结构规范

### 1.1 标准分层结构

```
src/main/java/com/{公司}/{业务模块}/
├── {Application}.java              # 启动类
├── config/                          # 配置层
│   ├── WebConfig.java              # Web 配置
│   ├── SwaggerConfig.java          # 文档配置
│   └── CorsConfig.java            # 跨域配置
├── controller/                      # 控制层
│   └── {Module}Controller.java
├── service/                         # 服务层
│   ├── {Module}Service.java        # 服务接口
│   └── impl/
│       └── {Module}ServiceImpl.java # 服务实现
├── mapper/                         # 数据访问层
│   └── {Module}Mapper.java
├── entity/                         # 实体类
│   ├── {Module}.java             # 主实体
│   ├── Req.java                  # 请求DTO
│   └── Resp.java                  # 响应DTO
├── dto/                            # 数据传输对象
│   ├── req/                       # 请求DTO
│   └── resp/                       # 响应DTO
├── common/                          # 通用类
│   ├── Result.java                 # 统一响应
│   ├── Constants.java              # 常量类
│   └── enums/                      # 枚举
└── utils/                          # 工具类
```

### 1.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | UpperCamelCase | `UserController` |
| 方法名 | lowerCamelCase | `getUserById` |
| 变量名 | lowerCamelCase | `userName` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT` |
| 包名 | 全小写 | `com.example.common` |
| 枚举值 | UPPER_SNAKE_CASE | `STATUS_OK` |

## 二、代码编写规范

### 2.1 类和接口命名

```java
// ✅ 正确示例
@RestController      // 控制器
@Service             // 服务
@Repository         // 数据访问
@Configuration       // 配置类
@Component           // 组件
public class UserController {}
public interface UserService {}
public class OrderMapper {}

// ❌ 错误示例
public class userController {}
public class User_Controller {}
public class controller {}
```

### 2.2 方法命名规范

```java
// CRUD 操作
public User getUserById(Long id) {}           // 单条查询
public List<User> listUsers(UserQuery query) {}  // 列表查询
public Page<User> pageUsers(int page, int size) {} // 分页查询
public boolean saveUser(User user) {}           // 新增
public boolean updateUser(User user) {}         // 更新
public boolean deleteUser(Long id) {}           // 删除
public boolean removeUser(Long id) {}           // 批量删除
public boolean batchSave(List<User> users) {}   // 批量新增

// 校验方法
public boolean checkUserExist(String name) {}    // 检查是否存在
public boolean isAdmin(Long userId) {}          // 判断权限

// 异步方法
public CompletableFuture<Result> asyncProcess() {}
```

### 2.3 集合处理

```java
// ✅ 正确：使用工具类判断
if (CollectionUtils.isEmpty(list)) { return; }
if (StringUtils.isBlank(str)) { return; }

// ✅ 正确：使用下标获取元素前判空
if (list != null && !list.isEmpty()) {
    String first = list.get(0);
}

// ❌ 错误：直接操作可能为 null 的集合
if (list.size() > 0) {}        // NPE 风险
if (list.isEmpty()) {}            // 可能 NPE
```

### 2.4 String 处理

```java
// ✅ 正确：使用 StringUtils
String.trim()           // 去空格
StringUtils.isBlank()    // 判空
StringUtils.defaultIfEmpty() // 空时默认值
String.join(",", list)   // 拼接

// ✅ 正确：StringBuilder 拼接
StringBuilder sb = new StringBuilder();
sb.append(str).append(" | ");

// ❌ 错误：+ 号拼接大量字符串
String s = s1 + s2 + s3;  // 循环内禁止
```

### 2.5 判空处理

```java
// ✅ 推荐：Optional 判空
Optional.ofNullable(user)
    .map(User::getName)
    .orElse("默认");

// ✅ 推荐：链式调用
String name = Optional.ofNullable(user)
    .map(User::getProfile)
    .map(Profile::getName)
    .orElse("匿名");

// ✅ 参数校验
public Result saveUser(@Valid @RequestBody UserDTO dto) {}

// ✅ 手动判空
if (Objects.isNull(obj)) { return; }
if (Objects.nonNull(obj)) { }
```

## 三、接口规范

### 3.1 统一响应格式

```java
// ✅ 统一响应结构
@Data
public class Result<T> implements Serializable {
    private Integer code;
    private String message;
    private T data;

    public static <T> Result<T> success() {
        return new Result<>(200, "操作成功", null);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "操作成功", data);
    }

    public static <T> Result<T> error(String message) {
        return new Result<>(500, message, null);
    }
}

// ✅ 响应示例
{
    "code": 200,
    "message": "操作成功",
    "data": {
        "id": 1,
        "name": "张三"
    }
}
```

### 3.2 HTTP 状态码

| 场景 | 状态码 | 说明 |
|------|--------|------|
| 成功 | 200 | 操作成功 |
| 创建成功 | 201 | 资源创建成功 |
| 参数错误 | 400 | 请求参数校验失败 |
| 未授权 | 401 | 需要登录认证 |
| 无权限 | 403 | 权限不足 |
| 资源不存在 | 404 | 数据不存在 |
| 服务器错误 | 500 | 内部异常 |

### 3.3 请求注解规范

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping("/{id}")           // GET 查询
    @PostMapping                  // POST 新增
    @PutMapping("/{id}")           // PUT 更新
    @DeleteMapping("/{id}")        // DELETE 删除
    @RequestMapping(method = POST)  // RESTful
}
```

### 3.4 参数校验

```java
// ✅ 请求DTO 加上校验注解
@Data
public class UserSaveDTO {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 20, message = "用户名2-20位")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码至少6位")
    private String password;

    @Email(message = "邮箱格式错误")
    private String email;

    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式错误")
    private String mobile;
}

// ✅ 控制器接收校验
@PostMapping
public Result save(@Valid @RequestBody UserSaveDTO dto) {}

// ✅ 校验分组
public @interface AddGroup {}
public @interface UpdateGroup {}

@NotBlank(groups = UpdateGroup.class)
private Long id;
```

### 3.5 分页查询

```java
// ✅ 分页请求DTO
@Data
public class PageQuery {
    @Min(value = 1, message = "页码最小为1")
    private Integer page = 1;

    @Max(value = 100, message = "每页最多100条")
    private Integer size = 10;
}

// ✅ 分页响应
@Data
public class PageResult<T> {
    private List<T> records;      // 数据列表
    private Long total;           // 总记录数
    private Integer pageNum;      // 当前页
    private Integer pageSize;     // 每页条数
    private Integer totalPages;   // 总页数
}
```

## 四、异常处理规范

### 4.1 异常分类

| 异常类型 | 使用场景 |
|----------|----------|
| `IllegalArgumentException` | 参数校验失败 |
| `NullPointerException` | 空指针（应提前判空避免） |
| `BusinessException` | 业务逻辑异常 |
| `UnauthorizedException` | 未授权 |
| `AccessDeniedException` | 无权限 |

### 4.2 全局异常处理

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result handleBusiness(BusinessException e) {
        log.warn("业务异常: {}", e.getMessage());
        return Result.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Result handleValid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldError().getDefaultMessage();
        return Result.error(400, msg);
    }

    @ExceptionHandler(Exception.class)
    public Result handleException(Exception e) {
        log.error("系统异常", e);
        return Result.error(500, "系统繁忙，请稍后重试");
    }
}
```

### 4.3 异常使用原则

```java
// ✅ 正确：业务异常用于明确告知调用方
if (!userExist) {
    throw new BusinessException("用户不存在");
}

// ✅ 正确：参数校验用 IllegalArgumentException
if (id == null) {
    throw new IllegalArgumentException("ID不能为空");
}

// ❌ 错误：捕获后直接抛出 RuntimeException
try {
    // do something
} catch (Exception e) {
    throw new RuntimeException(e);
}
```

## 五、数据库操作规范

### 5.1 SQL 编写

```xml
<!-- ✅ Mapper.xml 使用通用 ResultMap -->
<resultMap id="BaseResultMap" type="com.finance.entity.User">
    <id column="id" property="id"/>
    <result column="created_at" property="createdAt"/>
</resultMap>

<!-- ✅ 动态 SQL 使用 <where> 包裹 -->
<select id="selectPage" resultMap="BaseResultMap">
    SELECT * FROM users
    <where>
        <if test="username != null and username != ''">
            AND username LIKE CONCAT('%', #{username}, '%')
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
    </where>
    ORDER BY id DESC
</select>

<!-- ✅ 批量操作使用 <foreach> -->
<insert id="batchInsert">
    INSERT INTO user (name, email) VALUES
    <foreach collection="list" item="item" separator=",">
        (#{item.name}, #{item.email})
    </foreach>
</insert>
```

### 5.2 事务处理

```java
// ✅ Service 层方法加事务
@Transactional(rollbackFor = Exception.class)
public void transfer(TransferDTO dto) {
    // 转账逻辑
    accountMapper.deduct(dto.getFromId(), dto.getAmount());
    accountMapper.add(dto.getToId(), dto.getAmount());
}

// ✅ 读写分离标注
@ReadOnly(true)
public List<User> listAll() {}

// ❌ 错误：Controller 层加事务
@RestController
@Transactional  // 不要在 Controller 加事务
```

### 5.3 数据更新规范

```java
// ✅ 更新时检查影响行数
int rows = userMapper.updateById(user);
if (rows == 0) {
    throw new BusinessException("用户不存在");
}

// ✅ 删除前检查存在性
User user = userMapper.selectById(id);
if (user == null) {
    throw new BusinessException("用户不存在");
}
userMapper.deleteById(id);
```

## 六、日志规范

### 6.1 日志级别

| 级别 | 使用场景 |
|------|----------|
| ERROR | 影响流程的异常，需人工处理 |
| WARN | 警告，如参数错误、容错处理 |
| INFO | 关键业务节点，如登录、支付 |
| DEBUG | 开发调试，线上关闭 |
| TRACE | 详细追踪，线上关闭 |

### 6.2 日志打印

```java
// ✅ 使用占位符
log.info("用户登录: userId={}, username={}", userId, username);

// ✅ 敏感信息脱敏
log.info("手机号: {}", DesensitizeUtil.mobile(phone));
log.info("身份证: {}", DesensitizeUtil.idCard(idCard));

// ❌ 不要在日志中打印密码
log.info("password={}", password);  // 禁止
log.info("用户注册: {}", JSON.toJSONString(user)); // 禁止，密码会泄漏
```

### 6.3 日志文件

```yaml
# logback-spring.xml 配置
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <file>logs/app.log</file>
    <rollingPolicy>
        <maxFileSize>100MB</maxFileSize>
        <maxHistory>30</maxHistory>
    </rollingPolicy>
</appender>
```

## 七、Git 提交规范

### 7.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<body>

<body>

<footer>
```

### 7.2 Type 类型

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 bug |
| docs | 文档变更 |
| style | 代码格式（不影响功能）|
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具变更 |

### 7.3 提交示例

```
feat(user): 新增用户注册接口

实现用户注册功能，支持手机号注册
- 发送验证码
- 校验验证码
- 创建用户

Closes #123
```

## 八、代码审查清单

| 检查项 | 说明 |
|--------|------|
| 参数校验 | 必填参数是否校验 |
| 判空处理 | 对象、集合、字符串是否判空 |
| 事务一致性 | 多表操作是否在事务内 |
| 并发安全 | 共享资源是否加锁 |
| SQL 性能 | 索引、慢查询 |
| 日志规范 | 日志级别、敏感信息 |
| 安全漏洞 | SQL 注入、XSS、CSRF |
| 接口幂等 | 重试是否安全 |
| 异常处理 | 是否全局捕获 |

## 九、Maven 依赖管理

### 9.1 依赖原则

- 优先使用 Spring Boot Starter
- 统一版本管理
- 禁止直接引用具体实现类
- 间接依赖版本冲突时显式声明

### 9.2 依赖范围

| Scope | 说明 |
|-------|------|
| compile | 编译、运行都有效 |
| provided | 编译有效，容器已提供 |
| runtime | 运行有效 |
| test | 仅测试有效 |

### 9.3 依赖管理

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson2</artifactId>
            <version>2.0.40</version>
        </dependency>
    </dependencies>
</dependencyManagement>
```

## 十、其他规范

### 10.1 代码格式化

```java
// ✅ 使用 IDE 格式化
// IDEA: Ctrl+Alt+L
// Eclipse: Ctrl+Shift+F

// ✅ 静态导入顺序
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import com.example.User;
```

### 10.2 常量定义

```java
// ✅ 状态码常量
public class StatusCode {
    public static final int SUCCESS = 200;
    public static final int ERROR = 500;
    public static final int UNAUTHORIZED = 401;
}

// ✅ 枚举类
public enum UserStatus {
    ENABLE(1, "启用"),
    DISABLE(0, "禁用");

    private final int code;
    private final String desc;
}
```

### 10.3 并发处理

```java
// ✅ 多线程共享资源加锁
private final ReentrantLock lock = new ReentrantLock();

public void update() {
    lock.lock();
    try {
        // 临界区操作
    } finally {
        lock.unlock();
    }
}

// ✅ 使用并发容器
ConcurrentHashMap<Long, User> cache = new ConcurrentHashMap<>();
CopyOnWriteArrayList<User> list = new CopyOnWriteArrayList<>();
```

---

## 附录

### A. 常用工具类

| 工具 | 用途 |
|------|------|
| Hutool | 工具集 |
| Lombok | 自动生成 getter/setter |
| Guava | Google 工具集 |
| Apache Commons | 字符串、集合工具 |

### B. 常用注解

| 注解 | 说明 |
|------|------|
| `@Slf4j` | 日志 |
| `@Data` | Getter/Setter |
| `@NoArgsConstructor` | 无参构造 |
| `@AllArgsConstructor` | 全参构造 |
| `@Builder` | 构建者模式 |
| `@Value` | 不可变对象 |
| `@Validated` | 参数校验 |
| `@Async` | 异步执行 |

### C. 快速修复

| 问题 | 修复 |
|------|------|
| NPE | Objects.requireNonNullElse |
| 循环依赖 | 重构代码结构 |
| 事务失效 | 检查同类内部调用 |
| 数据不一致 | 添加事务+锁 |

---

> 本规范基于阿里巴巴 Java 开发手册及业界最佳实践制定
> 版本: v1.0.0
> 更新日期: 2026-07-16
