<template>
  <div>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/employeeadmin' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item><a href="/">项目管理</a></el-breadcrumb-item>
      <el-breadcrumb-item>项目查询</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row :gutter="10" height="100%">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getProjectList">
            <el-button slot="append" icon="el-icon-search" @click="getProjectList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="16">
          <el-button type="primary" @click="createProject" icon="el-icon-plus">
            创建项目
          </el-button>
        </el-col>
      </el-row>
      <el-table
        :data="projectList"
        stripe
        border
      >
        <el-table-column
          type="index">
        </el-table-column>
        <el-table-column
          prop="projectId"
          label="项目id">
        </el-table-column>
        <el-table-column
          prop="projectName"
          label="项目名称">
        </el-table-column>
        <el-table-column
          prop="projectState"
          label="项目状态">
          <template slot-scope="scope">
            <el-badge is-dot style="margin-top: 10px;" :hidden="scope.row.projectState !== 2">
              {{statetostring(scope.row.projectState)}}
            </el-badge>
          </template>
        </el-table-column>
        <el-table-column
          prop="proManagerId"
          label="负责者id">
        </el-table-column>
        <el-table-column
          prop="projectStartTime"
          label="开始时间">
        </el-table-column>
        <el-table-column
          prop="projectEndTime"
          label="截止时间">
        </el-table-column>
        <el-table-column
          label="详情">
          <template slot-scope="scope">
            <el-col span="12">
              <el-badge is-dot style="margin-top: 10px;" :hidden="scope.row.projectState !== 2">
                <el-button :id="scope.row.projectId" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
              </el-badge>
            </el-col>
            <el-col span="12" style="margin-top: 10px;">
              <el-button type="primary" icon="el-icon-view" @click="showLog(scope.row)"></el-button>
            </el-col>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 7, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <el-dialog
      title="项目信息"
      :visible="dialogVisible"
      width="60%"
      @open="dialogVisible = true"
      ref="dialog"
      :destroy-on-close="true"
      @close="dialogVisible = false"
    >
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
          <el-col span="9">
            <el-input v-model="RespEditId">
              <el-button slot="append" icon="el-icon-setting" @click="setProjectManager(RespEditId)"></el-button>
            </el-input>
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
      <el-divider content-position="center">子任务拓扑图 <i class="el-icon-d-arrow-left"></i><i class="el-icon-d-arrow-left"></i>  <el-button size="small" @click="addTask" icon="el-icon-plus" :disabled="this.projectForm.projectState === -1">Task</el-button></el-divider>
      <el-collapse accordion>
        <el-collapse-item>
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
        </el-collapse-item>
      </el-collapse>
      <el-divider content-position="center">工程人员池 <i class="el-icon-d-arrow-left"></i><i class="el-icon-d-arrow-left"></i>  <el-button size="small" @click="addEmployee" icon="el-icon-plus" :disabled="this.projectForm.projectState === -1">Employee</el-button></el-divider>
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
      <div ref="projectchart" style="width: 800px;height:600px;">
      </div>
      <span slot="footer" v-if="projectForm.projectState === 0">
        <el-button type="danger" @click="freeze_project">冻结项目</el-button>
      </span>
      <span slot="footer" v-if="projectForm.projectState === 1">
        <el-button type="danger" @click="freeze_project">冻结项目</el-button>
      </span>
      <span slot="footer" v-if="projectForm.projectState === -1">
        <el-button @click="create_project">建立项目</el-button>
      </span>
      <span slot="footer" v-if="projectForm.projectState === 0">
        <el-button type="info" @click="modify_project">修改项目</el-button>
        <el-button type="warning" @click="commit_project">实施项目</el-button>
      </span>
      <span slot="footer" v-if="projectForm.projectState === 1">
        <el-button type="primary" @click="submit_project">提交项目</el-button>
      </span>
      <span slot="footer" v-if="projectForm.projectState === 2">
        <el-button type="danger" @click="reject_project">拒绝项目</el-button>
         <el-button type="success" @click="receive_project">接纳项目</el-button>
      </span>
      <span slot="footer" v-if="projectForm.projectState === 4">
        <el-button type="primary" @click="restart_project">重启项目</el-button>
      </span>
      <el-dialog
        title="添加子任务"
        :visible="dialogTask"
        width="50%"
        @close="dialogTask = false"
        append-to-body
      >
                  <el-card>
                    <el-select
                      v-model="taskForm.leadingPath"
                      multiple
                      filterable
                      allow-create
                      default-first-option
                      placeholder="请选择前置任务">
                      <el-option
                        v-for="item in taskList"
                        :key="item.subTaskId"
                        :label="item.subTaskId"
                        :value="item.subTaskId">
                      </el-option>
                    </el-select>
                  </el-card>
                  <el-form :model="taskForm.taskBean" :rules="rules" label-width="100px">
                    <el-form-item label="任务名"  prop="subTaskName">
                      <el-input v-model="taskForm.taskBean.subTaskName" prefix-icon="el-icon-user-solid"></el-input>
                    </el-form-item>
                    <el-form-item label="任务描述" prop="subTaskDesc">
                      <el-input v-model="taskForm.taskBean.subTaskDesc" prefix-icon="el-icon-user-solid"></el-input>
                    </el-form-item>
                    <el-form-item label="任务类型" prop="subTaskSkillType">
                      <el-select
                        v-model="taskForm.taskBean.subTaskSkillType"
                        placeholder="请选择任务类型">
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item label="截止时间" prop="subTaskEndTime">
                      <el-date-picker
                        v-model="taskForm.taskBean.subTaskEndTime"
                        type="datetime"
                        placeholder="选择日期时间"
                        style="width: 100%"
                      >
                      </el-date-picker>
                    </el-form-item>
                    <el-form-item label="任务量" prop="totalFileCount">
                      <el-input v-model="taskForm.taskBean.totalFileCount" prefix-icon="el-icon-user-solid"></el-input>
                    </el-form-item>
                    <el-form-item label="能否外包">
                      <el-switch
                        v-model="taskForm.taskBean.subTaskCanOutSource"
                        active-color="#13ce66"
                        inactive-color="#ff4949">
                      </el-switch>
                    </el-form-item>
                  </el-form>
              <el-card>
                <el-select
                  v-model="taskForm.succeedingPath"
                  multiple
                  filterable
                  allow-create
                  default-first-option
                  placeholder="请选择后置任务">
                  <el-option
                    v-for="item in taskList"
                    :key="item.subTaskId"
                    :label="item.subTaskId"
                    :value="item.subTaskId">
                  </el-option>
                </el-select>
              </el-card>
        <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="addSubTaskCancel">取消</el-button>
        <el-button type="primary" @click="addSubTask">添加任务</el-button>
    </span>
      </el-dialog>
    </el-dialog>
    <el-dialog
      title="项目日志"
      :visible="dialogLog"
      width="50%"
      @close="dialogLog = false"
      append-to-body
      fullscreen
      lock-scroll=false
    >
      <div  :class="['infinite-list-wrapper','bdtop','bdbottom']" style="overflow:auto;height: 1200px">
        <el-timeline
        >
          <el-timeline-item v-for="item in log" :key="item">
            <el-card>
              <el-alert type="success">
                {{item}}
              </el-alert>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Projectquery',
  data () {
    return {
      projectchart: null,
      log: [],
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
            // { name: '销售（sales）', max: 6500 },
            // { name: '管理（Administration）', max: 16000 },
            // { name: '信息技术（Information Techology）', max: 30000 },
            // { name: '客服（Customer Support）', max: 38000 },
            // { name: '研发（Development）', max: 52000 },
            // { name: '市场（Marketing）', max: 25000 },
            // { name: '水电工（Marketing）', max: 25000 }
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
      options: [
        {
          value: 1,
          label: 'A'
        },
        {
          value: 2,
          label: 'B'
        },
        {
          value: 4,
          label: 'C'
        }
      ],
      taskForm: {
        taskBean: {
          subTaskName: null,
          subTaskDesc: null,
          subTaskSkillType: 3,
          subTaskInProject: null,
          subTaskStartTime: null,
          subTaskEndTime: null,
          totalFileCount: 5,
          subTaskCanOutSource: false
        },
        leadingPath: null,
        succeedingPath: null,
        isChain: false
      },
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      taskList: [
      //   {
      //   hasFinishFileCount: 5,
      //   subTaskId: 'qwer',
      //   subTaskName: 'wer',
      //   subTaskDesc: 'qwretryxcg',
      //   subTaskSkillType: 2,
      //   subTaskInProject: 'PRO9H060AHMWH',
      //   subTaskStartTime: null,
      //   subTaskEndTime: null,
      //   totalFileCount: 5,
      //   beforeTasks: [{
      //     percentage: 45,
      //     subTaskId: 'wete'
      //   }]
      // },
      // {
      //   hasFinishFileCount: 2,
      //   subTaskId: 'qrr',
      //   subTaskName: 'sadgew',
      //   subTaskDesc: 'qwfewgfewgxcgfg',
      //   subTaskSkillType: 2,
      //   subTaskInProject: 'PRO9H060AHMWH',
      //   subTaskStartTime: null,
      //   subTaskEndTime: null,
      //   totalFileCount: 5,
      //   beforeTasks: [{
      //     percentage: 67,
      //     subTaskId: 'wete'
      //   }]
      // }
      ],
      projectList: [],
      relationList: [],
      outPackList: [],
      taskRespList: [],
      taskA: [],
      taskB: [],
      taskC: [],
      RespEditId: '',
      total: 0,
      dialogVisible: false,
      dialogTask: false,
      projectForm: { projectId: null, projectName: null, projectDesc: null, projectState: null, proManagerId: null, projectStartTime: null, projectEndTime: null },
      drawer: false,
      dialogLog: false
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
    boolToInt (boo) {
      if (boo === true) return 1
      if (boo === false) return 0
    },
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
    taskToIcon (state) {
      if (state === 0) return 'el-icon-remove'
      if (state === 1) return 'el-icon-document-delete'
      if (state === 2) return 'el-icon-connection'
      if (state === 3) return 'el-icon-s-check'
      if (state === 4) return 'el-icon-success'
    },
    async deleteEmployee (empId) {
      var info = {
        empID: empId.value,
        projectID: this.projectForm.projectId
      }
      console.log(empId)
      const { data: rrr } = await this.$http.post('deleteProjectPerson', info)
      console.log(rrr)
      this.taskRespList.splice(this.taskRespList.indexOf(empId), 1)
    },
    async setTaskPesp (Respman, subTaskId) {
      var json = {
        subTaskID: subTaskId,
        empID: Respman
      }
      this.$confirm('是否设立' + 'subTaskId' + '为任务负责人？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: rrr } = await this.$http.post('setSubTaskPerson', json)
        console.log(rrr)
        if (rrr.status === 200) {
          this.$message({
            type: 'success',
            message: '设置成功!'
          })
        } else {
          this.$message({
            type: 'warning',
            message: rrr.message
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    async getProjectList () {
      const { data: res } = await this.$http.get('getAllProject')
      // console.log(this.projectList)
      this.projectList = res.data
      // console.log(this.projectList)
      // if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      // this.userList = res.data.users
      // this.total = res.data.total
    },
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getProjectList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getProjectList()
    },
    showEditDialog: async function (row) {
      // const { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      // if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      // this.editForm = res.data()
      this.projectForm = row
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
        var temp = ' '
        if (repMan.data != null) {
          temp = repMan.data.empId
        }
        this.taskList[i] = Object.assign(this.taskList[i], {
          beforeTasks: b.data,
          respMan: temp
        })
        max = max > this.taskList[i].totalFileCount ? max : this.taskList[i].totalFileCount
        this.option.radar.indicator[i] = { name: this.taskList[i].subTaskId, max: this.taskList[i].totalFileCount }
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
      })
    },
    createProject () {
      this.dialogVisible = true
      this.taskList.tasks = null
      this.projectForm = { projectId: null, projectName: null, projectDesc: null, projectState: -1, proManagerId: null, projectStartTime: null, projectEndTime: null }
      // var project = {
      //   projectName: '第一个项目',
      //   projectDesc: 'qwertyu',
      //   projectEndTime: new Date()
      // }
      // *******
      // this.$refs.projectRef.resetFields()
    },
    async modify_project () {
      const { data: res } = await this.$http.post('modifyProject', this.projectForm)
      if (res.status === 200) {
        this.$message.success(res.message)
        this.projectForm.projectId = res.data
        this.projectForm.projectState = 0
      }
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
    async showLog (row) {
      this.dialogLog = true
      const { data: res } = await this.$http.post('getLog', row)
      // console.log(res)
      // console.log('!!!!!!!!!!!!')
      this.log = res.data
    },
    async create_project () {
      const { data: res } = await this.$http.post('createProject\n', this.projectForm)
      if (res.status === 200) {
        this.$message.success(res.message)
        this.projectForm.projectId = res.data
        this.projectForm.projectState = 0
      }
    },
    async commit_project () {
      const { data: res } = await this.$http.post('enableProject', this.projectForm)
      console.log(res)
      if (res.status === 200) {
        this.$message.success(res.message)
      }
      await this.create_component()
      this.$forceUpdate()
    },
    async submit_project () {
      const { data: res } = await this.$http.post('projectCompleteApply', this.projectForm)
      console.log(res)
      if (res.status === 200) {
        this.$message.success(res.message)
      }
      await this.create_component()
      this.$forceUpdate()
    },
    async restart_project () {
      var task = {
        projectId: this.projectForm.projectId
      }
      const { data: rrr } = await this.$http.post('restartProject', task)
      console.log(rrr)
      if (rrr.status === 200) {
        this.$message.success(rrr.message)
      }
      await this.create_component()
      this.$forceUpdate()
    },
    addEmployee () {
      window.sessionStorage.setItem('projectToAdd', this.projectForm.projectId)
      this.$router.push('/employeeadmin')
    },
    addTask () {
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
      console.log('1234')
      this.dialogTask = true
      this.dialogVisible = false
      console.log(this.dialogTask)
    },
    async addSubTask () {
      this.taskForm.taskBean.subTaskCanOutSource = this.boolToInt(this.taskForm.taskBean.subTaskCanOutSource)
      console.log(this.taskForm)
      console.log('?????')
      if (this.taskForm.succeedingPath.length > 0) {
        this.$confirm('是否回滚后置任务?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.taskForm.isChain = true
          this.$message({
            type: 'success',
            message: '回滚成功!'
          })
        }).catch(() => {
          this.taskForm.isChain = false
          this.$message({
            type: 'info',
            message: '取消回滚'
          })
        })
      }
      this.taskForm.taskBean.subTaskInProject = this.projectForm.projectId
      const { data: res } = await this.$http.post('addSubTask', this.taskForm)
      console.log(res)
      if (res.status === 200) {
        this.$message.success(res.message)
        this.dialogVisible = false
        document.getElementById(this.projectForm.projectId).click()
        // setTimeout(this.showEditDialog(this.projectForm), 500)
        console.log('!!!!!!!!!!')
      }
    },
    taskInfo (subTaskId) {
      window.sessionStorage.setItem('originProject', this.projectForm)
      window.sessionStorage.setItem('currentTask', subTaskId)
      this.$router.push('/admintask')
    },
    async setProjectManager (RespEditId) {
      var task = {
        projectID: this.projectForm.projectId,
        empID: RespEditId
      }
      this.$confirm('是否设立' + 'RespEditId' + '为管理员？', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        const { data: rrr } = await this.$http.post('setProjectManager', task)
        console.log(rrr)
        if (rrr.status === 200) {
          this.$message({
            type: 'success',
            message: '设置成功!'
          })
          this.getProjectList()
          this.projectForm.proManagerId = RespEditId
        } else {
          this.$message({
            type: 'warning',
            message: rrr.message
          })
        }
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    async freeze_project () {
      var task = {
        projectId: this.projectForm.projectId
      }
      const { data: rrr } = await this.$http.post('abandonProject', task)
      console.log(rrr)
      if (rrr.status === 200) {
        this.$message.success(rrr.message)
      }
      await this.create_component()
    },
    reject_project () {
      this.restart_project()
    },
    async receive_proect () {
      var task = {
        projectId: this.projectForm.projectId
      }
      const { data: rrr } = await this.$http.post('completeProject', task)
      if (rrr.status === 200) {
        this.$message.success(rrr.message)
      }
      this.getProjectList()
    },
    async create_component () {
      this.getProjectList()
      if (window.sessionStorage.getItem('projectToAdd') !== null) {
        // eslint-disable-next-line no-undef
        var json = {
          projectId: window.sessionStorage.getItem('projectToAdd')
        }
        const { data: rrr } = await this.$http.post('getProject', json)
        this.projectForm = rrr.data
        console.log(rrr)
        this.showEditDialog(this.projectForm)
      }
      this.RespEditId = ''
    }
  },
  // mounted () {
  //   // 基于准备好的dom，初始化echarts实例
  //   console.log(this.$refs.projectchart)
  //   console.log('******************')
  //   this.projectchart = this.$echarts.init(this.$refs.projectchart)
  // },
  async created () {
    this.getProjectList()
    if (window.sessionStorage.getItem('projectToAdd') !== null) {
      // eslint-disable-next-line no-undef
      var json = {
        projectId: window.sessionStorage.getItem('projectToAdd')
      }
      const { data: rrr } = await this.$http.post('getProject', json)
      this.projectForm = rrr.data
      console.log(rrr)
      this.showEditDialog(this.projectForm)
    }
    this.RespEditId = ''
  }
}
</script>

<style scoped>
.task-tag{
  margin-left: 10px;
}
</style>
