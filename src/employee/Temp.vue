<template>
  <div>
    <el-card>
      <el-row>
        <el-card>
          <el-row>
            <el-alert :closable="false" center type="success">
              外包人员：正在执行任务，你没有编辑权限,除非先撤回外包
            </el-alert>
            <el-row>
              <el-col span="22">
                外包截止时间：{{new date()}}
              </el-col>
              <el-col span="2">
                <el-button type="warning" @click="withdraw">
                  撤回外包
                </el-button>
              </el-col>
            </el-row>
          </el-row>
        </el-card>
      </el-row>
      <el-row v-for="(item,index) in this.donejob" :key="item">
        <el-card v-if="index<taskBean.totalFileCount">
          <el-row>
            <el-col span="6">
              <el-row>
                提交人:
                <el-tag type="success">
                  {{item.empId}}
                </el-tag>
              </el-row>
              <el-row>
                最近操作时间:
                <el-tag type="info">
                  {{item.commitDate}}
                </el-tag>
              </el-row>
            </el-col>
            <el-col span="14">
              <el-image :src="road + item.filePath" :herf="road + item.filePath" target ="_blank"></el-image>
            </el-col>
            <el-col span="4">
              <el-button type="primary" icon="el-icon-edit" @click="modifyupload(item)"></el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-row>
      <div v-if="taskBean.totalFileCount-donejob.length > 0">
        <el-row v-for="item in taskBean.totalFileCount-donejob.length" :key="item">
          <el-card>
            <el-row>
              <el-button @click="check" icon="el-icon-upload" >
                提交新任务点
              </el-button>
            </el-row>
          </el-card>
        </el-row>
      </div>
      <el-button @click="submit" :disabled="taskBean.totalFileCount > donejob.length">提交任务</el-button>
    </el-card>
    <!--    <el-dialog-->
    <!--      :visible.sync="test"-->
    <!--    >-->
    <!--    </el-dialog>-->
    <el-dialog
      :title="hint"
      :visible.sync="dialogVisible"
      width="30%"
      :append-to-body="true"
      @close="dialogVisible = false"
      :before-close="handleClose">
      <el-upload
        drag
        :data="uploaddata"
        action="http://49.140.125.24:8080/upload/"
        :on-success="handlesuccess"
        multiple>
        <i class="el-icon-upload"></i>
        <div >将文件拖到此处，或<em>点击上传</em></div>
        <div  slot="tip">只能上传jpg/png文件，且不超过500kb</div>
      </el-upload>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  name: 'Temp',
  data () {
    return {
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
      // test: false,
      modifyname: null,
      road: 'http://49.140.125.24:8080/upload',
      taskBean: {
        subTaskId: 'qwe',
        subTaskName: 'wer',
        subTaskDesc: 'qwretryxcgfg',
        subTaskSkillType: 2,
        subTaskInProject: 'PRO9H060AHMWH',
        subTaskStartTime: null,
        subTaskEndTime: null,
        totalFileCount: 5
      },
      power: true,
      outtaskmanid: null,
      executeinfo: {
        executemanid: '123',
        endtime: new Date(2000, 10, 10, 10, 10)
      },
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick (picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      value: [new Date(2000, 10, 10, 10, 10), new Date(2000, 10, 11, 10, 10)],
      uploaddata: {
        modified: false,
        modifiedfilename: null
      },
      dialogVisible: false,
      donejob: [],
      hint: '提交新任务点'
    }
  },
  methods: {
    async withdraw () {
      var jion = {
        subTaskId: this.taskBean.subTaskId
      }
      const { data: rrr } = await this.$http.post('outSourcingRecovery', jion)
      console.log(rrr)
    },
    async submit () {
      var jion = {
        subTaskId: this.taskBean.subTaskId
      }
      const { data: rrr } = await this.$http.post('subTaskCompleteApply', jion)
      console.log(rrr)
    },
    check () {
      // this.test = true
      console.log(this.donejob.length)
      this.dialogVisible = true
      console.log(this.dialogVisible)
      // if (this.donejob.length >= this.taskBean.totalFileCount) {
      //   this.$message.warning('已超过任务上传限制！')
      // }
      console.log(this.donejob.length)
    },
    // const { data: rrr } = await this.$http.post('outSourcingApply', task)
    outpack: async function () {
      var task = {
        helpersID: this.outtaskmanid,
        subTaskId: this.taskBean.subTaskId,
        taskOutSourceEndTime: this.value[1]
      }
      const { data: rrr } = await this.$http.post('outSourcingApply', task)
      console.log(rrr)
    },
    handleClose () {
      this.modifyname = null
      this.hint = '提交新任务点'
    },
    async handlesuccess (response, file, fileList) {
      console.log(response)
      if (this.modifyname === null) {
        var gg = {
          empId: window.sessionStorage.getItem('loginId'),
          filePath: response,
          commitDate: new Date()
        }
        this.donejob.push(gg)
        var json = {
          subTaskId: this.taskBean.subTaskId,
          filePath: response
        }
        const { data: rrr } = await this.$http.post('addTaskFileList', json)
        console.log(rrr)
        // rrr.data
      } else {
        for (let i = 0; i < this.donejob.length; i++) {
          if (this.donejob[i] === this.modifyname) {
            // eslint-disable-next-line no-undef
            this.donejob[i] = response
          }
        }
        var ty = {
          subTaskId: this.taskBean.subTaskId,
          oldFilePath: name,
          newFilePath: response
        }
        const { data: rrr } = await this.$http.post('updateFileList', ty)
        console.log(rrr)
      }
    },
    async modifyupload (name) {
      this.modifyname = name
      this.dialogVisible = true
    }
  },
  async created () {
    var df = {
      subTaskId: window.sessionStorage.getItem('currentTask')
    }
    const { data: rrr } = await this.$http.post('getSubTask', df)
    this.taskBean = rrr.data
    console.log(this.taskBean.subTaskId)
    var image = {
      subTaskId: this.taskBean.subTaskId
    }
    const { data: res } = await this.$http.post('getFileList', image)
    console.log('**********')
    console.log(res)
    this.donejob = res.data
  }
}
</script>

<style scoped>

</style>
