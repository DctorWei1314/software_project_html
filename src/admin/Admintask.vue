<template>
<div>
  <el-page-header @back="goBack" :content="'任务详情'" style="margin-bottom: 8px">
    <i class="el-icon-s-fold" slot="title" style="color: chocolate">返回原项目</i>
  </el-page-header>
<!--      <el-button  @close="backtoproject">回归项目：{{1}}</el-button>-->
    <el-card>
      <el-form :label-position="right" label-width="120px" :model="task">
        <el-row>
          <el-col span="8">
            <el-form-item label="任务id">
              <el-input v-model="task.subTaskId" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="任务类型">
              <el-input v-model="task.subTaskSkillType" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="任务名称">
              <el-input v-model="task.subTaskName"></el-input>
            </el-form-item>
          </el-col >
        </el-row>
        <el-row>
          <el-col span="8">
            <el-form-item label="任务总额量">
              <el-input v-model="task.totalFileCount" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="任务完成量">
              <el-input v-model="task.hasFinishFileCount" disabled></el-input>
            </el-form-item>
          </el-col>
          <el-col span="8">
            <el-form-item label="任务实施人">
                <el-input v-model="task.subTaskInProject" prefix-icon="el-icon-user-solid" disabled></el-input>
              </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-form-item label="任务描述">
            <el-input type="textarea" v-model="task.subTaskDesc">
            </el-input>
          </el-form-item>
        </el-row>
        <el-row>
          <el-col span="11">
            <el-divider>任务内容</el-divider>
            <el-carousel  height="200px">
              <el-carousel-item v-for="item in this.donejob" :key="item">
                  <el-image :src="road + item.filePath"  target ="_blank"></el-image>
              </el-carousel-item>
            </el-carousel>
          </el-col >
          <el-col span="2">
            <el-divider direction="vertical"></el-divider>
          </el-col>
          <el-col span="11">
            <el-divider>任务贡献情况</el-divider>
            <el-row>
              <el-form-item label="任务进度">
                <el-progress status="success" :text-inside="true" :stroke-width="26" :percentage="(task.hasFinishFileCount/task.totalFileCount)*100"></el-progress>
              </el-form-item>
              <el-form-item :label="item.id" v-for="item in task.do" :key="item">
                <el-progress status="warning" :text-inside="true" :stroke-width="26" :percentage="(item.donesize/task.size)*100"></el-progress>
              </el-form-item>
            </el-row>
            <div ref="chart" style="width: 600px;height:400px;">
            </div>
          </el-col>
        </el-row>
      </el-form>
      <el-card style="margin-bottom: 15px" v-if="task.subTaskState === 3">
        <el-button type="success" @click="receiveCheck">
          接受验收
        </el-button>
        <el-button type="warning" @click="rejectCheck">
          拒绝验收
        </el-button>
      </el-card>
      <el-collapse accordion>
        <el-collapse-item>
          <template slot="title">
            <el-divider>任务日志</el-divider>
          </template>
          <el-card>
            <el-timeline :reverse="true">
              <el-timeline-item
                v-for="(taskevent, index) in taskLog"
                height="80px"
                :key="index"
                size="large"
                :timestamp="taskevent.timestamp">
                <el-alert type="info">
                  <p>{{taskevent}}</p>
                </el-alert>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-collapse-item>
      </el-collapse>
    </el-card>
</div>
</template>

<script>
export default {
  name: 'Admintask',
  data () {
    return {
      road: 'http://192.168.43.164:8080/upload',
      Respman: '',
      task: {
        hasFinishFileCount: 0,
        subTaskCanOutSource: 0,
        subTaskDesc: 'qwretryxcgfg',
        subTaskEndTime: null,
        subTaskId: 'TASKEYROONGM3',
        subTaskInProject: 'PRO9H060AHMWH',
        subTaskName: 'wer',
        subTaskSkillType: 2,
        subTaskStartTime: '2020-10-28T20:44:04.000+00:00',
        subTaskState: 1,
        totalFileCount: 5
      },
      taskLog: [],
      count: 10,
      loading: false,
      donejob: []
      // 指定图表的配置项和数据
    }
  },
  mounted () {
    this.getEchartData()
  },
  methods: {
    async receiveCheck () {
      var a = {
        subTaskId: this.task.subTaskId
      }
      const { data: rrr } = await this.$http.post('subTaskCompleteConclusion', a)
      console.log(rrr)
      console.log('^^^^')
    },
    async rejectCheck () {
      var a = {
        subTaskId: this.task.subTaskId
      }
      const { data: rrr } = await this.$http.post('subTaskCompleteRejection', a)
      console.log(rrr)
      console.log('^^^^')
    },
    getEchartData () {
      // 基于准备好的dom，初始化echarts实例
      // this.myChart = this.$echarts.init(this.$refs.chart)
      // // 使用刚指定的配置项和数据显示图表。
      // this.myChart.setOption(this.option)
    },
    goBack () {
      console.log('go back')
    }
  },
  async created () {
    var taskId = window.sessionStorage.getItem('currentTask')
    var a = {
      subTaskId: taskId
    }
    if (taskId !== null) {
      const { data: rrr } = await this.$http.post('getSubTask', a)
      // taskId = rrr.data
      this.task = rrr.data
      console.log(rrr)
      console.log('getSubTask')
    }
    const { data: kk } = await this.$http.post('getSubTaskInfoByTaskId', a)
    console.log(kk)
    console.log('getSubTaskInfoByTaskId')
    var m = {
      subTaskId: window.sessionStorage.getItem('currentTask')
    }
    console.log(m)
    console.log('mmmmmmmmmmm')
    const { data: rf } = await this.$http.post('getTaskLog', m)
    console.log(rf)
    console.log('getLog')
    this.taskLog = rf.data
    var image = {
      subTaskId: this.task.subTaskId
    }
    const { data: res } = await this.$http.post('getFileList', image)
    console.log(res.data)
    this.donejob = res.data
  }
}
</script>

<style scoped>
.el-carousel__item h3 {
  color: #475669;
  font-size: 14px;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
}

.el-carousel__item:nth-child(2n) {
  background-color: #99a9bf;
}

.el-carousel__item:nth-child(2n+1) {
  background-color: #d3dce6;
}
</style>
