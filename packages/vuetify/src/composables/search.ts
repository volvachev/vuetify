// Composables
import { useFilter } from './filter'

// Utilities
import { getObjectValueByPath, propsFactory } from '@/util'

export type SearchFunction<T extends any = any> = (items: T[], search: string) => T[]

function defaultSearch<T extends any = any> (items: T[], search: string): T[] {
  if (!search) return items

  return items.filter((item: any) => {
    return (typeof item === 'string')
      ? useFilter(item, search)
      : Object.keys(item).some(key => {
        return useFilter(getObjectValueByPath(item, key), search)
      })
  })
}

// Composables
export const makeFilterProps = propsFactory({
  search: String,
  searchFilter: {
    type: Function,
    default: useFilter,
  },
  searchItems: {
    type: Function,
    default: defaultSearch,
  },
  searchText: {
    type: String,
    default: 'text',
  },
  searchValue: {
    type: String,
    default: 'value',
  },
}, 'filter')
