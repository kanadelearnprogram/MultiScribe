<template>
  <div class="article-list-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-container">
        <div class="header-content">
          <h1 class="page-title">历史文章</h1>
          <p class="page-subtitle">管理您创作的所有文章</p>
        </div>
        <a-button type="primary" size="large" @click="goToCreate">
          <template #icon>
            <PlusOutlined />
          </template>
          创作新文章
        </a-button>
      </div>
    </div>

    <div class="container">
      <a-card :bordered="false" class="filter-card">
        <div class="filter-bar">
          <span class="filter-label">状态筛选：</span>
          <a-radio-group v-model:value="filterStatus" button-style="solid" size="small" @change="onFilterChange">
            <a-radio-button
              v-for="opt in STATUS_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </a-radio-button>
          </a-radio-group>
        </div>
      </a-card>

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
            <template v-if="column.key === 'cover'">
              <div class="cover-cell">
                <img v-if="record.coverImage" :src="record.coverImage" class="cover-thumb" />
                <div v-else class="cover-placeholder">
                  <FileTextOutlined />
                </div>
              </div>
            </template>

            <template v-if="column.key === 'topic'">
              <a class="topic-link" @click="viewArticle(record)">{{ record.topic }}</a>
            </template>

            <template v-else-if="column.key === 'title'">
              <div class="title-cell">
                <div class="title-row">
                  <span class="main-title">{{ record.mainTitle || '未生成标题' }}</span>
                  <a-tag v-if="record.style" :color="getStyleColor(record.style)" class="style-tag">
                    {{ getStyleText(record.style) }}
                  </a-tag>
                </div>
                <div v-if="record.subTitle" class="sub-title">{{ record.subTitle }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusTagColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'createTime'">
              {{ formatDate(record.createTime) }}
            </template>

            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="viewArticle(record)">查看</a-button>
                <a-popconfirm
                    title="确定要删除这篇文章吗？"
                    ok-text="确定"
                    cancel-text="取消"
                    @confirm="deleteArticle(record)"
                >
                  <a-button type="link" size="small" danger>删除</a-button>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>

        <a-empty
          v-if="!loading && dataSource.length === 0"
          description="还没有文章记录"
          class="empty-state"
        >
          <a-button type="primary" @click="goToCreate">
            <template #icon><PlusOutlined /></template>
            去创作第一篇文章
          </a-button>
        </a-empty>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, FileTextOutlined } from '@ant-design/icons-vue'
import { listArticle, deleteArticle as deleteArticleApi, type ArticleVO } from '@/api/articleController'
import { getStatusText, getStatusTagColor, getStyleText } from '@/utils/article'
import { STATUS_OPTIONS } from '@/constants/article'
import dayjs from 'dayjs'

const router = useRouter()

const filterStatus = ref('')

const columns = [
  {
    title: '封面',
    key: 'cover',
    width: 80,
  },
  {
    title: '选题',
    key: 'topic',
    width: 160,
  },
  {
    title: '标题',
    key: 'title',
    width: 280,
  },
  {
    title: '状态',
    key: 'status',
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
    width: 140,
  },
]

const loading = ref(false)
const dataSource = ref<ArticleVO[]>([])
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
})

const loadData = async () => {
  loading.value = true
  try {
    const params: API.ArticleQueryRequest = {
      pageNum: pagination.value.current,
      pageSize: pagination.value.pageSize,
    }
    if (filterStatus.value) {
      params.status = filterStatus.value
    }
    const res = await listArticle(params)
    dataSource.value = res.data.data?.records || []
    pagination.value.total = res.data.data?.totalRow || 0
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const onFilterChange = () => {
  pagination.value.current = 1
  loadData()
}

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadData()
}

const viewArticle = (record: ArticleVO) => {
  router.push(`/article/${record.taskId}`)
}

const deleteArticle = async (record: ArticleVO) => {
  try {
    await deleteArticleApi({ id: record.id })
    message.success('删除成功')
    if (dataSource.value.length === 1 && pagination.value.current > 1) {
      pagination.value.current--
    }
    loadData()
  } catch (error: any) {
    message.error(error.message || '删除失败')
  }
}

const goToCreate = () => {
  router.push('/create')
}

const formatDate = (date?: string) => {
  if (!date) return '-'
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

const getStyleColor = (style: string) => {
  const colorMap: Record<string, string> = {
    tech: 'blue',
    emotional: 'pink',
    educational: 'green',
    humorous: 'orange',
  }
  return colorMap[style] || 'default'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.article-list-page {
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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

  .filter-card {
    margin-bottom: 16px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);

    :deep(.ant-card-body) {
      padding: 14px 20px;
    }

    .filter-bar {
      display: flex;
      align-items: center;
      gap: 14px;

      .filter-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-secondary);
        white-space: nowrap;
      }
    }
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

  .cover-cell {
    width: 56px;
    height: 40px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .cover-thumb {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cover-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-muted);
      font-size: 16px;
      background: var(--color-background-tertiary);
    }
  }

  .topic-link {
    color: var(--color-primary);
    cursor: pointer;
    font-weight: 500;
    font-size: 13px;

    &:hover {
      color: var(--color-primary-dark);
      text-decoration: underline;
    }
  }

  .title-cell {
    .title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .main-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text);
    }

    .style-tag {
      font-size: 11px;
      line-height: 18px;
      margin: 0;
    }

    .sub-title {
      font-size: 12px;
      color: var(--color-text-secondary);
      margin-top: 4px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 280px;
    }
  }

  .empty-state {
    padding: 80px 0;
  }
}

@media (max-width: 768px) {
  .article-list-page {
    .page-header {
      padding: 20px 16px;

      .header-container {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
      }
    }

    .container {
      padding: 0 12px 32px;
    }
  }
}
</style>
