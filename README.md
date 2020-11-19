# 文档参考 https://shimo.im/docs/DRYKPPDyThk6xYKH/ 
# 2020级吉林大学卓班软件工程software_project作业 兼 html5作业
任务描述：
问题：
某单位的日常工作为完成一些项目任务，项目任务由A、B、C三类子任务顺序构成且三类子任务的顺序在任务确定之初随机产生；单位有若干人员，按工作性质分为三类，分别可以执行A、B、C类工作；当一个任务被确定需要实施时，首先确定子任务顺序和各子任务的实施人员，然后按顺序实施。
任务：
实现业务软件系统以完成项目任务的执行管理。
要求：
可以灵活的进行人员的管理和项目任务分配
项目依据项目号区别并可根据执行顺序相互区分，当任务确认执行时随机为项目的子任务指定执行人员，此过程可以人工更改指定人员。
每个工作人员以自己的唯一标识员工号登录进入系统，系统的操作页面仅显示权限所限定的操作。
员工进入系统后应可以显示待执行的工作任务，若有实时发生的任务可以接到任务提醒。
员工特殊情况下可以将自己的项目任务指定给可以完成该类任务的任何员工暂时执行并可以收回该指定并可以设置时间限期收回该指定。
员工只能对自己被分配的项目执行情况可见
有若干特殊权限的人员可以启动项目并对项目顺序和项目执行人员进行指定；可以可见所有项目的执行情况并有终止某项目或重启某项目的权限。
假设项目的各子任务是在对应该项目的word文档中写入自身的子任务符号和员工号。

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
