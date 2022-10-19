import deepcopy from "deepcopy"
import { computed, defineComponent, inject, onMounted, ref, watch } from "vue"
import { useBlockDragger } from "./hooks/useBlockDragger"

const EditorBlock = defineComponent({
  props: {
    block: {
      type: Object
    },
    clearBlockFocus: {
      type: Function
    },
    focusData: {
      type: Object
    },
    indexblock: {
      type: Number
    },
    markline: {
      type: Object
    }
  },
  setup(props: any, ctx: any) {
    const blockStyle = computed(() => ({
      top: `${props.block.top}px`,
      left: `${props.block.left}px`,
      zIndex: `${props.block.zIndex}`,
    }))

    const block: any = computed({
      get() {
        return props.block
      },
      set(newValue) {
        ctx.emit('update:block', deepcopy(newValue))
      }
    })

    const config: any = inject('config')
    const blockRef = ref<HTMLElement | null>(null)
    const data: any = inject('data')
    const select = ref<number>(-1)


    const lastSelectBlock = computed(() => data.value.blocks[select.value])


    // 实现渲染区域组件的拖拽 
    const { mousedown, markline } = useBlockDragger(props.focusData, lastSelectBlock)

    watch(() => markline, (newValue) => {
      console.log(newValue)
    })


    const blockMousedown = (e: MouseEvent, block: any, index: number) => {
      // 阻止默认事件和冒泡行为
      e.preventDefault()
      e.stopPropagation()

      // 记录获取焦点后的状态
      if (e.shiftKey) {
        if (props.focusData.value.focus.length <= 1) {
          block.value.focus = true
        } else {
          block.value.focus = !block.value.focus
        }

      } else {
        if (!block.value.focus) {
          props.clearBlockFocus()
          block.value.focus = true
        }
      }

      select.value = index
      mousedown(e)
    }

    onMounted(() => {
      const { offsetWidth, offsetHeight } = blockRef.value!

      // 渲染后居中
      if (block.value.alignCenter) {
        block.value.left = block.value.left - offsetWidth / 2
        block.value.top = block.value.top - offsetHeight / 2
        block.value.alignCenter = false
      }

      block.value.width = offsetWidth
      block.value.height = offsetHeight

    })


    return () => {
      // render渲染标签
      const component = config.componentMap[props.block.key] // 对应的组件配置信息
      const RenderComponent = component.render()  // 组件渲染的标签

      return (
        <div
          class={["editor-block", block.value.focus ? 'editor-block-focus' : '']}
          style={blockStyle.value as any}
          ref={blockRef}
          onMousedown={(e: MouseEvent) => blockMousedown(e, block, props.indexblock)}>
          {RenderComponent}
        </div>
      )
    }


  },
})



export default EditorBlock