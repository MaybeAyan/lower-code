import deepcopy from "deepcopy";
import { ElForm, ElFormItem, ElButton, ElInputNumber, ElInput, ElColorPicker, ElSelect, ElOption } from "element-plus";
import { defineComponent, inject, reactive, watch } from "vue";




export default defineComponent({

  props: {
    block: { type: Object },
    data: { type: Object }
  },



  setup(props, ctx) {

    const config: any = inject('config')

    const state = reactive<any>({
      editData: {}
    })

    const reset = () => {
      if (!props.block) {
        state.editData = deepcopy(props.data!.container)
      } else {
        state.editData = deepcopy(props.block!)
        console.log(state.editData.props)
      }
    }

    // const apply = () => {
    //   if (!props.block) {

    //   } else {

    //   }
    // }

    watch(() => props.block, reset, { immediate: true })

    return () => {
      const content = []

      if (!props.block) {
        content.push(<>
          <ElFormItem label="容器宽度">
            <ElInputNumber v-model={state.editData.width}></ElInputNumber>
          </ElFormItem>
          <ElFormItem label="容器高度">
            <ElInputNumber v-model={state.editData.height}></ElInputNumber>
          </ElFormItem>
        </>)
      } else {
        const component = config.componentMap[props.block.key]

        if (component && component.props) {
          const tempArr: [string, any][] = Object.entries(component.props)
          content.push(
            tempArr.map(([propsName, propsConfig]) => {
              const rightOptions: any = {
                input: () => <ElInput v-model={state.editData.props[propsName]}></ElInput>,
                color: () => <ElColorPicker v-model={state.editData.props[propsName]}></ ElColorPicker>,
                select: () => <ElSelect v-model={state.editData.props[propsName]}>
                  {propsConfig.options.map((opt: any) => {
                    return <ElOption label={opt.label} value={opt.value}></ElOption>
                  })}
                </ElSelect>
              }

              return <ElFormItem label={propsConfig.label}>
                {rightOptions[propsConfig.type]()}
              </ElFormItem>
            })
          )
        }
      }

      return (
        <ElForm labelPosition="top" style={"padding:30px"}>
          {content}
          <ElFormItem>
            <ElButton type="primary" >应用</ElButton>
            <ElButton onClick={reset}>重置</ElButton>
          </ElFormItem>

        </ElForm >
      )
    }
  }
})