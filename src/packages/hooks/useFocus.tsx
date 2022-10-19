import { computed } from 'vue'

export function useFocus(data: any) {
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
    clearBlockFocus()
  }

  return { focusData, containerMousedown, clearBlockFocus }
}