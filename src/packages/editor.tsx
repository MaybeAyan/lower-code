import { computed, inject, ref, defineComponent } from 'vue'
import './editor.scss'
import EditorBlock from './editor-block'
import deepcopy from 'deepcopy'
import { useMenuDragger } from './hooks/useMenuDragger'
import { useFocus } from './hooks/useFocus'
import { useCommand } from './hooks/useCommand'


const editor = defineComponent({

  props: {
    modelValue: {
      type: Object
    }
  },

  setup(props: any, ctx: any) {

    // 双向绑定数据
    const data = computed({
      get() {
        return props.modelValue
      },
      set(newValue: any) {
        ctx.emit('update:modelValue', deepcopy(newValue))
      }
    })

    // 获取宽高
    const containerStyles = computed(() => ({
      width: data.value.container.width + 'px',
      height: data.value.container.height + 'px'
    }))

    const containerRef = ref<HTMLElement | null>(null)

    // 实现菜单拖拽
    const { dragstart, dragend } = useMenuDragger(containerRef, data)

    // 实现获取焦点，选中后可拖拽
    const { containerMousedown, focusData, clearBlockFocus } = useFocus(data)

    const config: any = inject('config')

    const { commands } = useCommand(data)
    const btns = [
      { label: '撤销', handler: () => commands.undo() },
      { label: '重做', handler: () => commands.redo() }
    ]

    return () => {


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
          <div class={"editor-top"}>
            {btns.map((btn, index) => {
              return <div class={"editor-top-button"} onClick={btn.handler}>
                <button>{btn.label}</button>
              </div>
            })}
          </div>
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
                    ></EditorBlock>
                  )))
                }
              </div>
            </div>
          </div>
        </div >
      )
    }


  }

})

export default editor