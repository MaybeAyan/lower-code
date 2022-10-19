import { computed, inject, ref } from 'vue'
import './editor.scss'
import EditorBlock from './editor-block'
import deepcopy from 'deepcopy'
import { useMenuDragger } from './hooks/useMenuDragger'
import { useFocus } from './hooks/useFocus'

type Props = {
  modelValue: any
}

const editor = (props: Props, ctx: any) => {
  const data = computed({
    get() {
      return props.modelValue
    },
    set(newValue: any) {
      ctx.emit('update:modelValue', deepcopy(newValue))
    }
  })

  const containerStyles = computed(() => ({
    width: data.value.container.width + 'px',
    height: data.value.container.height + 'px'
  }))

  const containerRef = ref<HTMLElement | null>(null)
  const blockRef = ref<HTMLElement | null>(null)
  const markline = {}

  // 实现菜单拖拽
  const { dragstart, dragend } = useMenuDragger(containerRef, data)

  // 实现获取焦点，选中后可拖拽
  const { containerMousedown, focusData, clearBlockFocus } = useFocus(data)

  const config: any = inject('config')

  return (
    <div class={"editor"}>
      <div class={"editor-left"}>
        {/* 根据注册列表 渲染对应的内容 实现拖拽 */}
        {config.componentList.map((component: any) => (
          <div
            class={"editor-left-item"}
            draggable
            onDragstart={e => dragstart(e, component)}
            onDragend={dragend}
          >
            <span>{component.label}</span>
            <div>{component.preview()}</div>
          </div>
        ))}
      </div>
      <div class={"editor-top"}>菜单</div>
      <div class={"editor-right"}>属性控制板块</div>
      <div class={"editor-container"}>
        {/* 滚动条 */}
        <div class={"editor-container-canvas"}>
          {/* 产生内容区域 */}
          <div
            class={"editor-container-canvas_content"}
            style={containerStyles.value}
            ref={containerRef}
            onMousedown={containerMousedown}
          >
            {
              (data.value.blocks.map((block: any, index: number) => (
                <EditorBlock
                  block={block}
                  indexblock={index}
                  focusData={focusData}
                  clearBlockFocus={clearBlockFocus}
                  ref={blockRef}
                  markline={markline}
                ></EditorBlock>
              )))
            }
          </div>
        </div>
      </div>
    </div >
  )
}




export default editor