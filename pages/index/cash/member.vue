<template>
  <div class="m-cash">
    <el-row :gutter="10">
      <el-col :span="8">
        <h4 class="title">充值会员</h4>
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="账号">
            <el-input v-model="form.username" placeholder="请输入充值账号" />
          </el-form-item>
          <el-form-item label="会员类型">
            <el-row :gutter="0">
              <el-col :span="8">
                <el-select v-model="env" placeholder="环境选择" @change="switchEnv">
                  <el-option
                    v-for="item in envList"
                    :key="item"
                    :label="item"
                    :value="item"
                  />
                </el-select>
              </el-col>
              <el-col :span="16">
                <el-select v-model="form.member_level_item_id" placeholder="会员类型" style="margin-left: 10px;" @change="selMemberType">
                  <el-option v-for="type in typeList" :key="type.key" :label="type.name" :value="type.key" />
                </el-select>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item label="操作类型">
            <el-select v-model="form.recharge_type" placeholder="操作类型">
              <el-option v-for="type in types" :key="type.key" :label="type.name" :value="type.key" />
            </el-select>
          </el-form-item>
          <el-form-item label="是否付费">
            <el-radio-group v-model="form.is_payment" @change="changePay">
              <el-radio :label="0">未付钱</el-radio>
              <el-radio :label="1">已付钱</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="visibleActualPay" label="实付金额">
            <el-input v-model="form.payment_amount" placeholder="请输入实付金额">
              <div slot="append">元</div>
            </el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="form.reason" type="textarea" />
          </el-form-item>
          <el-form-item label="">
            <el-button type="primary" @click="cash">充值</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>
<script type="text/javascript">
import API from '@/api/request'
export default {
  data() {
    return {
      form: {
        username: '13975127061',
        member_level_item_id: '5b208a60ae584c61dafe0c1a',
        recharge_type: 'RECHARGE',
        is_payment: 1,
        payment_amount: '1999',
        reason: '有赞'
      },
      env: '生产环境',
      envList: ['测试环境', '生产环境'],
      typeList: [],
      testTypes: [{
        name: '专业版一个月(199)',
        key: '5b8f36e56f5dcec34f0ab62b',
        price: '199'
      }, {
        name: '专业版一年(999)',
        key: '5b35ddbea57a6d1c808a8711',
        price: '999'
      }, {
        name: '创业版一年(1999)',
        key: '5b35ddbea57a6d1c808a8712',
        price: '1999'
      }, {
        name: '企业版一年(5999)',
        key: '5b35ddbea57a6d1c808a8713',
        price: '5999'
      }],
      prodTypes: [{
        name: '专业版一个月(399)',
        key: '5b8f36e56f5dcec34f0ab62b',
        price: '399'
      }, {
        name: '专业版一年(1999)',
        key: '5b208a60ae584c61dafe0c1a',
        price: '1999'
      }, {
        name: '创业版一年(3999)',
        key: '5b208a60ae584c61dafe0c1d',
        price: '3999'
      }, {
        name: '企业版一年(9999)',
        key: '5b208a60ae584c61dafe0c20',
        price: '9999'
      }],
      types: [{
        key: 'RECHARGE',
        name: '充值'
      }, {
        key: 'RENEWALS',
        name: '续费'
      }, {
        key: 'UPGRADE',
        name: '升级'
      }],
      visibleActualPay: true
    }
  },
  mounted() {
    this.typeList = this.prodTypes
    /**  13907482300
     */
  },
  methods: {
    // 充值
    cash() {
      if (!this.form.username) {
        this.$message({
          message: '请先填写账号!',
          type: 'warning'
        })
        return
      }
      API.post({
        url: '/api/cash/member',
        params: this.form
      })
    },
    // 选择会员类型
    selMemberType() {
      this.typeList.forEach(type => {
        if (type.key === this.form.member_level_item_id) {
          console.log(type)
          this.form.payment_amount = type.price
        }
      })
    },
    // 改变付款方式
    changePay() {
      this.visibleActualPay = (this.form.is_payment !== 0)
    },
    // 切换环境
    switchEnv() {
      if (this.env === this.envList[0]) {
        // 测试环境
        this.typeList = this.testTypes
        this.form.member_level_item_id = '5b35ddbea57a6d1c808a8711'
      } else {
        this.typeList = this.prodTypes
        this.form.member_level_item_id = '5b208a60ae584c61dafe0c1a'
      }
      this.selMemberType()
    }
  }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.m-cash {
  .title {
    font-size: 14px;
    text-align: center;
    padding: 15px 0;
  }
}
</style>
