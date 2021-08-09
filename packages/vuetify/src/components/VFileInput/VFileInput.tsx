// Styles
import './VFileInput.sass'

// Components
import { VBtn, VChip, VInput } from '@/components'

// Composables
import { useProxiedModel } from '@/composables/proxiedModel'
import { useLocale } from '@/composables/locale'

// Utilities
import { computed, watch } from 'vue'
import { defineComponent, humanReadableFileSize } from '@/util'

// Types
import type { PropType } from 'vue'

export default defineComponent({
  name: 'VFileInput',

  props: {
    chips: Boolean,
    clearable: {
      type: Boolean,
      default: true,
    },
    counterSizeString: {
      type: String,
      default: '$vuetify.fileInput.counterSize',
    },
    counterString: {
      type: String,
      default: '$vuetify.fileInput.counter',
    },
    counter: Boolean,
    multiple: Boolean,
    // placeholder: String,
    showSize: {
      type: [Boolean, Number] as PropType<boolean | 1000 | 1024>,
      default: false,
      validator: (v: boolean | number) => {
        return (
          typeof v === 'boolean' ||
          [1000, 1024].includes(v)
        )
      },
    },
    modelValue: {
      type: Array as PropType<File[] | undefined>,
      // TODO: This breaks types??
      // validator: val => {
      //   return wrapInArray(val).every(v => v != null && typeof v === 'object')
      // },
    },
  },

  emits: {
    'update:modelValue': (files: File[]) => true,
  },

  setup (props, { attrs, slots }) {
    // const { t } = useLocale()
    const fileValue = useProxiedModel(props, 'modelValue')

    const base = computed(() => typeof props.showSize !== 'boolean' ? props.showSize : undefined)
    const totalBytes = computed(() => (fileValue.value ?? []).reduce((bytes, { size = 0 }) => bytes + size, 0))
    const totalBytesReadable = computed(() => humanReadableFileSize(totalBytes.value, !!base.value))
    const fileNames = computed(() => (fileValue.value ?? []).map(file => {
      const { name = '', size = 0 } = file

      return !props.showSize
        ? name
        : `${name} (${humanReadableFileSize(size, !!base.value)})`
    }))

    return () => {
      return (
        <VInput
          class={[
            'v-file-input',
            attrs.class,
          ]}
          model-value={ fileValue.value }
          v-slots={{
            default: ({
              ref,
              props,
            }) => {
              const { onInput, onChange, value, ...rest } = props
              return (
                <>
                  <input
                    type="file"
                    { ...rest }
                    ref={ ref }
                    onChange={ e => {
                      fileValue.value = [...(ref?.value?.files ?? [])]
                    } }
                  />

                  <input
                    type="text"
                    onClick={ () => ref?.value?.click() }
                    readonly
                    value={ fileNames.value.join(', ') }
                  />
                </>
              )
            },
          }}
        />
      )
    }
  },
})
