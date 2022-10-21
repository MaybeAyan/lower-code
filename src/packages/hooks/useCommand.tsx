import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "../mitt/events";

export function useCommand(data: any, focusData: any) {

  // 前进后退的指针
  const state: any = {
    current: -1,
    queue: [], // 存放所有的操作命令
    commands: {}, // 命令与执行方法的映射
    commandArr: [],
    destroyList: []
  }


  const registry = (command: any) => {
    state.commandArr.push(command);
    state.commands[command.name] = (...args: any[]) => {
      const { redo, undo } = command.execute(...args)
      redo()

      if (!command.pushQueue) {
        return
      }
      let { queue } = state
      const { current } = state

      // 特殊情况 组件1 => 组件2 => 撤回 => 组件3 
      // 组件1 => 组件3 
      if (queue.length > 0) {
        queue = queue.slice(0, current + 1)
        state.queue = queue;
      }
      queue.push({ redo, undo })
      state.current = current + 1
    }
  }

  // 注册命令
  registry({
    name: 'redo',
    keyboard: 'ctrl+y',
    execute() {
      return {
        redo() {
          const item = state.queue[state.current + 1]

          // 还原操作
          if (item) {
            item.redo && item.redo()
            state.current++
          }
        }
      }
    }
  })

  registry({
    name: 'undo',
    keyboard: 'ctrl+z',
    execute() {
      return {
        redo() {
          if (state.current === -1) return;
          const item = state.queue[state.current]

          // 撤销操作 
          if (item) {
            item.undo && item.undo()
            state.current--
          }
        }
      }
    }
  })

  registry({
    // 如果希望将操作放到队列中，增加属性控制
    name: 'drag',
    pushQueue: true,
    init() {
      this.before = null
      // 监控拖拽开始之前的事件，保存状态
      const start = () => this.before = deepcopy(data.value.blocks)
      // 拖拽之后需要触发对应的指令
      const end = () => state.commands.drag()
      events.on('start', start)
      events.on('end', end)

      return () => {
        events.off('start', start)
        events.off('end', end)
      }
    },
    // 主要的队列逻辑
    execute() {
      const before = this.before
      const after = data.value.blocks

      return {
        redo() {
          data.value = { ...data.value, blocks: after }
        },
        undo() {
          data.value = { ...data.value, blocks: before }
        }
      }
    }
  })

  registry({
    name: 'updateContainer',
    pushQueue: true,
    execute(newValue: any) {
      const state = {
        before: data.value,
        after: newValue
      }
      return {
        redo: () => {
          data.value = state.after
        },
        undo: () => {
          data.value = state.before
        }
      }
    }
  })

  registry({
    name: 'placeTop',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks)
      const after = (() => {
        const { focus, unfocused } = focusData.value

        const maxZIndex = unfocused.reduce((prev: any, block: any) => {
          return Math.max(prev, block.zIndex)
        }, -Infinity)

        // 比当前选中的最大层级+1
        focus.forEach((block: any) => block.zIndex = maxZIndex + 1);
        return data.value.blocks
      })()

      return {
        undo: () => {
          data.value = { ...data.value, blocks: before }
        },
        redo: () => {
          data.value = { ...data.value, blocks: after }
        }
      }
    }
  })

  registry({
    name: 'placeBottom',
    pushQueue: true,
    execute() {
      const before = deepcopy(data.value.blocks)
      const after = (() => {
        const { focus, unfocused } = focusData.value

        let minZIndex = unfocused.reduce((prev: any, block: any) => {
          return Math.min(prev, block.zIndex)
        }, Infinity) - 1

        if (minZIndex < 0) {
          const dur = Math.abs(minZIndex)
          minZIndex = 0;
          unfocused.forEach((block: any) => block.zIndex += dur);
        }

        focus.forEach((block: any) => block.zIndex = minZIndex - 1);
        return data.value.blocks
      })()

      return {
        undo: () => {
          data.value = { ...data.value, blocks: before }
        },
        redo: () => {
          data.value = { ...data.value, blocks: after }
        }
      }
    }
  })

  registry({
    name: 'delete', //删除
    pushQueue: true,
    execute() {
      const state = {
        before: deepcopy(data.value.blocks),
        after: focusData.value.unfocused
      }
      return {
        redo: () => {
          data.value = { ...data.value, blocks: state.after }
        },
        undo: () => {
          data.value = { ...data.value, blocks: state.before }

        }
      }
    }
  })



  const keyboardEvent = (() => {
    const onKeydown = (e: KeyboardEvent) => {
      const keyCodes: any = {
        90: 'z',
        89: 'y'
      }

      const { ctrlKey, keyCode } = e

      let KeyString: any = [];
      if (ctrlKey) KeyString.push('ctrl')
      KeyString.push(keyCodes[keyCode])
      KeyString = KeyString.join('+')

      state.commandArr.forEach((item: any) => {
        if (!item.keyboard) return;

        if (item.keyboard == KeyString) {
          state.commands[item.name]();
          e.preventDefault();
        }
      });
    }

    const init = () => { //初始化事件
      window.addEventListener('keydown', onKeydown)
      return () => {  // 销毁事件
        window.removeEventListener('keydown', onKeydown)
      }
    }
    return init
  })();

  (() => {

    // 监听键盘事件

    state.commandArr.forEach(((command: any) => command.init && state.destroyList.push(command.init())))

    state.destroyList.push(keyboardEvent())
  })();

  onUnmounted(() => {
    // 清空绑定的发布事件
    state.destroyList.forEach((fn: () => void) => fn && fn())
  })


  return state

}