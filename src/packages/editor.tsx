import { computed, inject, ref, defineComponent, SetupContext } from 'vue'
import './editor.scss'
import EditorBlock from './editor-block'
import deepcopy from 'deepcopy'
import { useMenuDragger } from './hooks/useMenuDragger'
import { useFocus } from './hooks/useFocus'
import { useCommand } from './hooks/useCommand'
import { $dialog } from '@/components/Dialog'
import EditorOperator from './editor-operator'
import { events } from "./mitt/events";
import { ElButton } from "element-plus";


const editor = defineComponent({

  props: {
    modelValue: {
      type: Object
    }
  },

  setup(props, ctx: SetupContext) {


    // 预览模式
    const previewFlag = ref(false)
    const editorRef = ref(true)

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
    const { containerMousedown, focusData, clearBlockFocus } = useFocus(data, previewFlag)

    const config: any = inject('config')

    const { commands } = useCommand(data, focusData)
    const btns = [
      { label: '撤销', handler: () => commands.undo() },
      { label: '重做', handler: () => commands.redo() },
      {
        label: '导出', handler: () => {
          $dialog({
            title: '导出 Json 使用',
            content: JSON.stringify(data.value),
            footer: true,
          })
        }
      },
      {
        label: '导入', handler: () => {
          $dialog({
            title: '导入 Json 使用',
            content: '',
            footer: true,
            onConfirm(text: any) {
              // 无法获取重做撤销的队列
              // data.value = JSON.parse(text)
              commands.updateContainer(JSON.parse(text));
            }
          })
        }
      },
      { label: '置顶', handler: () => commands.placeTop() },
      { label: '置底', handler: () => commands.placeBottom() },
      { label: '删除', handler: () => commands.delete() },
      {
        label: () => previewFlag.value ? '编辑' : '预览', handler: () => {
          previewFlag.value = !previewFlag.value;
          clearBlockFocus();
        }
      },
      { label: '关闭', handler: () => { editorRef.value = false; clearBlockFocus(); } }

    ]


    const SelectBlock = ref<object>()

    events.on('idx', (idx: any) => {
      SelectBlock.value = data.value.blocks[idx]
    })


    return () => {

      return (
        !editorRef.value ?
          <div>
            <div
              class={"editor-container-canvas_content"}
              style={[containerStyles.value, "margin:0"]}
            >
              {
                (data.value.blocks.map((block: any, index: number) => (
                  <EditorBlock
                    block={block}
                    indexblock={index}
                    focusData={focusData}
                    clearBlockFocus={clearBlockFocus}
                    previewFlag={previewFlag}
                  ></EditorBlock>
                )))
              }
            </div>
            <div><ElButton type="primary" onClick={() => editorRef.value = true}>继续编辑</ElButton></div>
          </div> :
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
              {btns.map((btn) => {
                const label = typeof btn.label === 'function' ? btn.label() : btn.label;
                return <div class={"editor-top-button"} onClick={btn.handler}>
                  <button>{label}</button>
                </div>
              })}
            </div>
            <div class={"editor-right"}>
              {/* 右侧属性操作栏 */}
              <EditorOperator
                data={data.value}
                block={SelectBlock.value}
              // updateContainer={commands.updateContainer}
              // updateBlock={commands.updateBlock}
              ></EditorOperator>
            </div>
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
                        previewFlag={previewFlag}
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