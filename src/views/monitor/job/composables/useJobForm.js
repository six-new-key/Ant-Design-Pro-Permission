import { ref, reactive } from 'vue'
import { addJob, updateJob, getJobById } from '@/api/job'
import { message } from 'ant-design-vue'

export function useJobForm(loadData) {
  const formRef = ref(null)
  const formVisible = ref(false)
  const formTitle = ref('新增任务')
  const isEdit = ref(false)

  const formData = reactive({
    jobId: null,
    jobName: '',
    jobGroup: 'DEFAULT',
    invokeTarget: '',
    cronExpression: '',
    misfirePolicy: 3,
    concurrent: 1,
    status: 1,
    remark: ''
  })

  const formRules = {
    jobName: [
      { required: true, message: '请输入任务名称', trigger: 'blur' },
      { max: 64, message: '任务名称不能超过64个字符', trigger: 'blur' }
    ],
    jobGroup: [
      { required: true, message: '请输入任务组名', trigger: 'blur' },
      { max: 64, message: '任务组名不能超过64个字符', trigger: 'blur' }
    ],
    invokeTarget: [
      { required: true, message: '请输入调用目标', trigger: 'blur' },
      { max: 500, message: '调用目标不能超过500个字符', trigger: 'blur' }
    ],
    cronExpression: [
      { required: true, message: '请输入Cron表达式', trigger: 'blur' },
      { max: 255, message: 'Cron表达式不能超过255个字符', trigger: 'blur' }
    ]
  }

  const resetForm = () => {
    formData.jobId = null
    formData.jobName = ''
    formData.jobGroup = 'DEFAULT'
    formData.invokeTarget = ''
    formData.cronExpression = ''
    formData.misfirePolicy = 3
    formData.concurrent = 1
    formData.status = 1
    formData.remark = ''
    formRef.value?.clearValidate()
  }

  const openAddForm = () => {
    resetForm()
    isEdit.value = false
    formTitle.value = '新增任务'
    formVisible.value = true
  }

  const openEditForm = async (record) => {
    resetForm()
    isEdit.value = true
    formTitle.value = '编辑任务'
    formVisible.value = true

    try {
      const res = await getJobById(record.jobId)
      if (res.code === 200) {
        Object.assign(formData, res.data)
      }
    } catch (error) {
      message.error('加载任务信息失败')
    }
  }

  const handleSubmit = async () => {
    try {
      await formRef.value.validate()
      const api = isEdit.value ? updateJob : addJob
      const res = await api(formData)
      if (res.code === 200) {
        message.success(isEdit.value ? '修改成功' : '新增成功')
        formVisible.value = false
        loadData()
      }
    } catch (error) {
      // 表单验证失败或接口调用失败
    }
  }

  const handleCancel = () => {
    formVisible.value = false
    resetForm()
  }

  return {
    formRef,
    formVisible,
    formTitle,
    formData,
    formRules,
    openAddForm,
    openEditForm,
    handleSubmit,
    handleCancel
  }
}
