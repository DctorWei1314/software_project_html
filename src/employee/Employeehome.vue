<template>
<div>
  <el-card>
    <el-row :class="['bdbottom','bdtop', 'vcenter']">
      <el-col :span="5" ><el-tag>进行中的项目</el-tag></el-col>
      <el-col  :span="19">
        <el-row v-for="(item,index0) in user.workingproject" :key="index0+''" :class="['bdbottom', index0 === 0 ? 'bdtop' : '', 'vcenter']">
          <el-col :span="4">
            <el-button v-if="item.proManagerId !== empId" type="primary" icon="el-icon-folder-delete" circle disabled>{{item. projectId}}</el-button>
            <el-button v-else type="warning" icon="el-icon-s-custom" circle @click="gogo(item.projectId)">{{item.projectId}}</el-button>
          </el-col>
          <el-col :span="15">
            <el-row v-for="(subitem,index1) in item.tasks" :key="index1+''">
              <el-button :type="statetostring(subitem.subTaskState)" :icon="statetoicon(subitem.doType)" round @click="goto(subitem)">{{subitem.subTaskId}}</el-button>
              <!--                    <el-tag  :type="statetostring(subitem.state)" :icon="statetoicon(subitem.state)">{{subitem.name}}</el-tag>-->
            </el-row>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <el-collapse accordion >
      <el-collapse-item>
        <template slot="title">
          <i class="header-icon el-icon-info">历史工作记录</i>
          <el-button @click="historyclick" style="width: 2000px;background-color: #FFF;border-color: #FFF"></el-button>
        </template>
        <el-row :class="['bdbottom','bdtop', 'vcenter']">
          <el-col :span="5"><el-tag type='success'>已完成的项目</el-tag></el-col>
          <el-col :span="19">
            <el-row v-for="(item,index) in user.doneproject" :key="index" :class="['bdbottom',index === 0 ? 'bdtop' : '', 'vcenter']">
              <el-col :span="4">
                <el-button v-if="item.proManagerId !== empId" type="success" icon="el-icon-folder-checked" circle disabled>{{item.name}}</el-button>
                <el-button v-else type="warning" icon="el-icon-s-custom" circle>{{item.name}}</el-button>
              </el-col>
              <el-col :span="15">
                <el-row v-for="subitem in item.task" :key="subitem">
                  <el-button :type="statetostring(subitem.state)" :icon="statetoicon(subitem.state)" round>{{subitem.name}}</el-button>
                </el-row>
              </el-col>
            </el-row>
          </el-col>
        </el-row>
      </el-collapse-item>
    </el-collapse>
  </el-card>
</div>
</template>

<script>
export default {
  name: 'Employeehome',
  data () {
    return {
      empId: '',
      user: {
        number: 123,
        name: 'xiaoming',
        type: 'C',
        workingnum: 2,
        finishnum: 3,
        doneproject: [],
        workingproject: []
      }
    }
  },
  methods: {
    goto (id) {
      window.sessionStorage.setItem('currentTask', id.subTaskId)
      if (id.doType === 0) {
        if (id.subTaskState === 4) {
          this.$router.push('/employeetask')
        } else if (id.subTaskState === 0) {
          console.log('222')
        } else if (id.subTaskState === 2) {
          this.$router.push('/temp')
        } else {
          this.$router.push('/resptask')
        }
      } else if (id.doType === 1) {
        if (id.subTaskState === 4) {
          this.$router.push('/employeetask')
        } else if (id.subTaskState === 0) {
        } else {
          this.$router.push('/outtask')
        }
      } else if (id.doType === 2) {
        // this.$router.push('/admin')
        this.$router.push('/employeetask')
      }
    },
    gogo (road) {
      window.sessionStorage.setItem('project', road)
      this.$router.push('/respproject')
    },
    statetostring (state) {
      console.log('2342435')
      if (state === 0) return ''
      if (state === 1) return 'primary'
      if (state === 2) return 'info'
      if (state === 3) return 'warning'
      if (state === 4) return 'success'
    },
    statetoicon (state) {
      if (state === 0) return 'el-icon-user-solid'
      if (state === 1) return 'el-icon-star-on'
      if (state === 2) return 'el-icon-star-off'
      // if (state === 4) return 'el-icon-star-off'
    },
    async historyclick () {
      const { data: rrr } = await this.$http.post('getEmpHasDoneProject')
      var array = rrr.data
      console.log(rrr)
      console.log('@@@@')
      this.user.doneproject = rrr.data
      // console.log(this.user.workingproject)
      var newarray = []
      for (var index = 0; index < this.user.doneproject.length; index++) {
        var info = {
          projectId: this.user.doneproject[index].projectId,
          empId: window.sessionStorage.getItem('loginId')
        }
        const { data: rrr0 } = await this.$http.post('getTaskByProIdEmpId', info)
        for (let i = 0; i < rrr0.data.length; i++) {
          var g = {
            subTaskId: rrr0.data[i].subTaskId
          }
          const { data: v } = await this.$http.post('getSubTask', g)
          console.log(v)
          console.log('v')
          if (v.data !== null) {
            rrr0.data[i] = Object.assign(rrr0.data[i], { subTaskState: v.data.subTaskState })
          } else {
            rrr0.data[i] = Object.assign(rrr0.data[i], { subTaskState: -2 })
          }
        }
        console.log(rrr0)
        console.log('taskInfo test')
        var q = Object.assign(array[index], { tasks: rrr0.data })
        newarray[index] = q
      }
      this.user.doneproject = newarray
    },
    async init () {
      this.empId = window.sessionStorage.getItem('loginId')
      // console.log(this.empId)
      const { data: rrr } = await this.$http.post('getEmpDoingProject')
      var array = rrr.data
      console.log(rrr)
      console.log('@@@@')
      this.user.workingproject[0] = rrr.data[0]
      var l = 1
      for (let i = 1; i < rrr.data.length; i++) {
        var flag = true
        for (let j = 0; j < this.user.workingproject.length; j++) {
          if (this.user.workingproject[j].projectId === rrr.data[i].projectId) {
            flag = false
            break
          }
        }
        if (flag) {
          this.user.workingproject[l++] = rrr.data[i]
        }
      }
      console.log(this.user.workingproject)
      console.log('%%%%%%%%')
      var newarray = []
      for (var index = 0; index < this.user.workingproject.length; index++) {
        var info = {
          projectId: this.user.workingproject[index].projectId,
          empId: window.sessionStorage.getItem('loginId')
        }
        const { data: rrr0 } = await this.$http.post('getTaskByProIdEmpId', info)
        for (let i = 0; i < rrr0.data.length; i++) {
          var g = {
            subTaskId: rrr0.data[i].subTaskId
          }
          const { data: v } = await this.$http.post('getSubTask', g)
          console.log(v)
          console.log('v')
          if (v.data !== null) {
            rrr0.data[i] = Object.assign(rrr0.data[i], { subTaskState: v.data.subTaskState })
          } else {
            rrr0.data[i] = Object.assign(rrr0.data[i], { subTaskState: -2 })
          }
        }
        console.log(rrr0)
        console.log('taskInfo test')
        var q = Object.assign(array[index], { tasks: rrr0.data })
        newarray[index] = q
      }
      this.user.workingproject = newarray
    }
  },
  async created () {
    window.sessionStorage.setItem('activePath', '/employeehome')
    this.init()
  }
}
</script>

<style scoped>

</style>
