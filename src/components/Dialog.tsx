import { ElDialog, ElInput, ElButton } from "element-plus";
import { createVNode, defineComponent, reactive, render, SetupContext } from "vue";


const DialogComponent = defineComponent({

  props: {
    option: { type: Object }
  },

  setup(props, ctx: SetupContext) {

    const state = reactive({
      option: props.option,
      isShow: false,
    })

    ctx.expose({
      showDialog(option: any) {
        state.option = option;
        state.isShow = true
      }
    })

    const onCancel = () => {
      state.isShow = false;
    }

    const onConfirm = () => {
      state.isShow = false;
      state.option?.onConfirm && state.option.onConfirm(state.option.content)
    }

    return () => {
      return <ElDialog v-model={state.isShow} title={state.option?.title}>
        {{
          default: () =>
            <ElInput
              type="textarea"
              v-model={state.option!.content}
              autosize={{ minRows: 10 }}
            />,
          footer: () => state.option?.footer && <div>
            <ElButton type='primary' onClick={onCancel}>取消</ElButton>
            <ElButton type='primary' onClick={onConfirm}>确认</ElButton>

          </div>
        }}

      </ElDialog>
    }
  }
})

let vm: any

export function $dialog(option: any) {
  // 手动挂载组件
  if (!vm) {
    const el = document.createElement('div')
    // vnode
    vm = createVNode(DialogComponent, { option })

    // 挂载渲染后的 vnode 到 el 上
    document.body.appendChild((render(vm, el), el))
  }


  const { showDialog } = vm.component?.exposed

  showDialog(option)
}