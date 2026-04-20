import { defineType, defineField } from 'sanity'

export const list = defineType({
    name: 'list',
    title: 'Sections List',
    description: 'This is a list of sections that can be used in a page.',
    type: 'object',
    fields: [
        defineField({
            name: 'pageBuilder',
            title: 'Page builder',
            type: 'array',
            of: [
                // nothing right now
            ],
            options: {
                insertMenu: {
                // Configure the "Add Item" menu to display a thumbnail preview of the content type. https://www.sanity.io/docs/studio/array-type#efb1fe03459d
                views: [
                    {
                    name: 'grid',
                    previewImageUrl: (schemaTypeName) =>
                        `/static/page-builder-thumbnails/${schemaTypeName}.webp`,
                    },
                ],
                },
            },
        })
    ]
})