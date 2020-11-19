<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="avatar" />
      </div>
      <!-- 登录表单 -->
      <div>
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginFormRules"
          label-width="60px"
          class="login_form"
        >
          <el-form-item label="账号" prop="empId">
            <el-input v-model="loginForm.empId" prefix-icon="el-icon-user"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="empPassword">
            <el-input
              v-model="loginForm.empPassword"
              type="password"
              prefix-icon="el-icon-unlock"
            ></el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginForm: {
        empId: 'lichang',
        empPassword: '123456'
      },
      // 表单验证
      loginFormRules: {
        empId: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        empPassword: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 表单重置按钮
    resetLoginForm () {
      // console.log(this)
      // resetFields：element-ui提供的表单方法
      console.log(this.$refs.loginFormRef)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      // 表单预验证
      // valid：bool类型
      this.$refs.loginFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) return this.$message.error('数据格式不正确')
        // 返回值为promise，可加await简化操作 相应的也要加async
        const { data: res } = await this.$http.post('loginIn', this.loginForm)
        console.log(res)
        if (res.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        // 1、将登陆成功之后的token, 保存到客户端的sessionStorage中; localStorage中是持久化的保存
        //   1.1 项目中出现了登录之外的其他API接口，必须在登陆之后才能访问
        //   1.2 token 只应在当前网站打开期间生效，所以将token保存在sessionStorage中
        window.sessionStorage.setItem('token', res.message)
        window.sessionStorage.setItem('loginId', res.data.empId)
        window.sessionStorage.setItem('loginName', res.data.empName)
        var vb = res.data.empId
        var ws = new WebSocket('ws://192.168.43.164:8080/webSocket/' + vb)
        ws.onopen = function () {
          console.log('websocket')
        }
        var this0 = this
        ws.onmessage = function (evt) {
          console.log('%%%')
          console.log(evt.data)
          this0.$notify({
            title: '提示',
            message: evt.data,
            duration: 0
          })
        }
        ws.onclose = function () {
          console.log('closing')
        }
        // addSubTask
        // var task = {
        //   taskBean: {
        //     subTaskName: 'wer',
        //     subTaskDesc: 'qwretryxcgfg',
        //     subTaskSkillType: 2,
        //     subTaskInProject: 'PRO9H060AHMWH',
        //     subTaskStartTime: null,
        //     subTaskEndTime: null,
        //     totalFileCount: 5
        //   },
        //   leadingPath: null,
        //   succeedingPath: null,
        //   isChain: false
        // }
        // // var task = {
        // //   subTaskId: 'TASK4AQAGDC5Q'
        // // }
        // const { data: rrr } = await this.$http.post('addSubTask', task)
        // console.log(rrr)
        // var task = {
        //   subTaskId: 'TASKOEWPPOKCD',
        //   subTaskName: 'wer',
        //   subTaskDesc: 'qwretryxcgfg',
        //   totalFileCount: 5,
        //   SubTaskCanOutSource: 1
        // }
        // const { data: rrr } = await this.$http.post('modifySubTask', task)

        // var task = {
        //   subTaskId: 'TASKOEWPPOKCD'
        // }
        // const { data: rrr } = await this.$http.post('forceCompleteSubTask', task)
        // var task = {
        //   subTaskID: 'TASKOEWPPOKCD',
        //   isChain: false
        // }
        // const { data: rrr } = await this.$http.post('restartSubTask', task)
        // var task = {
        //   subTaskID: 'TASKOEWPPOKCD',
        //   empID: 'lichang'
        // }
        // const { data: rrr } = await this.$http.post('setSubTaskPerson', task)
        // var task = {
        //   projectId: 'PRO9H060AHMWH'
        // }
        // const { data: rrr } = await this.$http.post('enableProject', task)
        // console.log(rrr)
        // var task = {
        //   projectId: 'PRO9H060AHMWH'
        // }
        // const { data: rrr } = await this.$http.post('abandonProject', task)
        // var task = {
        //   projectId: 'PRO9H060AHMWH'
        // }
        // const { data: rrr } = await this.$http.post('restartProject', task)
        // var task = {
        //   projectId: 'PRO9H060AHMWH'
        // }
        // const { data: rrr } = await this.$http.post('projectCompleteApply', task)
        // var task = {
        //   projectId: 'PRO9H060AHMWH'
        // }
        // const { data: rrr } = await this.$http.post('completeProject', task)
        // var task = {
        //   projectId: 'PRO9H060AHMWH',
        //   projectName: '第一个项目',
        //   proManagerId: '',
        //   projectDesc: 'qwerw',
        //   projectState: 1,
        //   projectStartTime: new Date(),
        //   projectEndTime: new Date()
        // }
        // const { data: rrr } = await this.$http.post('modifyProject', task)
        // var task = {
        //   projectID: 'PRO9H060AHMWH',
        //   empID: 'lishilong'
        //
        // }
        // const { data: rrr } = await this.$http.post('setProjectManager', task)
        // var task = {
        //   projectID: 'PRO9H060AHMWH',
        //   empIDs: [
        //     'lichang',
        //     'weiwucai'
        //   ]
        // }
        // const { data: rrr } = await this.$http.post('addProjectPerson', task)
        // var task = {
        //   helpersID: '马六',
        //   subTaskId: '1-1'
        // }
        // const { data: rrr } = await this.$http.post('outSourcingApply', task)
        // var task = {
        //   applicantID: '李四',
        //   helpersID: '马六',
        //   subTaskId: '1-1'
        // }
        // const { data: rrr } = await this.$http.post('outSourcingHandover', task)
        // var task = {
        //   helpersID: '马六',
        //   subTaskId: '1-1'
        // }
        // const { data: rrr } = await this.$http.post('outSourcingRecovery', task)
        // var task = {
        //   subTaskId: '1-1'
        // }
        // const { data: rrr } = await this.$http.post('subTaskCompleteApply', task)
        // var task = {
        //   subTaskId: '1-1'
        // }
        // const { data: rrr } = await this.$http.post('subTaskCompleteConclusion', task)
        // var task = {
        //   subTaskId: '1-1'
        // }
        // const { data: rrr } = await this.$http.post('subTaskCompleteRejection', task)
        // const { data: rrr } = await this.$http.post('getEmpDoingProject')
        // // const { data: rrr } = await this.$http.post('EmpHasDgetoneProject')
        // // const { data: rrr } = await this.$http.post('getEmpHasDoneTask')
        // const { data: rrr1 } = await this.$http.post('EmpgetDoingTask')
        // console.log(rrr)
        // console.log(rrr1)
        window.sessionStorage.setItem('ws', ws)
        // 2、通过编程式导航跳转到后台主页, 路由地址为：/home
        if (res.data.empType === 0) {
          this.$router.push('/admin')
        } else {
          this.$router.push('/employee')
        }
      })
    }
  }
}
</script>

<style scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  width: 600px;
  height: 420px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  -webkit-transform: translate(-50%, -50%);
  background-color: #fff;
}
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}
img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}
.login_form {
  position: absolute;
  bottom: 60px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: center;
}
.info {
  font-size: 13px;
  margin: 10px 15px;
}
</style>
