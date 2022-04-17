import { useProxiedModel } from '@/composables/proxiedModel'
import { getCurrentInstance, getUid, propsFactory } from '@/util'
import { computed, inject, onBeforeUnmount, provide, ref, toRef } from 'vue'
import { multipleOpenStrategy, singleOpenStrategy } from './openStrategies'
import {
  classicLeafSelectStrategy,
  classicSelectStrategy,
  independentSelectStrategy,
  independentSingleSelectStrategy,
  leafSelectStrategy,
  leafSingleSelectStrategy,
} from './selectStrategies'

// Types
import type { InjectionKey, Prop, Ref } from 'vue'
import type { SelectStrategyFn } from './selectStrategies'
import type { OpenStrategyFn } from './openStrategies'

export type SelectStrategyValue =
  | 'single-leaf'
  | 'leaf'
  | 'independent'
  | 'single-independent'
  | 'classic'
  | 'classic-leaf'
  | SelectStrategyFn
export type OpenStrategyValue = 'single' | 'multiple' | OpenStrategyFn

export interface NestedProps {
  selectStrategy: SelectStrategyValue | undefined
  openStrategy: OpenStrategyValue | undefined
  selected: string[] | undefined
  opened: string[] | undefined
  mandatory: boolean
  selectedClass: string | undefined
  'onUpdate:selected': ((val: string[]) => void) | undefined
  'onUpdate:opened': ((val: string[]) => void) | undefined
}

type NestedProvide = {
  id: Ref<string | undefined>
  isGroupActivator?: boolean
  root: {
    emit: (event: string, value: any) => void
    children: Ref<Map<string, string[]>>
    parents: Ref<Map<string, string>>
    opened: Ref<Set<string>>
    selected: Ref<Map<string, 'on' | 'off' | 'indeterminate'>>
    selectedValues: Ref<string[]>
    register: (id: string, parentId: string | undefined, isGroup?: boolean) => void
    unregister: (id: string) => void
    open: (id: string, value: boolean, event?: Event) => void
    select: (id: string, value: boolean, event?: Event) => void
    selectedClass: Ref<string | undefined>
    getPath: (id: string) => string[]
    getChildren: (id: string) => string[]
  }
}

export const VNestedSymbol: InjectionKey<NestedProvide> = Symbol.for('vuetify:nested')

export const emptyNested: NestedProvide = {
  id: ref(),
  root: {
    emit: () => null,
    register: () => null,
    unregister: () => null,
    parents: ref(new Map()),
    children: ref(new Map()),
    open: () => null,
    select: () => null,
    opened: ref(new Set()),
    selected: ref(new Map()),
    selectedValues: ref([]),
    selectedClass: ref(),
    getPath: () => [],
    getChildren: () => [],
  },
}

export const makeNestedProps = propsFactory({
  selectStrategy: [String, Function] as Prop<SelectStrategyValue>,
  openStrategy: [String, Function] as Prop<OpenStrategyValue>,
  opened: Array as Prop<string[]>,
  selected: Array as Prop<string[]>,
  selectedClass: String,
  mandatory: Boolean,
}, 'nested')

export const useNested = (props: NestedProps) => {
  let isUnmounted = false
  const children = ref(new Map<string, string[]>())
  const parents = ref(new Map<string, string>())

  const opened = useProxiedModel(props, 'opened', v => new Set(v), v => [...v.values()])

  const selectStrategy = computed(() => {
    if (props.selectStrategy && typeof props.selectStrategy !== 'string') return props.selectStrategy(props.mandatory)

    switch (props.selectStrategy) {
      case 'single-leaf': return leafSingleSelectStrategy(props.mandatory)
      case 'leaf': return leafSelectStrategy(props.mandatory)
      case 'independent': return independentSelectStrategy(props.mandatory)
      case 'single-independent': return independentSingleSelectStrategy(props.mandatory)
      case 'classic-leaf': return classicLeafSelectStrategy(props.mandatory)
      case 'classic':
      default: return classicSelectStrategy(props.mandatory)
    }
  })

  const openStrategy = computed(() => {
    if (props.openStrategy && typeof props.openStrategy !== 'string') return props.openStrategy

    switch (props.openStrategy) {
      case 'single': return singleOpenStrategy
      case 'multiple':
      default: return multipleOpenStrategy
    }
  })

  const selected = useProxiedModel(
    props,
    'selected',
    v => selectStrategy.value.in(v, children.value, parents.value),
    v => selectStrategy.value.out(v, children.value, parents.value),
  )

  onBeforeUnmount(() => {
    isUnmounted = true
  })

  function getPath (id: string) {
    const path: string[] = []
    let parent: string | undefined = id

    while (parent != null) {
      path.unshift(parent)
      parent = parents.value.get(parent)
    }

    return path
  }

  function getChildren (id: string) {
    const arr: string[] = []
    const queue = (children.value.get(id) ?? []).slice()

    while (queue.length) {
      const child = queue.shift()

      if (!child) continue

      arr.push(child)

      queue.push(...(children.value.get(child) ?? []))
    }

    return arr
  }

  const vm = getCurrentInstance('nested')

  const nested: NestedProvide = {
    id: ref(),
    root: {
      emit: vm.emit,
      opened,
      selected,
      selectedValues: computed(() => {
        const arr = []

        for (const [key, value] of selected.value.entries()) {
          if (value === 'on') arr.push(key)
        }

        return arr
      }),
      register: (id, parentId, isGroup) => {
        parentId && id !== parentId && parents.value.set(id, parentId)

        isGroup && !children.value.has(id) && children.value.set(id, [])

        if (parentId != null) {
          children.value.set(parentId, [...(children.value.get(parentId) ?? []), id])
        }
      },
      unregister: id => {
        if (isUnmounted) return

        children.value.delete(id)
        const parent = parents.value.get(id)
        if (parent) {
          const list = children.value.get(parent) ?? []
          children.value.set(parent, list.filter(child => child !== id))
        }
        parents.value.delete(id)
        opened.value.delete(id)
      },
      open: (id, value, event) => {
        vm.emit('click:open', { id, value, path: getPath(id), event })

        const newOpened = openStrategy.value({
          id,
          value,
          opened: new Set(opened.value),
          children: children.value,
          parents: parents.value,
          event,
        })

        newOpened && (opened.value = newOpened)
      },
      select: (id, value, event) => {
        vm.emit('click:select', { id, value, path: getPath(id), event })

        const newSelected = selectStrategy.value.select({
          id,
          value,
          selected: new Map(selected.value),
          children: children.value,
          parents: parents.value,
          event,
        })
        newSelected && (selected.value = newSelected)
      },
      children,
      parents,
      selectedClass: toRef(props, 'selectedClass'),
      getPath,
      getChildren,
    },
  }

  provide(VNestedSymbol, nested)

  return nested.root
}

export const useNestedItem = (id: Ref<string | undefined>, isGroup: boolean) => {
  const parent = inject(VNestedSymbol, emptyNested)

  const computedId = computed(() => id.value ?? getUid().toString())

  const root = parent.root

  const isSelected = computed(() => root.selected.value.get(computedId.value) === 'on')

  const item = {
    ...parent,
    id: computedId,
    open: (open: boolean, e?: Event) => root.open(computedId.value, open, e),
    isOpen: computed(() => root.opened.value.has(computedId.value)),
    parent: computed(() => root.parents.value.get(computedId.value)),
    select: (selected: boolean, e?: Event) => root.select(computedId.value, selected, e),
    isSelected,
    isIndeterminate: computed(() => root.selected.value.get(computedId.value) === 'indeterminate'),
    isLeaf: computed(() => !root.children.value.get(computedId.value)),
    selectedClass: computed(() => isSelected.value && [root.selectedClass.value]),
    isGroupActivator: parent.isGroupActivator,
  }

  !parent.isGroupActivator && root.register(computedId.value, parent.id.value, isGroup)

  onBeforeUnmount(() => {
    !parent.isGroupActivator && root.unregister(computedId.value)
  })

  isGroup && provide(VNestedSymbol, item)

  return item
}

export const useNestedGroupActivator = () => {
  const parent = inject(VNestedSymbol, emptyNested)

  provide(VNestedSymbol, { ...parent, isGroupActivator: true })
}
