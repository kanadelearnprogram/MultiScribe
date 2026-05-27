<template>
  <div class="title-selecting-stage">
    <div class="stage-header">
      <h2 class="stage-title">选择标题方案</h2>
      <p class="stage-subtitle">AI 为您生成了以下标题，请选择一个或自定义</p>
    </div>

    <a-radio-group v-model:value="selectedIndex" class="title-options">
      <div v-for="(option, index) in titleOptions" :key="index" class="title-option">
        <a-radio :value="index">
          <div class="title-content">
            <div class="title-main">{{ option.mainTitle }}</div>
            <div class="title-sub">{{ option.subTitle }}</div>
          </div>
        </a-radio>
      </div>

      <div class="title-option custom">
        <a-radio :value="-1">
          <div class="title-content">
            <div class="title-main">自定义标题</div>
          </div>
        </a-radio>

        <div v-if="selectedIndex === -1" class="custom-inputs">
          <a-input
              v-model:value="customMainTitle"
              placeholder="输入主标题"
              class="custom-input"
          />
          <a-input
              v-model:value="customSubTitle"
              placeholder="输入副标题"
              class="custom-input"
          />
        </div>
      </div>
    </a-radio-group>

    <div class="description-section">
      <label class="section-label">补充描述（可选）</label>
      <p class="section-tip">补充您对文章的期望、重点强调的内容等</p>
      <a-textarea
          v-model:value="userDescription"
          placeholder="例如：请重点强调技术原理，用通俗的语言讲解..."
          :rows="4"
          :maxlength="500"
          show-count
          class="description-textarea"
      />
    </div>

    <div class="actions">
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
        确认并生成大纲
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">

import {computed, ref} from "vue";

interface TitleOption {
  mainTitle: string
  subTitle: string
}

interface Props {
  titleOptions: TitleOption[]
  loading?: boolean
}

interface Emits {
  (e: 'confirm', data: {
    mainTitle: string
    subTitle: string
    userDescription: string
  }): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<Emits>()

const selectedIndex = ref<number>(0)
const customMainTitle = ref('')
const customSubTitle = ref('')
const userDescription = ref('')

const canConfirm = computed(() => {
  if (selectedIndex.value === -1) {
    return customMainTitle.value.trim() && customSubTitle.value.trim()
  }
  return selectedIndex.value >= 0 && selectedIndex.value < props.titleOptions.length
})

const handleConfirm = () => {
  let mainTitle = ''
  let subTitle = ''

  if (selectedIndex.value === -1) {
    mainTitle = customMainTitle.value
    subTitle = customSubTitle.value
  } else {
    const selected = props.titleOptions[selectedIndex.value]
    mainTitle = selected.mainTitle
    subTitle = selected.subTitle
  }

  emit('confirm', {
    mainTitle,
    subTitle,
    userDescription: userDescription.value
  })
}
</script>

<style scoped lang="scss">
.title-selecting-stage {
  max-width: 760px;
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

/* 标题选项列表 */
.title-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 28px;

  :deep(.ant-radio-wrapper) {
    margin-right: 0;
    display: flex;
    align-items: flex-start;
  }

  :deep(.ant-radio) {
    margin-top: 3px;
  }
}

/* 选项卡片 */
.title-option {
  background: var(--color-background-secondary);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  transition: all var(--transition-fast);
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary-light);
    box-shadow: var(--shadow-sm);
  }

  /* 选中高亮 */
  &:has(.ant-radio-wrapper-checked) {
    border-color: var(--color-primary);
    background: rgba(99, 102, 241, 0.04);
    box-shadow: 0 0 0 1px var(--color-primary);

    .title-main {
      color: var(--color-primary);
    }
  }
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-main {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.5;
  transition: color var(--transition-fast);
}

.title-sub {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* 自定义标题输入 */
.custom-inputs {
  margin-top: 12px;
  padding-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-input {
  border-radius: var(--radius-md);
  font-size: 14px;
}

/* 补充描述 */
.description-section {
  margin-bottom: 28px;
}

.section-label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.section-tip {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0 0 10px;
}

.description-textarea {
  border-radius: var(--radius-md);
}

/* 确认按钮 */
.actions {
  text-align: center;
}

.confirm-btn {
  min-width: 200px;
  height: 44px;
  font-size: 15px;
  font-weight: 500;
  border-radius: var(--radius-md);
}
</style>
