package com.finance;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 财务管家 - 主启动类
 *
 * @author Finance Team
 * @version 1.0.0
 */
@SpringBootApplication
@MapperScan("com.finance.mapper")
public class FinanceManagerApplication {

    public static void main(String[] args) {
        SpringApplication.run(FinanceManagerApplication.class, args);
        System.out.println("""

            ╔═══════════════════════════════════════════════════════════╗
            ║                                                           ║
            ║     财务管家后端服务启动成功！                         ║
            ║                                                           ║
            ║     Swagger文档: http://localhost:8080/api/doc.html      ║
            ║     API文档:   http://localhost:8080/api/swagger-ui     ║
            ║                                                           ║
            ╚═══════════════════════════════════════════════════════════╝
            """);
    }
}
