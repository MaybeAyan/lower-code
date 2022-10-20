import { reactive } from 'vue'
import { events } from '../mitt/events'

export function useBlockDragger(focusData: any, lastSelectBlock: any, data: any) {

  let dragState: any = {
    x: null,
    y: null,
    dragging: false
  }
  const markline = reactive({
    x: null,
    y: null
  })

  const mousedown = (e: MouseEvent) => {

    const { width: BWidth, height: BHeight } = lastSelectBlock.value

    dragState = {
      startX: e.clientX,
      startY: e.clientY,
      startLeft: lastSelectBlock.value.left,
      startTop: lastSelectBlock.value.top,
      dragging: false,
      startPos: focusData.value.focus.map((item: any) => ({
        top: item.top,
        left: item.left
      })),
      lines: (() => {
        const { unfocused } = focusData.value

        const lines: any = { x: [], y: [] }; // 存放辅助线的位置
        [...unfocused, {
          top: 0,
          left: 0,
          width: data.value.container.width,
          height: data.value.container.height
        }].forEach((item: any) => {
          const { top: ATop, left: ALeft, width: AWidth, height: AHeight } = item

          lines.y.push({ showTop: ATop, top: ATop }) //顶对顶
          lines.y.push({ showTop: ATop, top: ATop - BHeight }) // 顶部对底部
          lines.y.push({ showTop: ATop + AHeight / 2, top: ATop + AHeight / 2 - BHeight / 2 }) // 中-中
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight }) // 底部对顶部
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight - BHeight }) // 底部对底部


          lines.x.push({ showLeft: ALeft, left: ALeft }) // 左左
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth }) // 右左
          lines.x.push({ showLeft: ALeft + AWidth / 2, left: ALeft + AWidth / 2 - BWidth / 2 }) // 中中
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth - BWidth }) // 左右
          lines.x.push({ showLeft: ALeft, left: ALeft - BWidth }) // 右右
        });
        return lines
      })()
    }


    document.addEventListener('mousemove', mousemove)
    document.addEventListener('mouseup', mouseup)
  }

  const mousemove = (e: MouseEvent) => {
    let { clientX: moveX, clientY: moveY } = e

    if (!dragState.dragging) {
      dragState.dragging = true;

      // 触发事件,记住拖拽前位置
      events.emit('start')
    }

    // 收集鼠标移动后的坐标
    const left = moveX - dragState.startX + dragState.startLeft
    const top = moveY - dragState.startY + dragState.startTop

    // 计算横线位置，控制辅助线显示
    for (let i = 0; i < dragState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragState.lines.y[i]
      if (Math.abs(t - top) < 5) {
        markline.y = s
        moveY = dragState.startY - dragState.startTop + t // 容器距离顶部的距离 + 目标的高度
        break
      }
    }

    // // 计算竖线位置，控制辅助线显示
    for (let i = 0; i < dragState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragState.lines.x[i]
      if (Math.abs(l - left) < 5) {
        markline.x = s
        moveX = dragState.startX - dragState.startLeft + l // 容器距离左边的距离 + 目标的宽度
        break
      }
    }

    const durX = moveX - dragState.startX
    const durY = moveY - dragState.startY

    focusData.value.focus.forEach((item: any, idx: number) => {
      item.top = dragState.startPos[idx].top + durY;
      item.left = dragState.startPos[idx].left + durX;
    });
  }

  const mouseup = () => {
    document.removeEventListener('mousemove', mousemove)
    document.removeEventListener('mouseup', mouseup)

    // 清空辅助线
    markline.x = null
    markline.y = null

    if (dragState.dragging) {
      events.emit('end')
    }
  }

  return {
    mousedown,
    markline
  }
}


