class HtmlToCustomTagReplacement {
	options = {
		debug: false,
	};

	constructor(options: {
		debug?: boolean;
	}) {
		this.options = Object.assign(
			{
				debug: true,
			},
			options
		);

		return this;
	}

	replaceTags(string = '', fromTagIn = '', toTag = '', attributes = {}, additionalAttributes = {}) {
		const fromTag = fromTagIn.split('.'); // support classes

		// fix self closing elements with missing closing tag (slash)
		let result = string.replace(
			/(<([h|b]r|img|link).*?)\s*[\/]?>/gim, // eslint-disable-line
			'$1 />'
		);

		// find all tags to replace attributes only for single tag (prevents unwanted replacements)
		result = result.replace(
			// new RegExp(fromTag[1] ? `(<${fromTag[0]}\\sclass=["\'](?:.+\\s)?${fromTag.slice(1).join(' ')}(?:\\s.+)?[\'"][^>]*>.*?<\\/${fromTag[0]}>)` : `<${fromTag[0]}(\\/)?.*?>(?:.*<\\/${fromTag[0]}>)?`, 'gmsi'), // eslint-disable-line
			new RegExp(
				fromTag[1]
					? `(<${fromTag[0]}\\s.*class=["\'](?:.+\\s)?${fromTag
							.slice(1)
							.join(' ')}(?:\\s.+)?[\'"][^>]*>.*?<\\/${fromTag[0]}>)`
					: `<${fromTag[0]}(\\/)?.*?>(?:.*<\\/${fromTag[0]}>)?`,
				'gmi'
			), // eslint-disable-line
			(match) => {
				// replace tag
				let resultTag = match.replace(
					new RegExp(`<(\/)?${fromTag[0]}(>)?`, 'gi'), // eslint-disable-line
					(_match, slash, bracket) => {
						return `<${slash || ''}${toTag}${bracket || ''}`; // <TAG... or <TAG> or </TAG>
					}
				);

				// add additional attributes
				resultTag = resultTag.replace(
					/(<?(?:<.*?).*?)\s*([\/]?>(?:.*>)?)/gi, // eslint-disable-line
					(_match, openingTag, closingTag) => {
						const additionalAttributesString = Object.keys(additionalAttributes).map(
							(additionalAttribute) => {
								return `${additionalAttribute}="${additionalAttributes[additionalAttribute]}"`;
							}
						);

						return `${openingTag} ${additionalAttributesString.join(' ')} ${closingTag}`;
					}
				);

				// replace attributes
				for (const attribute in attributes) {
					resultTag = resultTag.replace(
						new RegExp(`(${attribute}=)`, 'gi'), // eslint-disable-line
						`${attributes[attribute]}=`
					);
				}

				return resultTag;
			}
		);

		// log incoming and result string
		if (this.options.debug) console.warn(string, result);

		return result;
	}
}

export default HtmlToCustomTagReplacement;
