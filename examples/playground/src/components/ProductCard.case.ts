import { defineComponentCase } from '@mountlab/vue'
import ProductCard from './ProductCard.vue'

export default defineComponentCase({
  id: 'product-card',
  title: 'Product Card',
  group: 'Commerce',
  component: ProductCard,
  variants: [
    {
      id: 'default',
      title: 'Default',
      props: {
        name: 'Trail Pack',
        category: 'Equipment',
        price: 129,
        stock: 24,
      },
    },
    {
      id: 'selected',
      title: 'Selected + Featured',
      props: {
        name: 'Alpine Jacket',
        category: 'Outerwear',
        price: 249,
        stock: 8,
        selected: true,
        featured: true,
      },
    },
  ],
  events: ['select', 'restock'],
  notes: 'Use this case to test props editing, variant switching, and event capture.',
})
