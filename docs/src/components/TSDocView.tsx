import * as tsdoc from '@microsoft/tsdoc';

export function _renderDocComment(docComment: tsdoc.DocComment) {
	const outputElements = [];

	// Summary
	if (docComment.summarySection) {
		outputElements.push(
			<>
				<h2 class="doc-heading">Summary</h2>
				{_renderContainer(docComment.summarySection)}
			</>
		);
	}

	// Parameters
	if (docComment.params.count > 0) {
		const rows = [];

		for (const paramBlock of docComment.params.blocks) {
			rows.push(
				<tr>
					<td>{paramBlock.parameterName}</td>
					<td>{_renderContainer(paramBlock.content)}</td>
				</tr>
			);
		}

		outputElements.push(
			<>
				<h2 class="doc-heading">Parameters</h2>
				<table class="doc-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Description</th>
						</tr>
					</thead>
					<tbody>{rows}</tbody>
				</table>
			</>
		);
	}

	// Returns
	if (docComment.returnsBlock) {
		outputElements.push(
			<>
				<h2 class="doc-heading">Return Value</h2>
				{_renderContainer(docComment.returnsBlock.content)}
			</>
		);
	}

	if (docComment.remarksBlock) {
		outputElements.push(
			<>
				<h2 class="doc-heading">Remarks</h2>
				{_renderContainer(docComment.remarksBlock.content)}
			</>
		);
	}

	const exampleBlocks: tsdoc.DocBlock[] = docComment.customBlocks.filter(
		(x) => x.blockTag.tagNameWithUpperCase === tsdoc.StandardTags.example.tagNameWithUpperCase
	);

	let exampleNumber = 1;
	for (const exampleBlock of exampleBlocks) {
		const heading: string = exampleBlocks.length > 1 ? `Example ${exampleNumber}` : 'Example';

		outputElements.push(
			<>
				<h2 class="doc-heading">{heading}</h2>
				{_renderContainer(exampleBlock.content)}
			</>
		);

		++exampleNumber;
	}

	if (docComment.seeBlocks.length > 0) {
		const listItems = [];
		for (const seeBlock of docComment.seeBlocks) {
			listItems.push(<li>{_renderContainer(seeBlock.content)}</li>);
		}

		outputElements.push(
			<>
				<h2 class="doc-heading">See Also</h2>
				<ul>{listItems}</ul>
			</>
		);
	}

	const modifierTags: ReadonlyArray<tsdoc.DocBlockTag> = docComment.modifierTagSet.nodes;

	if (modifierTags.length > 0) {
		const modifierElements = [];

		for (const modifierTag of modifierTags) {
			modifierElements.push(
				<>
					{' '}
					<code class="doc-code-span">{modifierTag.tagName}</code>
				</>
			);
		}

		outputElements.push(
			<>
				<h2 class="doc-heading">Modifiers</h2>
				{modifierElements}
			</>
		);
	}

	return <div> {outputElements} </div>;
}

function _renderContainer(section: tsdoc.DocNodeContainer) {
	const elements = [];
	for (const node of section.nodes) {
		const key: string = `key_${elements.length}`;
		elements.push(_renderDocNode(node, key));
	}
	return <>{elements}</>;
}

function _renderDocNode(node: tsdoc.DocNode, key: string) {
	switch (node.kind) {
		case 'CodeSpan':
			return <code class="doc-code-span">{(node as tsdoc.DocCodeSpan).code}</code>;
		case 'ErrorText':
			return (node as tsdoc.DocErrorText).text;
		case 'EscapedText':
			return (node as tsdoc.DocEscapedText).decodedText;
		case 'FencedCode':
			return (
				<pre class="doc-fenced-code">
					<code>{(node as tsdoc.DocFencedCode).code}</code>
				</pre>
			);
		case 'LinkTag':
			const linkTag: tsdoc.DocLinkTag = node as tsdoc.DocLinkTag;
			if (linkTag.urlDestination) {
				const linkText: string = linkTag.linkText || linkTag.urlDestination;
				return <a href="#">{linkText}</a>;
			}
			let identifier: string = '';
			if (linkTag.codeDestination) {
				// TODO: The library should provide a default rendering for this
				const memberReferences: ReadonlyArray<tsdoc.DocMemberReference> =
					linkTag.codeDestination.memberReferences;
				if (memberReferences.length > 0) {
					const memberIdentifier: tsdoc.DocMemberIdentifier | undefined =
						memberReferences[memberReferences.length - 1].memberIdentifier;
					if (memberIdentifier) {
						identifier = memberIdentifier.identifier;
					}
				}
			}
			return <a href="#">{linkTag.linkText || identifier || '???'}</a>;
		case 'Paragraph':
			// Collapse spaces in the paragraph
			return (
				<p>
					{_renderContainer(
						tsdoc.DocNodeTransforms.trimSpacesInParagraph(node as tsdoc.DocParagraph)
					)}
				</p>
			);
		case 'PlainText':
			return <>{(node as tsdoc.DocPlainText).text}</>;
		case 'SoftBreak':
			return <> </>;
	}
	return undefined;
}
