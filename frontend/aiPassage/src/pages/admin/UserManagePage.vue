<template>
  <div class="user-manage-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-container">
        <div class="header-content">
          <h1 class="page-title">用户管理</h1>
          <p class="page-subtitle">管理系统用户账号和权限</p>
        </div>
      </div>
    </div>

    <div class="container">
      <a-card :bordered="false" class="table-card">
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'userAvatar'">
              <a-avatar :src="record.userAvatar" :size="36">
                <template #icon>
                  <UserOutlined />
                </template>
              </a-avatar>
            </template>

            <template v-else-if="column.key === 'userRole'">
              <a-tag :color="record.userRole === 'admin' ? '#6366F1' : 'default'">
                {{ record.userRole === 'admin' ? '管理员' : '普通用户' }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'createTime'">
              {{ formatDate(record.createTime) }}
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-popconfirm
                  v-if="record.userRole !== 'admin'"
                  title="确定要删除该用户吗？"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="deleteUser(record)"
                >
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm>
                <span v-else class="admin-tip">—</span>
              </a-space>
            </template>
          </template>
        </a-table>

        <a-empty
          v-if="!loading && dataSource.length === 0"
          description="暂无用户数据"
          class="empty-state"
        />
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { UserOutlined } from '@ant-design/icons-vue'
import { listUserVoByPage, deleteUser as deleteUserApi } from '@/api/userController'
import dayjs from 'dayjs'

const columns = [
  {
    title: 'ID',
    key: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '账号',
    key: 'userAccount',
    dataIndex: 'userAccount',
    width: 140,
    ellipsis: true,
  },
  {
    title: '用户名',
    key: 'userName',
    dataIndex: 'userName',
    width: 140,
  },
  {
    title: '头像',
    key: 'userAvatar',
    width: 80,
  },
  {
    title: '简介',
    key: 'userProfile',
    dataIndex: 'userProfile',
    ellipsis: true,
  },
  {
    title: '用户角色',
    key: 'userRole',
    width: 100,
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 170,
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
  },
]

const loading = ref(false)
const dataSource = ref<API.UserVO[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await listUserVoByPage({
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    })
    dataSource.value = res.data.data?.records || []
    pagination.value.total = res.data.data?.totalRow || 0
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

const deleteUser = async (record: API.UserVO) => {
  try {
    await deleteUserApi({ id: record.id })
    message.success('删除成功')
    if (dataSource.value.length === 1 && pagination.value.current > 1) {
      pagination.value.current--
    }
    loadData()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.user-manage-page {
  min-height: calc(100vh - 64px);
  background: var(--color-background-secondary);

  .page-header {
    background: var(--gradient-hero);
    padding: 28px 24px;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--color-border);
  }

  .header-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  .header-content {
    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px;
      color: var(--color-text);
      letter-spacing: -0.5px;
    }

    .page-subtitle {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin: 0;
    }
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 24px 40px;
  }

  .table-card {
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);

    :deep(.ant-card-body) {
      padding: 0;
    }

    :deep(.ant-table) {
      .ant-table-thead > tr > th {
        background: var(--color-background-secondary);
        color: var(--color-text-secondary);
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border);
      }

      .ant-table-tbody > tr > td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--color-border-light);
      }

      .ant-table-tbody > tr:hover > td {
        background: rgba(99, 102, 241, 0.02);
      }

      .ant-table-tbody > tr:last-child > td {
        border-bottom: none;
      }

      .ant-pagination {
        padding: 16px 20px;
      }
    }
  }

  .admin-tip {
    color: var(--color-text-muted);
  }

  .empty-state {
    padding: 80px 0;
  }
}

@media (max-width: 768px) {
  .user-manage-page {
    .page-header {
      padding: 20px 16px;
    }

    .container {
      padding: 0 12px 32px;
    }
  }
}
</style>
