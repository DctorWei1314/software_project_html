<template>
<div>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item :to="{ path: '/employeeadmin' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item><a href="/">人员管理</a></el-breadcrumb-item>
    <el-breadcrumb-item>员工管理</el-breadcrumb-item>
  </el-breadcrumb>

  <el-card>
    <el-row :gutter="10" height="100%">
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
          <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
        </el-input>
      </el-col>
      <el-col :span="4">
        <el-input v-model="projectInput" placeholder="请项目id">
          <el-button slot="append" type="primary" @click="addEmployeeToProj" icon="el-icon-folder-add">
          加入到项目
        </el-button></el-input>
      </el-col>
      <el-col :span="12">
        <el-button type="primary" @click="newEmployee" icon="el-icon-plus">
          录入新员工
        </el-button>
      </el-col>
    </el-row>
    <el-table
      :data="userList"
      stripe
      border
      tooltip-effect="dark"
      @selection-change="handleSelectionChange"
      @expand-change="expandUser"
    >
      <el-table-column type="selection"></el-table-column>
      <el-table-column type="expand">
        <template slot-scope='scope'>
          <el-row :class="['bdbottom','bdtop', 'vcenter']">
            <el-col :span="5" ><el-tag>进行中的项目</el-tag></el-col>
            <el-col  :span="19">
              <el-row v-for="(item,index0) in scope.row" :key="index0+''" :class="['bdbottom', index0 === 0 ? 'bdtop' : '', 'vcenter']">
                <el-col :span="4">
                  <el-button type="primary" icon="el-icon-folder-delete" circle>{{item.name}}</el-button>
                </el-col>
                <el-col :span="15">
                  <el-row v-for="(subitem,index1) in item.task" :key="index1+''">
                    <el-button :type="statetostring(subitem.state)" :icon="statetoicon(subitem.state)" round>{{subitem.name}}</el-button>
<!--                    <el-tag  :type="statetostring(subitem.state)" :icon="statetoicon(subitem.state)">{{subitem.name}}</el-tag>-->
                  </el-row>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <el-collapse accordion>
            <el-collapse-item>
              <template slot="title">
                <el-divider>已完成的项目</el-divider>
              </template>
              <el-card>
                <el-row :class="['bdbottom','bdtop', 'vcenter']">
                  <el-col :span="5"><el-tag type='success'>已完成的项目</el-tag></el-col>
                  <el-col :span="19">
                    <el-row v-for="(item,index) in scope.row.doneproject" :key="index" :class="['bdbottom',index === 0 ? 'bdtop' : '', 'vcenter']">
                      <el-col :span="4">
                        <el-button type="success" icon="el-icon-folder-checked" circle>{{item.name}}</el-button>
                      </el-col>
                      <el-col :span="15">
                        <el-row v-for="subitem in item.task" :key="subitem">
                          <el-button :type="statetostring(subitem.state)" :icon="statetoicon(subitem.state)" round>{{subitem.name}}</el-button>
                        </el-row>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>
              </el-card>
            </el-collapse-item>
          </el-collapse>
        </template>
      </el-table-column>
      <el-table-column
        type="index">
      </el-table-column>
      <el-table-column
        prop="empId"
        label="员工号">
      </el-table-column>
      <el-table-column
        prop="empName"
        label="员工名">
      </el-table-column>
      <el-table-column
        prop="empSkillType"
        label="员工类型">
      </el-table-column>
      <el-table-column
        prop="empFinishProCount"
        label="完成项目数">
      </el-table-column>
      <el-table-column
        prop="empDoingProCount"
        label="正在进行项目数">
      </el-table-column>
<!--      <el-table-column-->
<!--        label="状态">-->
<!--        <template slot-scope="scope">-->
<!--          <el-switch-->
<!--            v-model="scope.row.mg_state"-->
<!--            @change="userStateChanged(scope.row)"-->
<!--            active-color="#13ce66"-->
<!--            inactive-color="#ff4949">-->
<!--          </el-switch>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column
        label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)"></el-button>
          <el-button type="warning" icon="el-icon-refresh"></el-button>
          <el-button type="danger" icon="el-icon-delete" @click="deleteEmployee(scope.row.empId)"></el-button>
<!--          <el-tooltip effect="dark" content="分配角色" placement="top">-->
<!--            <el-button type="warning" icon="el-icon-setting"></el-button>-->
<!--          </el-tooltip>-->
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
      :total="total">
    </el-pagination>
  </el-card>
  <el-dialog
    :title="isRegister?'录入新员工':'修改员工信息'"
    :visible.sync="dialogVisible"
    width="50%"
    @close="editDialogClosed"
  >
    <el-form ref="editformRef" :model="editForm" :rules="rules" label-width="80px">
      <el-form-item label="员工名" prop="empName">
        <el-input v-model="editForm.empName" prefix-icon="el-icon-user-solid"></el-input>
      </el-form-item>
      <el-form-item label="员工类型" prop="empSkillType">
        <el-input v-model="editForm.empSkillType" prefix-icon="el-icon-user-solid"></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button @click="cancelNew">取消</el-button>
        <el-button v-if="isRegister" type="primary" @click="confirmNew">确定录入</el-button>
        <el-button v-else type="primary" @click="confirmEdit">确定修改</el-button>
    </span>
  </el-dialog>
</div>
</template>

<script>
export default {
  name: 'Employeeadmin',
  data () {
    return {
      projectInput: '',
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 3
      },
      userList: [{
        empId: 123,
        empName: 'xiaoming',
        empSkillType: 'C',
        empDoingProCount: 2,
        empFinishProCount: 3,
        doneproject: [],
        workingproject: []
        // workingproject: [{ name: 'nnn', task: [{ name: 'nnn_task6', state: 1 }, { name: 'nnn_task9', state: 2 }] },
        //   { name: 'vvv', task: [{ name: 'vvv_task6', state: 3 }, { name: 'vvv_task6', state: 4 }] }]
      }
      // {
      //   number: 234,
      //   name: 'xiaohong',
      //   type: 'B',
      //   workingnum: 1,
      //   finishnum: 2,
      //   doneproject: ['eee', 'qwe'],
      //   workingproject: ['uyt']
      // }
      ],
      total: 2,
      dialogVisible: false,
      modifiedRow: null,
      editForm: {
        empName: null,
        empSkillType: null
      },
      isRegister: true,
      multipleSelection: []
    }
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('getAllEmpInfo')
      console.log(res)
      console.log('tt')
      if (res.status !== 200) return this.$message.error(res.meta.message)
      this.userList = res.data
      console.log(this.userList)
      var length = this.userList.length
      for (var index = 0; index < length; index++) {
        this.userList[index].empSkillType = this.numtoable(this.userList[index].empSkillType)
        if (this.userList[index].empType === 0) {
          console.log(888)
          console.log(this.userList[index])
          this.userList.splice(index--, 1)
        }
      }
      // this.userList.forEach(function (item, index, arr) {
      //   if (item.empType === 0) {
      //     // arr.splice(index, 1)
      //     console.log(item.empName + item.empType + index)
      //   }
      // })
    },
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.getUserList()
    },
    handleCurrentChange (val) {
      this.queryInfo.pagenum = val
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      // eslint-disable-next-line no-template-curly-in-string
      const { data: res } = this.$http.put('users/' + userInfo.id + '/state/' + userInfo.mg_state)
      console.log(res)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.message)
      }
      this.$message.success(res.meta.message)
    },
    async showEditDialog (row) {
      // const { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      // if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      // this.editForm = res.data()
      console.log(row)
      console.log(777)
      this.modifiedRow = row
      this.isRegister = false
      this.dialogVisible = true
    },
    editDialogClosed () {
      this.$refs.editformRef.resetFields()
    },
    statetostring (state) {
      if (state === 1) return 'success'
      if (state === 2) return 'info'
      if (state === 3) return 'warning'
      if (state === 4) return 'info'
    },
    statetoicon (state) {
      if (state === 1) return 'el-icon-success'
      if (state === 2) return 'el-icon-check'
      if (state === 3) return 'el-icon-star-on'
      if (state === 4) return 'el-icon-star-off'
    },
    handleSelectionChange (val) {
      this.multipleSelection = val
      console.log(val)
    },
    async addEmployeeToProj () {
      const items = []
      this.multipleSelection.forEach((item, index) => {
        items[index] = item.empId
      })
      console.log(items)
      console.log(this.projectInput)
      var task = {
        projectID: this.projectInput,
        empIDs: items
      }
      const { data: rrr } = await this.$http.post('addProjectPerson', task)
      console.log(rrr)
      this.projectInput = ''
      this.$router.push('./projectquery')
    },
    async newEmployee () {
      this.editForm = {
        empName: null,
        empSkillType: null
      }
      this.dialogVisible = true
      this.isRegister = true
    },
    cancelNew () {
      this.dialogVisible = false
      this.$refs.editformRef.resetFields()
    },
    async confirmNew () {
      const { data: rrr } = await this.$http.post('addEmp', this.editForm)
      console.log(this.editForm)
      console.log(rrr)
      this.dialogVisible = false
      this.getUserList()
    },
    async confirmEdit () {
      this.modifiedRow.empName = this.editForm.empName
      this.modifiedRow.empSkillType = this.editForm.empSkillType
      const { data: rrr } = await this.$http.post('modifyEmp', this.modifiedRow)
      console.log(rrr)
      this.dialogVisible = false
      this.getUserList()
    },
    deleteEmployee (empId) {
      // *********
      this.$confirm('此操作将永久删除' + empId + ', 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message({
          type: 'success',
          message: '删除成功!'
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    numtoable (num) {
      if (num === 1) return 'A'
      if (num === 2) return 'B'
      if (num === 3) return 'AB'
      if (num === 4) return 'C'
      if (num === 5) return 'AC'
      if (num === 6) return 'BC'
      if (num === 7) return 'ABC'
    },
    async expandUser (a) {
      // console.log(a)
      var id = {
        empId: a.empId
      }
      const { data: rrr } = await this.$http.post('getEmpDoingProjectEmpId', id)
      console.log(rrr)
    }
  },
  created () {
    this.getUserList()
    this.projectInput = window.sessionStorage.getItem('projectToAdd')
    console.log('test')
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
</style>
