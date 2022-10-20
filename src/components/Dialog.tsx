import { ElDialog } from "element-plus";
import { createVNode, defineComponent, render } from "vue";


const DialogComponent = defineComponent({

  props: {
    option: { type: Object }
  },

  setup() {
    return () => {
      return <ElDialog></ElDialog>
    }
  }
})



export function $dialog(option: any) {
  // 手动挂载组件
  const el = document.createElement('div')

  // vnode
  const vm = createVNode(DialogComponent, { option })

  // 挂载渲染后的 vnode 到 el 上
  document.body.appendChild((render(vm, el), el))

}