<template>
  <div class="outline-editing-stage">
    <div class="stage-header">
      <h2 class="stage-title">编辑文章大纲</h2>
      <p class="stage-subtitle">您可以编辑、调整章节顺序，或添加新章节</p>
    </div>

    <div class="outline-list" ref="outlineListRef">
      <div
          v-for="(section, index) in outlineSections"
          :key="section.section"
          class="outline-section"
          :data-section-id="section.section"
      >
        <div class="section-header">
          <span class="drag-handle" title="拖动排序">⋮⋮</span>
          <span class="section-number">{{ index + 1 }}</span>
          <a-input
              v-model:value="section.title"
              placeholder="章节标题"
              class="section-title-input"
          />
          <a-button
              type="text"
              danger
              @click="deleteSection(index)"
              class="delete-btn"
          >
            <template #icon>
              <DeleteOutlined />
            </template>
          </a-button>
        </div>


        <div class="section-points">
          <div v-for="(point, pointIdx) in section.points" :key="pointIdx" class="point-item">
            <span class="point-bullet">•</span>
            <a-input
                v-model:value="section.points[pointIdx]"
                placeholder="要点内容"
                class="point-input"
            />
            <a-button
                type="text"
                size="small"
                @click="deletePoint(index, pointIdx)"
                class="delete-point-btn"
            >
              ×
            </a-button>
          </div>

          <a-button
              type="dashed"
              @click="addPoint(index)"
              class="add-point-btn"
          >
            <template #icon>
              <PlusOutlined />
            </template>
            添加要点
          </a-button>
        </div>
      </div>
    </div>

    <div class="ai-chat-section">
      <div class="chat-header">
        <RobotOutlined />
        <span>AI 助手修改大纲</span>
      </div>

      <div class="chat-input-wrapper">
        <a-textarea
            v-model:value="modifySuggestion"
            placeholder="告诉 AI 如何修改大纲，例如：请在第二章节后增加一个关于实践案例的章节"
            :rows="3"
            :maxlength="500"
            show-count
            class="chat-textarea"
        />
        <a-button
            type="primary"
            :loading="aiModifying"
            :disabled="!modifySuggestion.trim()"
            @click="handleAiModify"
            class="ai-modify-btn"
        >
          <template #icon>
            <RobotOutlined />
          </template>
          AI 修改大纲
        </a-button>
      </div>
    </div>

    <div class="actions">
      <a-button
          size="large"
          @click="addSection"
          class="add-section-btn"
      >
        <template #icon>
          <PlusOutlined />
        </template>
        添加章节
      </a-button>

      <a-button
          type="primary"
          size="large"
          :loading="loading"
          :disabled="!canConfirm"
          @click="handleConfirm"
          class="confirm-btn"
      >
        <template #icon>
          <CheckOutlined />
        </template>
        确认并生成正文
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">

import {computed, nextTick, onMounted, ref, watch} from "vue";
import Sortable from "sortablejs";
import {message} from "ant-design-vue";
import {aiModifyOutline} from "@/api/articleController.ts";

interface OutlineSection {
  section: number
  title: string
  points: string[]
}

interface Props {
  outline: API.OutlineSection[]
  taskId: string
  loading?: boolean
}

interface Emits {
  (e: 'confirm', outline: OutlineSection[]): void
  (e: 'outline-updated', outline: OutlineSection[]): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

// 转换 API 类型为内部类型
const outlineSections = ref<OutlineSection[]>(
    props.outline.map((item, index) => ({
      section: item.section ?? index + 1,
      title: item.title ?? '',
      points: item.points ?? []
    }))
)

// 调试日志：打印接收到的大纲数据（生产环境可注释）
// console.log('OutlineEditingStage 接收到 props.outline:', props.outline)
// console.log('OutlineEditingStage 转换后的 outlineSections:', outlineSections.value)

// 监听 props.outline 变化，同步更新内部状态
watch(() => props.outline, (newOutline) => {
  // console.log('props.outline 发生变化:', newOutline)
  if (newOutline && newOutline.length > 0) {
    outlineSections.value = newOutline.map((item, index) => ({
      section: item.section ?? index + 1,
      title: item.title ?? '',
      points: item.points ?? []
    }))
    // console.log('outlineSections 已同步更新:', outlineSections.value)
  }
}, { deep: true })
const outlineListRef = ref<HTMLElement | null>(null)
const modifySuggestion = ref('')
const aiModifying = ref(false)

const canConfirm = computed(() => {
  return outlineSections.value.length > 0 &&
      outlineSections.value.every(section =>
          section.title.trim() &&
          section.points.length > 0 &&
          section.points.every(point => point.trim())
      )
})

onMounted(() => {
  nextTick(() => {
    if (outlineListRef.value) {
      Sortable.create(outlineListRef.value, {
        animation: 150,
        handle: '.drag-handle',
        onEnd: (evt) => {
          const { oldIndex, newIndex } = evt
          if (oldIndex !== undefined && newIndex !== undefined) {
            const item = outlineSections.value.splice(oldIndex, 1)[0]
            outlineSections.value.splice(newIndex, 0, item)
            // 更新 section 序号
            outlineSections.value.forEach((sec, idx) => {
              sec.section = idx + 1
            })
          }
        }
      })
    }
  })
})

const addSection = () => {
  const newSection: OutlineSection = {
    section: outlineSections.value.length + 1,
    title: '',
    points: ['']
  }
  outlineSections.value.push(newSection)
}

const deleteSection = (index: number) => {
  outlineSections.value.splice(index, 1)
  // 更新 section 序号
  outlineSections.value.forEach((sec, idx) => {
    sec.section = idx + 1
  })
}

const addPoint = (sectionIndex: number) => {
  outlineSections.value[sectionIndex].points.push('')
}

const deletePoint = (sectionIndex: number, pointIndex: number) => {
  const section = outlineSections.value[sectionIndex]
  if (section.points.length > 1) {
    section.points.splice(pointIndex, 1)
  }
}

const handleConfirm = () => {
  emit('confirm', outlineSections.value)
}

const handleAiModify = async () => {
  if (!modifySuggestion.value.trim()) {
    message.warning('请输入修改建议')
    return
  }

  aiModifying.value = true
  try {
    const res = await aiModifyOutline({
      taskId: props.taskId,
      modifySuggestion: modifySuggestion.value
    })

    if (res.data.data) {
      outlineSections.value = res.data.data.map((item, index) => ({
        section: item.section ?? index + 1,
        title: item.title ?? '',
        points: item.points ?? []
      }))
      modifySuggestion.value = ''
      // 通知父组件大纲已更新
      emit('outline-updated', outlineSections.value)
      message.success('AI 已根据您的建议修改大纲')
    }
  } catch (error) {
    const err = error as Error
    message.error(err.message || 'AI 修改失败')
  } finally {
    aiModifying.value = false
  }
}
</script>

<style scoped lang="scss">
.outline-editing-stage {
  max-width: 800px;
  margin: 0 auto;
}

.stage-header {
  text-align: center;
  margin-bottom: 32px;
}

.stage-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--color-text);
  letter-spacing: -0.5px;
}

.stage-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 大纲章节列表 */
.outline-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.outline-section {
  background: var(--color-background-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  padding: 20px;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--color-primary-light);
    box-shadow: var(--shadow-sm);
  }
}

/* 章节头部 */
.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}

.drag-handle {
  cursor: grab;
  color: var(--color-text-muted);
  font-size: 16px;
  letter-spacing: -2px;
  user-select: none;
  padding: 4px 2px;
  line-height: 1;
  flex-shrink: 0;

  &:active {
    cursor: grabbing;
  }
}

.section-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.section-title-input {
  flex: 1;
  font-size: 15px;
  font-weight: 500;
  border-radius: var(--radius-md);

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
}

.delete-btn {
  flex-shrink: 0;
}

/* 要点列表 */
.section-points {
  padding-left: 38px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.point-bullet {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  line-height: 1;
}

.point-input {
  flex: 1;
  font-size: 13px;
  border-radius: var(--radius-sm);
  background: white;

  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
}

.delete-point-btn {
  flex-shrink: 0;
  font-size: 16px;
  line-height: 1;
  padding: 0 6px;
  height: auto;
  color: var(--color-text-muted);

  &:hover {
    color: var(--color-error);
  }
}

.add-point-btn {
  margin-top: 4px;
  border-style: dashed;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  font-size: 13px;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

/* AI 助手区域 */
.ai-chat-section {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(99, 102, 241, 0.02) 100%);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: var(--radius-lg);
  padding: 20px;
  margin-bottom: 24px;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary-dark);
  margin-bottom: 14px;

  .anticon {
    font-size: 16px;
  }
}

.chat-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.chat-textarea {
  flex: 1;
  font-size: 13px;
  border-radius: var(--radius-md);

  &:focus,
  &:focus-within {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
  }
}

.ai-modify-btn {
  height: auto;
  min-height: 40px;
  padding: 8px 20px;
  font-weight: 500;
  border-radius: var(--radius-md);
  white-space: nowrap;
  flex-shrink: 0;
}

/* 底部操作栏 */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid var(--color-border);
}

.add-section-btn {
  height: 44px;
  font-size: 14px;
  border-radius: var(--radius-md);
  border-color: var(--color-border);
  font-weight: 500;

  &:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }
}

.confirm-btn {
  height: 44px;
  font-size: 14px;
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: 0 32px;
}

/* 响应式 */
@media (max-width: 768px) {
  .section-points {
    padding-left: 0;
  }

  .chat-input-wrapper {
    flex-direction: column;
  }

  .ai-modify-btn {
    width: 100%;
    justify-content: center;
  }

  .actions {
    flex-direction: column;
    gap: 12px;
  }

  .add-section-btn,
  .confirm-btn {
    width: 100%;
  }
}
</style>
