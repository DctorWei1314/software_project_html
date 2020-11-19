<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/employeeadmin' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">实时任务</a></el-breadcrumb-item>
      <el-breadcrumb-item>负责</el-breadcrumb-item>
    </el-breadcrumb>
      <el-card v-if="projectForm.projectState === 4">
        <el-alert
          title="项目冻结中"
          type="error"
          show-icon
          center
          :closable="false">
        </el-alert>
      </el-card>
      <el-steps  v-else :active="projectForm.projectState+1" simple>
        <el-step title="项目建立" icon="el-icon-edit"></el-step>
        <el-step title="项目实施" icon="el-icon-place"></el-step>
        <el-step title="项目验收" icon="el-icon-thumb"></el-step>
        <el-step title="项目结案" icon="el-icon-success"></el-step>
      </el-steps>
      <el-form :model="projectForm" :rules="rules" label-width="150px">
        <el-form-item label="项目id"  prop="id" disabled :key="1">
          <el-input v-model="projectForm.projectId" prefix-icon="el-icon-user-solid" disabled></el-input>
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName" :key="2">
          <el-input v-model="projectForm.projectName" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <el-form-item label="项目描述" prop="projectDesc" :key="3">
          <el-input v-model="projectForm.projectDesc" prefix-icon="el-icon-user-solid" type="textarea">
          </el-input>
        </el-form-item>
        <el-form-item label="项目负责人id" prop="proManagerId" disabled :key="4">
          <el-col span="15">
            <el-input v-model="projectForm.proManagerId" prefix-icon="el-icon-user-solid" disabled></el-input>
          </el-col>
        </el-form-item>
        <el-form-item label="开始时间" prop="projectStartTime" disabled :key="5">
          <el-input v-model="projectForm.projectStartTime" prefix-icon="el-icon-user-solid" disabled></el-input>
        </el-form-item>
        <el-form-item label="截止时间" prop="projectEndTime" :key="6">
          <el-date-picker
            v-model="projectForm.projectEndTime"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          >
          </el-date-picker>
        </el-form-item>
      </el-form>
    <el-divider content-position="center">子任务拓扑图</el-divider>
    <el-card>
      <el-row v-for="(item,i) in taskList" :key="item.subTaskId" :class="['bdbottom',i===0?'bdtop':'']">
        <el-col :span='12'>
          <el-button :class="['task-tag']" v-for="task in item.beforeTasks" :key="task" disabled>id:{{task}}
            <el-progress :width="50" type="circle" :percentage="100*idToTask(task).hasFinishFileCount/idToTask(task).totalFileCount" :status="percentagetostate(100*idToTask(task).hasFinishFileCount/idToTask(task).totalFileCount)"></el-progress>
          </el-button>
          <el-tag v-if="item.beforeTasks.length === 0">暂无前置任务</el-tag>
          <i class="el-icon-right"></i>
          <i class="el-icon-right"></i>
          <el-badge is-dot :hidden="item.subTaskState !== 3">
            <el-button @click="taskInfo(item.subTaskId)" :type="skillToType(item.subTaskSkillType)" :icon="taskToIcon(item.subTaskState)">
              任务id：{{item.subTaskId}}
            </el-button>
          </el-badge>
          <el-input v-model="item.respMan" disabled>
            <el-select slot="prepend" v-model="item.respMan" style="width: 180px" @change="$forceUpdate()">
              <el-option
                v-for="item0 in skillToSelect(item.subTaskSkillType)"
                :key="item0"
                :label="item0.label"
                :value="item0.value"
              >
              </el-option>
            </el-select>
            <el-button @click="setTaskPesp(item.respMan,item.subTaskId)" icon="el-icon-s-tools" slot="append"></el-button>
          </el-input>
          <!--          <el-tag v-for="f in taskRespList" :key="f">{{f}}</el-tag>-->
        </el-col>
        <el-col :span='12'>
          <el-progress :text-inside="true" :stroke-width="24" :percentage="100*item.hasFinishFileCount/item.totalFileCount" :status='percentagetostate(100*item.hasFinishFileCount/item.totalFileCount)'></el-progress>
        </el-col>
      </el-row>
    </el-card>
    <el-divider content-position="center">工程人员池</el-divider>
    <!--      {{this.taskRespList}}-->
    <el-collapse accordion>
      <el-collapse-item>
        <template slot="title">
          <i class="header-icon el-icon-info">外包人员</i>
        </template>
        <el-tag  hit
                 :disable-transitions="false"
                 style="margin-left: 20px ; height: 40px"
                 type="warning"
                 v-for="item in this.outPackList" :key="item" :closable="false">{{item.empId}}</el-tag>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <i class="header-icon el-icon-info">任务负责人</i>
        </template>
        <el-tag  hit
                 :disable-transitions="false"
                 style="margin-left: 20px ; height: 40px"
                 type="success"
                 @close="deleteEmployee(item)"
                 v-for="item in this.taskRespList" :key="item" closable>{{item.value}}</el-tag>
      </el-collapse-item>
      <el-collapse-item>
        <template slot="title">
          <i class="header-icon el-icon-info">项目视查人员</i>
        </template>
      </el-collapse-item>
    </el-collapse>
    <el-divider content-position="center">完成情况总览</el-divider>
    <el-card>
      <div ref="projectchart" style="width: 1000px;height:600px;margin-left: 1000px">
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Respproject',
  data () {
    return {
      taskA: [],
      taskB: [],
      taskC: [],
      RespEditId: '',
      option: {
        // title: {
        //   text: '项目任务完成图'
        // },
        tooltip: {},
        legend: {
          data: ['项目工程总量 (Project Total Quantity)', '实际完成量 (Actual Finished)']
        },
        radar: {
          // shape: 'circle',
          name: {
            textStyle: {
              color: '#fff',
              backgroundColor: '#999',
              borderRadius: 3,
              padding: [3, 5]
            }
          },
          indicator: [
          ]
        },
        series: [{
          name: '666',
          type: 'radar',
          areaStyle: { normal: {} },
          data: [
            {
              value: [],
              name: '项目工程总量 (Project Total Quantity)'
            },
            {
              value: [],
              name: '实际完成量 (Actual Finished)'
            }
          ]
        }]
      },
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      taskList: [],
      relationList: [],
      outPackList: [],
      taskRespList: [],
      total: 0,
      projectForm: { projectId: null, projectName: null, projectDesc: null, projectState: null, proManagerId: null, projectStartTime: null, projectEndTime: null }
      // activities: [{
      //   content: '支持使用图标',
      //   timestamp: '2018-04-12 20:46',
      //   size: 'large',
      //   type: 'primary',
      //   icon: 'el-icon-more'
      // }, {
      //   content: '支持自定义颜色',
      //   timestamp: '2018-04-03 20:46',
      //   color: '#0bbd87'
      // }, {
      //   content: '支持自定义尺寸',
      //   timestamp: '2018-04-03 20:46',
      //   size: 'large'
      // }, {
      //   content: '默认样式的节点',
      //   timestamp: '2018-04-03 20:46'
      // }]
    }
  },
  methods: {
    skillToSelect (skill) {
      if (skill === 1) return this.taskA
      if (skill === 2) return this.taskB
      if (skill === 4) return this.taskC
    },
    skillToType (skill) {
      if (skill === 1) return 'warning'
      if (skill === 2) return 'success'
      if (skill === 4) return 'info'
    },
    async setTaskPesp (Respman) {
      var json = {
        subTaskID: this.task.subTaskId,
        empID: Respman
      }
      const { data: rrr } = await this.$http.post('setSubTaskPerson', json)
      console.log(rrr)
    },
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getProjectList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getProjectList()
    },
    statetostring (state) {
      if (state === 0) return '待规划'
      if (state === 1) return '实施中'
      if (state === 2) return '待验收'
      if (state === 3) return '已完结'
      if (state === 4) return '冻结中'
    },
    percentagetostate (percentage) {
      if (percentage === 100) return 'success'
      if (percentage >= 50) return 'warning'
      return 'exception'
    },
    idToTask (id) {
      // console.log(4444)
      // console.log(id)
      for (let i = 0; i < this.taskList.length; i++) {
        // console.log(this.taskList[i].subTaskId)
        if (this.taskList[i].subTaskId === id) {
          // console.log(this.taskList[i].subTaskId)
          return this.taskList[i]
        }
      }
      return null
    },
    statetotag (state) {
      if (state === 1) return 'warning'
      if (state === 2) return 'success'
      if (state === 3) return 'info'
    },
    showLog (row) {
      this.drawer = true
    },
    async submit_project () {
      const { data: res } = await this.$http.post('projectCompleteApply', this.projectForm)
      console.log(res)
      if (res.status === 200) {
        this.$message.success(res.message)
      }
    },
    taskInfo (subTaskId) {
      window.sessionStorage.setItem('project', this.projectForm.projectId)
      window.sessionStorage.setItem('currentTask', subTaskId)
      this.$router.push('/admintask')
    },
    taskToIcon (state) {
      if (state === 0) return 'el-icon-remove'
      if (state === 1) return 'el-icon-document-delete'
      if (state === 2) return 'el-icon-connection'
      if (state === 3) return 'el-icon-s-check'
      if (state === 4) return 'el-icon-success'
    },
    async initComponent () {
      var value = {
        projectId: window.sessionStorage.getItem('project')
      }
      const { data: pro } = await this.$http.post('getProject', value)
      console.log(pro)
      console.log('qwwe')
      this.projectForm = pro.data
      const { data: rrr } = await this.$http.post('getProjectSubTask', this.projectForm)
      console.log(rrr)
      console.log('test')
      this.taskList = rrr.data
      var max = 1
      this.option.radar.indicator = []
      this.option.series[0].data[0].value = []
      this.option.series[0].data[1].value = []
      for (let i = 0; i < this.taskList.length; i++) {
        const { data: b } = await this.$http.post('getBeforeTaskId', this.taskList[i])
        const { data: repMan } = await this.$http.post('getSubTaskEmpDoSelf', this.taskList[i])
        console.log(repMan)
        console.log('RRRR')
        // eslint-disable-next-line no-unused-vars
        var temp = ''
        if (repMan.data != null) {
          temp = repMan.data.empId
        }
        this.taskList[i] = Object.assign(this.taskList[i], {
          beforeTasks: b.data,
          respMan: temp
        })
        max = max > this.taskList[i].totalFileCount ? max : this.taskList[i].totalFileCount
        this.option.radar.indicator[i] = {
          name: this.taskList[i].subTaskId,
          max: this.taskList[i].totalFileCount
        }
        this.option.series[0].data[0].value[i] = this.taskList[i].totalFileCount
        this.option.series[0].data[1].value[i] = this.taskList[i].hasFinishFileCount
      }
      for (let i = 0; i < this.option.radar.indicator.length; i++) {
        this.option.radar.indicator[i].max = max
        console.log('999999')
      }
      // for (const item in this.option.radar.indicator) {
      //   // item.max = max
      //   console.log(item)
      //   console.log('999999')
      // }
      // console.log(this.taskList[1].beforeTasks[0])
      // console.log(this.idToTask(this.taskList[1].beforeTasks[0]).totalFileCount)
      console.log('$$$$$$$')
      const { data: rel } = await this.$http.post('getProjectInfoById', this.projectForm)
      // console.log(this.projectForm)
      this.relationList = rel.data
      // 0: {empId: "lichang", projectId: "PRO9H060AHMWH", empPosition: 1}
      // 1: {empId: "weiwucai", projectId: "PRO9H060AHMWH", empPosition: 1}
      var newArray0 = []
      var newArray1 = []
      var newArray2 = []
      var newArray3 = []
      var newArray4 = []
      var j = 0
      var k = 0
      var c = 0
      var v = 0
      var r = 0
      console.log(this.relationList)
      const { data: xxx } = await this.$http.post('getProjectEmpInfo', this.projectForm)
      var info = xxx.data
      console.log(xxx)
      console.log('xxx')
      for (var i = 0; i < this.relationList.length; i++) {
        // console.log(this.relationList[i])
        // console.log(1)
        // eslint-disable-next-line no-undef
        console.log('****')
        if (this.relationList[i].empPosition === 1) {
          console.log(this.relationList[i].empId)
          console.log('<<<<<<<')
          for (var i0 = 0; i0 < info.length; i0++) {
            var item = info[i0]
            console.log(item)
            if (item.empId === this.relationList[i].empId) {
              console.log('###########')
              if (item.empSkillType === 1 || item.empSkillType === 3 || item.empSkillType === 5 || item.empSkillType === 7) {
                var flag0 = true
                for (let l = 0; l < newArray0.length; l++) {
                  if (newArray0[l].value === item.empId) {
                    flag0 = false
                    break
                  }
                }
                if (flag0) {
                  newArray0[j++] = {
                    value: this.relationList[i].empId,
                    label: this.relationList[i].empId
                  }
                }
                var flag = true
                for (let l = 0; l < newArray4.length; l++) {
                  if (newArray4[l].value === item.empId) {
                    flag = false
                    break
                  }
                }
                if (flag) {
                  newArray4[r++] = {
                    value: this.relationList[i].empId,
                    label: this.relationList[i].empId,
                    empSkillType: item.empSkillType
                  }
                }
              }
              if (item.empSkillType === 2 || item.empSkillType === 3 || item.empSkillType === 6 || item.empSkillType === 7) {
                // eslint-disable-next-line no-redeclare
                var flag0 = true
                for (let l = 0; l < newArray0.length; l++) {
                  if (newArray0[l].value === item.empId) {
                    flag0 = false
                    break
                  }
                }
                if (flag0) {
                  newArray0[j++] = {
                    value: this.relationList[i].empId,
                    label: this.relationList[i].empId
                  }
                }
                // eslint-disable-next-line no-redeclare
                var flag = true
                for (let l = 0; l < newArray2.length; l++) {
                  if (newArray2[l].value === item.empId) {
                    flag = false
                    break
                  }
                }
                if (flag) {
                  newArray2[c++] = {
                    value: this.relationList[i].empId,
                    label: this.relationList[i].empId,
                    empSkillType: item.empSkillType
                  }
                }
              }
              if (item.empSkillType === 4 || item.empSkillType === 5 || item.empSkillType === 6 || item.empSkillType === 7) {
                // eslint-disable-next-line no-redeclare
                var flag0 = true
                for (let l = 0; l < newArray0.length; l++) {
                  if (newArray0[l].value === item.empId) {
                    flag0 = false
                    break
                  }
                }
                if (flag0) {
                  newArray0[j++] = {
                    value: this.relationList[i].empId,
                    label: this.relationList[i].empId
                  }
                }
                // eslint-disable-next-line no-redeclare
                var flag = true
                for (let l = 0; l < newArray3.length; l++) {
                  if (newArray3[l].value === item.empId) {
                    flag = false
                    break
                  }
                }
                if (flag) {
                  newArray3[v++] = {
                    value: this.relationList[i].empId,
                    label: this.relationList[i].empId,
                    empSkillType: item.empSkillType
                  }
                }
              }
              if (item.empSkillType === 0) {
                // eslint-disable-next-line no-redeclare
                var flag0 = true
                for (let l = 0; l < newArray0.length; l++) {
                  if (newArray0[l].value === item.empId) {
                    flag0 = false
                    break
                  }
                }
                if (flag0) {
                  newArray0[j++] = {
                    value: this.relationList[i].empId,
                    label: this.relationList[i].empId
                  }
                }
              }
            }
          }
        } else if (this.relationList[i].empPosition === 2) {
          // console.log(3)
          // eslint-disable-next-line no-redeclare
          var flag = true
          for (let l = 0; l < newArray1.length; l++) {
            if (newArray1[l].empId === this.relationList[i].empId) {
              flag = false
              break
            }
          }
          if (flag) {
            newArray1[k++] = this.relationList[i].empId
          }
        }
      }
      this.taskRespList = newArray0
      this.outPackList = newArray1
      this.taskA = newArray4
      this.taskB = newArray2
      this.taskC = newArray3
      // console.log('***')
      // console.log(newArray0.length)
      console.log(this.taskRespList)
      console.log(this.taskC)
      console.log('ddd')
      this.dialogVisible = true
      this.$nextTick(() => {
        this.projectchart = this.$echarts.init(this.$refs.projectchart)
        // 使用刚指定的配置项和数据显示图表。
        this.projectchart.setOption(this.option)
        console.log(this.taskList)
      })
      this.$forceUpdate()
    }
  },
  async created () {
    this.initComponent()
  }
}
</script>

<style scoped>
.task-tag{
  margin-left: 10px;
}
</style>
