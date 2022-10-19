// 列表区域显示所有物料信息
// 映射关系 record
import { ElButton, ElInput } from 'element-plus'

const createEditorConfig = () => {
  const componentList: any[] = []
  const componentMap: any = {}


  return {
    componentList,
    componentMap,
    register: (component: any) => {
      componentList.push(component);
      componentMap[component.key] = component
    }
  }
}

export const registerConfig = createEditorConfig();

registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: () => '渲染文本',
  key: 'text'
})

registerConfig.register({
  label: '按钮',
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
  key: 'button'
})

registerConfig.register({
  label: '输入框',
  preview: () => <ElInput placeholder='预览输入框'></ElInput>,
  render: () => <ElInput placeholder='渲染输入框'>输入框</ElInput>,
  key: 'input'
})