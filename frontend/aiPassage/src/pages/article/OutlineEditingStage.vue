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

import {computed, nextTick, onMounted,ref} from "vue";
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
