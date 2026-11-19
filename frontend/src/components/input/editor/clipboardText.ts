import type {Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

const LIST_TYPES = new Set(['bulletList', 'orderedList', 'taskList'])

// Plain-text copy that keeps list markers, so a copied list reads as the markdown it came from.
export function serializeSliceAsText(slice: Slice): string {
	const blocks: string[] = []
	slice.content.forEach(node => {
		const lines = blockLines(node, '')
		if (lines.length > 0) {
			blocks.push(lines.join('\n'))
		}
	})
	return blocks.join('\n\n')
}

function blockLines(node: ProseMirrorNode, indent: string): string[] {
	if (LIST_TYPES.has(node.type.name)) {
		return listLines(node, indent)
	}

	if (node.isTextblock) {
		return [indent + node.textContent]
	}

	const lines: string[] = []
	node.forEach(child => lines.push(...blockLines(child, indent)))
	return lines
}

function listLines(list: ProseMirrorNode, indent: string): string[] {
	const lines: string[] = []
	list.forEach((item, _offset, index) => {
		const marker = list.type.name === 'orderedList' ? `${index + 1}. ` : '- '
		const childIndent = indent + ' '.repeat(marker.length)

		const body: string[] = []
		item.forEach(child => body.push(...blockLines(child, childIndent)))

		if (body.length === 0) {
			lines.push(indent + marker.trimEnd())
			return
		}
		lines.push(indent + marker + body[0].slice(childIndent.length), ...body.slice(1))
	})
	return lines
}
