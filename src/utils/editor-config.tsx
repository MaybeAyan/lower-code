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

const createInputProp = (label: string) => ({ type: 'input', label })
const createColorProp = (label: string) => ({ type: 'color', label })
const createSelectProp = (label: string, options: any) => ({ type: 'select', label, options })

registerConfig.register({
  label: '文本',
  preview: () => '预览文本',
  render: (item: any) => <span style={{ color: item.props.color, fontSize: item.props.size }}>{item.props.text || '渲染文本'}</span>,
  key: 'text',
  props: {
    text: createInputProp('文本内容'),
    color: createColorProp('字体颜色'),
    size: createSelectProp('字体大小', [
      {
        label: '14px', value: '14px'
      },
      {
        label: '16px', value: '16px'
      },
      {
        label: '20px', value: '20px'
      },
      {
        label: '24px', value: '24px'
      },
    ])
  }
})

registerConfig.register({
  label: '按钮',
  preview: () => <ElButton>预览按钮</ElButton>,
  render: (item: any) => <ElButton type={item.props.type} size={item.props.size}>{item.props.text || '渲染按钮'}</ElButton>,
  key: 'button',
  props: {
    text: createInputProp('按钮内容'),
    type: createSelectProp('按钮类型', [
      {
        label: '基础', value: 'primary'
      },
      {
        label: '成功', value: 'success'
      },
      {
        label: '警告', value: 'warning'
      },
      {
        label: '危险', value: 'danger'
      },
      {
        label: '文本', value: 'text'
      },
    ]),
    size: createSelectProp('按钮尺寸', [
      {
        label: '默认', value: ''
      },
      {
        label: '中等', value: 'medium'
      },
      {
        label: '小', value: 'small'
      },
      {
        label: '极小', value: 'mini'
      }
    ])
  }
})

registerConfig.register({
  label: '输入框',
  preview: () => <ElInput placeholder='预览输入框'></ElInput>,
  render: () => <ElInput placeholder='渲染输入框'>输入框</ElInput>,
  key: 'input'
})