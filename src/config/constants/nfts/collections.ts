import { Collections, CollectionKey } from './types'

const collections: Collections = {
  [CollectionKey.PANCAKE]: {
    name: 'Pancake Bunnies',
    address: {
      56: '0xDf7952B35f24aCF7fC0487D01c8d5690a60DBa07',
      97: '0x60935F36e4631F73f0f407e68642144e07aC7f5E',
    },
  },
  [CollectionKey.SQUAD]: {
    name: 'Pancake Squad',
    address: {
      56: '',
      97: '0x7F9F37Ddcaa33893F9bEB3D8748c8D6BfbDE6AB2',
    },
  },
}

export default collections
