interface Category {
    name: string
    isOpen: boolean
    subCategories: { id: string; label: string; value: string | number }[]
}
export const categories = ref<Category[]>([
    {
        name: 'Artist type',
        isOpen: true,
        subCategories: [
            { id: '-1', label: 'All', value: null },
            { id: '1', label: 'Male', value: 0 },
            { id: '2', label: 'Female', value: 1 },
            { id: '3', label: 'Group/Band', value: 2 },
        ],
    },
    {
        name: 'Region',
        isOpen: true,
        subCategories: [
            { id: '-1', label: 'All', value: null },
            { id: '1', label: 'China', value: "中国" },
            { id: '2', label: 'United States', value: "美国" },
            { id: '3', label: 'South Korea', value: "韩国" },
            { id: '4', label: 'Japan', value: "日本" },
            { id: '5', label: 'Other', value: null },
        ],
    },
])
