### fast-api

基于apifox开放接口文档，自动生成接口请求、接口文档、TypeScript 类型定义文件

#### 配置文件
**configOptions** 配置可参考[apifox开放接口文档](https://apifox-openapi.apifox.cn/api-173411997)配置

```javascript
{
  version?: string; //default 2024-03-28
  Authorization: string; // apifox authorization
  projectId: string; // 需要生成的项目id
  configOptions: IConfigOptions;
  input?: {
    // http 入口文件 需对外暴露get post 不传则去模版生成
    httpFilePath?: string;
  };
  output?: {
    // 模型文件目录 default  /src/services/modal
    modalDir?: string;
    // 接口文件目录 default /src/services/apis
    apiDir?: string;
  };
}

```

![PlantUML](https://www.plantuml.com/plantuml/png/dLJBRjf05DtxAqRg9f7w1V6YwQPHT_s5g3714W_Bc4Lt90LZGdb81Gfvf8b24vegDb5K0fZGd_4Tst_HCHVPWoLBLNV3lUUSEtFkmRi5RL_LYjcCi3e8EvvbGwldLnhkYqbxLSUUYAmu_knsHh0eqSwIDdz0wuRMQmn6ksFQC4NXKCqN5V8g8n-cjJrLad84Ep0ikssT28JiqAiPAo3PcPuuqpfJ1qDtxRB8-gZWThvJexqNdD_96OcEhk6opheXVmN3QtbtD_IoZO8uBT3PL7hxuJsdmLIG1DKvL1ZlcESH8gUsiEO-sepZJET8VhDDjBIKszBKehIDs43BMLvultkqC_7FT34gusIKsDINCWNfdt2v0pabh4_u7lJ0Fsf0KmyV5NCBxoCAF2qwhNVapE_Ssazancn7A_SL6VsDsOupo86aC4qfzr6M2ciUNYQQZaOQGzfxI6kQ4hGllj6-1UrRPgbNlGVpr9dLugwYftOp1BXd9hnqmLgmNNdMCtqyfhqPVUhYZD1CPFbstpE7oPJGr-30VYKy7U6ip_aTFPu12WbXWIyLQF-Y0zCldM8b8JKuKFkaCF_GwDUW3zXzUIuN9pchv5MDW3M3UGUx9ANcisGb4OyMdvveVRmLq3e9uuzol0MyNNpuedCiDD66CI_yvyFvSqsFh30IN1ZExn4Hxjfxjc1PZbkMaANrbX_wS3wAKqAITwi7lYvAK7d2yD7QL_OpJWYD1kFA7mpZKyGDoB01nYI2W35EnkCU-FNyXqmaWk7bLq48__SkQ7b5s6K5zYt_2m00)

```plantuml
@startuml fast-api 工作流程
start
:读取配置文件;
:调用开放接口拉取数据;
group #lightGreen 数据处理 
  :根据接口上下文分组;
  group 生成GroupFile模型
    :根据group文件解析接口数据;
    group 生成API模型
      :解析出入参数据;
      if(参数类型为模型?) then(true)
        :依赖收集;
        :生成类型数据;
      else
        :生成类型数据;
      endif
    end group
    :遍历API模型生成GroupFile依赖;
  end group
end group

group 产物生成
  group 生成接口api文件
    :根据groupFile dependencies 生成模型依赖;
    if(判断http模块是否为自定义?) then(true)
      :从自定义目录导入请求方法;
    else
      :从默认目录导入请求方法;
    endif    
    group 生成接口api方法
      :遍历groupFile apis;
      if(参数类型包含普通类型?) then(true)
        :生成types 文件,写入普通类型;
        :import 对应类型 from types;
      else
      endif
      :根据请求方法及出入参类型生成接口方法;
    end group
  end group
  group 生成模型文件
    :读取接口数据;
    :读取配置信息,获取产物目录;
    :生成模型文件;
  end group
  group 生成http模块
    :读取配置信息;
    if(http模块未配置自定义路径?) then(true)
      if(判断http模块目录存在?) then(true)
        if(覆写开关是否打开?) then(true)
          :删除http模块目录;
          :复制http模块到http模块目录;
        endif
      else
        :复制http模块到http模块目录;
      endif
    endif 
  end group  
end group

stop
@enduml
```