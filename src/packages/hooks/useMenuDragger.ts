import { events } from "../mitt/events"

export function useMenuDragger(containerRef:any,data:any){
  let currentComponent: any = null

  const dragenter = (e: any) => {
    e.dataTransfer.dropEffect = 'move'
  }
  const dragover = (e: any) => {
    e.preventDefault()
  }
  const dragleave = (e: any) => {
    e.dataTransfer.dropEffect = 'none'
  }
  const drop = (e: any) => {
    const blocks = data.value.blocks //内部已经渲染的组件
    data.value = {
      ...data.value, blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentComponent.key,
          alignCenter: true
        }
      ]
    }
  }

  const dragstart = (e: any, component: any) => {
    // e.dataTransfer.dropEffect = 'move'
    // dragenter 进入元素 添加移动标识
    // dragover 在目标元素经过 阻止默认行为
    // dragleave 离开元素 增加禁用标识
    // drop 松手 添加组件
    containerRef.value?.addEventListener('dragenter', dragenter)
    containerRef.value?.addEventListener('dragover', dragover)
    containerRef.value?.addEventListener('dragleave', dragleave)
    containerRef.value?.addEventListener('drop', drop)
    currentComponent = component

    events.emit('start') // 发布事件
  }


  const dragend = () => {
    containerRef.value?.removeEventListener('dragenter', dragenter)
    containerRef.value?.removeEventListener('dragover', dragover)
    containerRef.value?.removeEventListener('dragleave', dragleave)
    containerRef.value?.removeEventListener('drop', drop)
    currentComponent = null
    events.emit('end')
  }

  return {
    dragstart,dragend
  }
}