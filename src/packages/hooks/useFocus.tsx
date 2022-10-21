import { computed, Ref } from 'vue'

export function useFocus(data: any, previewFlag: Ref<boolean>) {
  const focusData = computed(() => {
    const focus: any[] = []
    const unfocused: any[] = []
    data.value.blocks.forEach((block: any) => (block.focus ? focus : unfocused).push(block))
    return { focus, unfocused }
  })

  // 清空焦点
  const clearBlockFocus = () => {
    data.value.blocks.forEach((block: any) => block.focus = false)
  }

  // 清空焦点
  const containerMousedown = () => {
    if (previewFlag.value) return
    clearBlockFocus()
  }

  return { focusData, containerMousedown, clearBlockFocus }
}