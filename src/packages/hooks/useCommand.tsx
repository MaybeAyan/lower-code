import deepcopy from "deepcopy";
import { onUnmounted } from "vue";
import { events } from "../mitt/events";

export function useCommand(data: any) {

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
    state.commands[command.name] = () => {
      const { redo, undo } = command.execute()
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
  });

  (() => {
    state.commandArr.forEach(((command: any) => command.init && state.destroyList.push(command.init())))
  })();

  onUnmounted(() => {
    // 清空绑定的发布事件
    state.destroyList.forEach((fn: () => void) => fn && fn())
  })


  return state

}