// Utilities
import { propsFactory } from '@/util'

// Types
export interface FilterProps {
  filter?: string
  filterFunction: typeof filterFunction
}

// Functions
function filterFunction (value: any, filter?: string) {
  return (
    value != null &&
    filter != null &&
    typeof value !== 'boolean' &&
    value.toString().toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1
  )
}

// Composables
export const makeFilterProps = propsFactory({
  filter: String,
  filterFunction: {
    type: Function,
    default: filterFunction,
  },
}, 'filter')

export function useFilter (props: FilterProps, value: any) {
  return props.filterFunction(value, props.filter)
}
