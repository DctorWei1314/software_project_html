<template>
  <el-container>
    <el-header>
      <div>
        <img src="../assets/logo.png" alt=""/>
        <span>员工界面</span>
      </div>
      <el-badge :value="messageNum" class="item">
        <el-button type="warning" icon="el-icon-message" size="small" circle @click="msg"></el-button>
      </el-badge>
      <el-button type="info" @click="quit">退出账号</el-button>
    </el-header>
    <el-container>
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          :collapse="false"
          :collapse-transition="false"
          router
          :default-active="actinvePath"
        >
          <el-submenu :index="item.id+''" v-for=" item in menuList" :key="item.id+''" >
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{item.name}}</span>
            </template>
            <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState(subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.name}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-dialog
        title="邮箱信息"
        :visible.sync="dialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-alert v-for="item in message"
                  :key="item"
                  :type="item.notifyType===1?'warning':'info'"
                  :closable="item.notifyType===1?false:true"
                  show-icon
                  @close="deleteMsg(item.notifyInfoId,item)"
        >
          {{item.info}}
<!--          {-->
<!--          info: '',-->
<!--          notifyType: 1,-->
<!--          receiverId: '',-->
<!--          senderId: '',-->
<!--          infoHasRead: false-->
<!--          }-->
          <el-popconfirm
            title="是否接受外包？"
            icon="el-icon-info"
            confirmButtonText='接受'
            cancelButtonText='拒绝'
            iconColor="red"
            @onConfirm="confirm(item.notifyInfoId)"
            @onCancel="cancel(item.notifyInfoId)"
            v-if="item.notifyType===1"
          >
            <el-button slot="reference" type="info">回应</el-button>
          </el-popconfirm>
        </el-alert>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
      </el-dialog>
  </el-container>
  </el-container>
</template>

<script>

export default {
  name: 'Employee',
  created () {
    this.getMenuList()
    this.actinvePath = sessionStorage.getItem('activePath')
    this.getEmail()
  },
  methods: {
    msg () {
      this.dialogVisible = true
      this.getEmail()
    },
    async deleteMsg (notifyInfoId, item) {
      var info = {
        notifyInfoId: notifyInfoId
      }
      const { data: res } = await this.$http.post('deleteNotify', info)
      console.log(res)
      // console.log('@@@')
    },
    async confirm (item) {
      console.log('qqq')
      var info = {
        notifyInfoId: item
      }
      const { data: res } = await this.$http.post('outSourcingHandover', info)
      for (let i = 0; i < this.message.length; i++) {
        if (this.message[i].notifyInfoId === item) {
          this.message[i].notifyType = 0
          break
        }
      }
      console.log(res)
      console.log('OOOOO')
      if (window.sessionStorage.getItem('activePath') === '/employeehome') {
        this.$router.push('/employeehome')
      }
    },
    async cancel (item) {
      console.log('eee')
      var info = {
        notifyInfoId: item
      }
      const { data: res } = await this.$http.post('outSourcingReject', info)
      for (let i = 0; i < this.message.length; i++) {
        if (this.message[i].notifyInfoId === item) {
          this.message[i].notifyType = 0
          break
        }
      }
      console.log(res)
      console.log('OOOOO')
    },
    quit () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList () {
      // const { data: res } = await this.$http.get('menus')
      // console.log(res)
      // if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // this.menuList = res.data
    },
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    saveNavState (actinvePath) {
      window.sessionStorage.setItem('activePath', actinvePath)
      this.actinvePath = actinvePath
    },
    async getEmail () {
      var info = {
        empId: window.sessionStorage.getItem('loginId')
      }
      const { data: rrr } = await this.$http.post('getEmpNotify', info)
      console.log(rrr)
      console.log('www')
      this.message = rrr.data
      this.messageNum = this.message.length
    }
  },
  data () {
    return {
      message: [],
      messageNum: 0,
      isCollapse: false,
      menuList: [
        {
          name: '任务首页',
          id: '1',
          children: [
            {
              path: '/employeehome',
              id: '1',
              name: '任务总览'
            }]
        },
        {
          name: '实时任务',
          id: '1',
          children: [
            {
              path: '/respproject',
              id: '1',
              name: '负责项目'
            },
            {
              path: '/resptask',
              id: '2',
              name: '负责任务'
            },
            {
              path: '/outtask',
              id: '3',
              name: '外包任务'
            }
          ]
        },
        {
          name: '信息记录',
          id: '2',
          children: [
            {
              path: '/projectrecord',
              id: '2',
              name: '项目记录'
            },
            {
              path: '/employeeInfo',
              id: '4',
              name: '个人提交信息'
            }
          ]
        }
      ],
      actinvePath: '',
      dialogVisible: false
    }
  }
}
</script>

<style scoped>
.el-header {
  background-color: #B3C0D1;
  color: #ffff;
  font-size: 25px;
  text-align: center;
  text-height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
div{
  align-items: center;
}
img{
  height: 60px;
  width: 60px;
}
span{
  margin-left: 15px;
}

.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px;
}

.el-menu{
  border-right: none;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  line-height: 80px;
}

.el-container{
  height: 100%;
}

.toggle-button{
  background-color:#E9EEF3;
  font-size: 10px;
  line-height: 24px;
  color:#fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor:pointer;
}
</style>
