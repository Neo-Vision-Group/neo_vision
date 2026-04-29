import {SearchIcon} from '@sanity/icons'
import {Box, Button, Card, Dialog, Flex, Grid, Stack, Text, TextInput} from '@sanity/ui'
import {type ArrayOfObjectsInputProps} from 'sanity'
import {type ComponentType, useMemo, useState} from 'react'

type BlockTemplate = {
  name: string
  title: string
  description?: string
  icon?: ComponentType
  previewImageUrl: string
}

const previewImageUrl = (schemaTypeName: string) =>
  `/static/page-builder-thumbnails/${schemaTypeName}.webp`

function createArrayKey() {
  return `pb_${Math.random().toString(36).slice(2, 12)}`
}

function matchesSearch(block: BlockTemplate, query: string) {
  if (!query) return true
  const normalizedQuery = query.trim().toLowerCase()
  const haystack = [block.title, block.name, block.description ?? ''].join(' ').toLowerCase()
  return haystack.includes(normalizedQuery)
}

function BlockTypeCard({block, onSelect}: {block: BlockTemplate; onSelect: () => void}) {
  const [imageFailed, setImageFailed] = useState(false)
  const Icon = block.icon

  return (
    <Card
      as="button"
      type="button"
      padding={3}
      radius={3}
      shadow={1}
      border
      onClick={onSelect}
      style={{width: '100%', cursor: 'pointer', textAlign: 'left'}}
    >
      <Stack space={3}>
        <Card
          radius={2}
          overflow="hidden"
          border
          tone="transparent"
          style={{aspectRatio: '16 / 9', background: 'var(--card-bg-color)'}}
        >
          {!imageFailed ? (
            <img
              src={block.previewImageUrl}
              alt={`${block.title} preview`}
              onError={() => setImageFailed(true)}
              style={{display: 'block', width: '100%', height: '100%', objectFit: 'fill'}}
            />
          ) : (
            <Flex align="center" justify="center" style={{height: '100%'}}>
              {Icon ? <Icon /> : <Text size={1}>No preview yet</Text>}
            </Flex>
          )}
        </Card>

        <Stack space={2}>
          <Text size={2} weight="semibold">
            {block.title}
          </Text>
          <Text muted size={1}>
            {block.description ?? 'No description yet.'}
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}

export function PageBuilderInput(props: ArrayOfObjectsInputProps) {
  const {renderDefault, schemaType, value, onInsert} = props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [query, setQuery] = useState('')

  const blockTypes = useMemo<BlockTemplate[]>(() => {
    return schemaType.of
      .map((memberType) => ({
        name: memberType.name,
        title: memberType.title ?? memberType.name,
        description:
          typeof memberType.description === 'string' ? memberType.description : undefined,
        icon: memberType.icon,
        previewImageUrl: previewImageUrl(memberType.name),
      }))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [schemaType.of])

  const filteredBlocks = useMemo(
    () => blockTypes.filter((block) => matchesSearch(block, query)),
    [blockTypes, query],
  )

  const handleInsert = (blockName: string) => {
    const items = [{_type: blockName, _key: createArrayKey()}]
    const lastItem = Array.isArray(value) && value.length > 0 ? value[value.length - 1] : undefined

    onInsert({
      items,
      position: 'after',
      referenceItem: lastItem?._key ? {_key: lastItem._key} : -1,
      open: true,
    })

    setDialogOpen(false)
    setQuery('')
  }

  return (
    <>
      <Stack space={4}>
        <Card padding={3} radius={3} border tone="transparent">
          <Flex align="center" justify="space-between" gap={3} wrap="wrap">
            <Stack space={2}>
              <Text size={2} weight="semibold">
                Add page block
              </Text>
              <Text muted size={1}>
                Browse blocks by screenshot, name, or description.
              </Text>
            </Stack>

            <Button mode="ghost" text="Open block picker" onClick={() => setDialogOpen(true)} />
          </Flex>
        </Card>

        {renderDefault(props)}
      </Stack>

      {dialogOpen ? (
        <Dialog
          id="page-builder-picker"
          header="Add page block"
          width={5}
          onClose={() => setDialogOpen(false)}
        >
          <Box padding={4}>
            <Stack space={4}>
              <TextInput
                icon={SearchIcon}
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search blocks by name or description"
              />

              {filteredBlocks.length > 0 ? (
                <Grid columns={[1, 1, 2]} gap={3}>
                  {filteredBlocks.map((block) => (
                    <BlockTypeCard
                      key={block.name}
                      block={block}
                      onSelect={() => handleInsert(block.name)}
                    />
                  ))}
                </Grid>
              ) : (
                <Card padding={4} radius={3} tone="transparent" border>
                  <Text muted size={1}>
                    No blocks match that search yet.
                  </Text>
                </Card>
              )}
            </Stack>
          </Box>
        </Dialog>
      ) : null}
    </>
  )
}
