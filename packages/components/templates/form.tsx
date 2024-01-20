import { Input } from './input.jsx';
import { Button } from './button.jsx';

type FormField = {
	defaultValue: string;
	displayName?: string;
	errorMessage?: string;
	handle: string;
	name: string;
	instructions?: string;
	description?: string;
	placeholder: string;
	typeName: string;
	required?: boolean;
	availableDaysOfWeek?: string;
	minDate?: Date;
	maxDate?: Date;
};

type FormSpec = {
	rows: {
		rowFields: FormField[];
	}[];
	pages: any[];
};

export function Form(props: {
	form: FormSpec;
}) {
	const renderer = new FormRenderer();

	const state = {
		error: null,
		message: null,
		loading: false,
	};

	function submit(e) {
		e.preventDefault();
		const [fields, variables] = renderer.variables(props.form, new FormData(e.currentTarget));
		console.log('FORM -> SUBMIT', props.form, fields, variables);
	}

	return (
		<div class="form-container">
			{state.message ? (
				<FormSuccess />
			) : (
				<form class="flex flex-col gap-8" onSubmit={submit}>
					{renderer.renderRows(props.form.rows).map((row, rowIndex) => {
						return (
							<div key={`form_row_${rowIndex}`} class="flex gap-8">
								{row.map((field, fieldIndex) => {
									if (field)
										return (
											<div key={`form_row_${rowIndex}_field_${fieldIndex}`} class="flex-1">
												{field.type === 'heading' ? (
													<div>
														<h2>{field.label}</h2>
													</div>
												) : (
													<FormField field={field} />
												)}
											</div>
										);
								})}
							</div>
						);
					})}

					<div>
						<Button type="submit" disabled={!!state.loading}>
							<div>
								<span>{'Submit'}</span>
								{state.loading ? <span class="loading-indicator" /> : ''}
							</div>
						</Button>

						{state.error ? <FormError error={state.error} /> : null}
					</div>
				</form>
			)}
		</div>
	);
}

export function FormSuccess(props) {
	return (
		<div>
			<h2>Geschafft</h2>
		</div>
	);
}

export function FormError(props: { error: Error }) {
	return (
		<div>
			<p>{props.error}</p>
		</div>
	);
}

type FormFieldProps = {
	type: string;
	description?: string;
	label: string;
	error?: string;
	placeholder: string;
	name: string;
	required?: boolean;
	value: string | boolean;
};

export function FormField(props: {
	field: FormFieldProps;
}) {
	const state = {
		valid: true,
		error: null,
	};

	function validationErrorMessage() {
		if (props.field.required) {
			const input = this.getInput();
			if (input.value === '') {
				return 'Das Feld ist erforderlich.';
			}
		}

		return state.error || props.field.error || 'Das Feld ist ungültig.';
	}

	const InputField = (props) => {
		switch (props.type) {
			case 'text':
			case 'name':
				return <Input {...props} />;
			case 'email':
				return <Input type="email" {...props} />;
			case 'textarea':
				return <Input multiline {...props} />;
			case 'checkbox':
				return <Input type="checkbox" {...props} />;
			case 'date':
				return <Input type="date" {...props} />;
			default:
				return <Input {...props} />;
		}
	};

	return (
		<a-form-field>
			<div class={`form-field-${props.field.type}`}>
				<InputField
					{...props.field}
					label={
						!props.field.description
							? `${props.field.label} ${props.field.required ? '' : '(optional)'}`
							: null
					}
					error={'error'}
					id={props.field.name}
					class={`form-field-input-${props.field.type}`}
				/>

				{props.field.description ? (
					<div class="form-field-description">
						<label for={props.field.name}>{props.field.description}</label>
					</div>
				) : null}
			</div>

			<div class="form-field-error">
				{!state.valid ? <span>{validationErrorMessage()}</span> : null}
			</div>
		</a-form-field>
	);
}

declare global {
	interface HTMLElementTagNameMap {
		'a-form-field': FormFieldElement;
	}
}

const HTMLElement = globalThis.HTMLElement || class {};

class FormFieldElement extends HTMLElement {
	valid = true;
	error = null;

	getInput() {
		return this.querySelector('input, textarea') as
			| HTMLInputElement
			| HTMLTextAreaElement
			| undefined;
	}

	getForm() {
		return this.getInput()?.form;
	}

	connectedCallback() {
		this.getForm()?.addEventListener('error', this.handleError as EventListener, true);

		this.addEventListener('invalid', this.invalid, { capture: true });
		this.addEventListener('change', this.invalid, { capture: true });
		this.addEventListener('input', this.invalid, { capture: true });
	}

	disconnectedCallback() {
		this.getForm()?.removeEventListener('error', this.handleError as EventListener, true);

		this.removeEventListener('invalid', this.invalid, { capture: true });
		this.removeEventListener('change', this.invalid, { capture: true });
		this.removeEventListener('input', this.invalid, { capture: true });
	}

	invalid = (e: Event) => {
		if (!e.defaultPrevented) {
			this.valid = false;
			(e?.target as HTMLInputElement)?.focus();
		}
		e.preventDefault();
	};

	input = (e: Event) => {
		this.valid = true;
		this.error = null;
		(e?.target as HTMLInputElement)?.reportValidity();
	};

	handleError = (e: CustomEvent) => {
		const input = this.getInput();

		if (input && e.detail.name === input.name) {
			this.error = e.detail.message[0];
			this.valid = false;

			input.focus();
		}
	};
}

if (customElements.get('a-form-field') === undefined) {
	customElements.define('a-form-field', FormFieldElement);
}

export class FormRenderer {
	defaultFieldTypeMap = {
		Field_Heading: 'heading',
		Field_Name: 'name',
		Field_Email: 'email',
		Field_SingleLineText: 'text',
		Field_MultiLineText: 'textarea',
		Field_Agree: 'checkbox',
		Field_Date: 'date',
	};

	/**
	 * Maps field type to internal field type
	 */
	getFieldType(field: FormField) {
		return this.defaultFieldTypeMap[field.typeName];
	}

	/**
	 * Converts field default value to value
	 */
	getFieldValue(field: FormField) {
		const type = this.getFieldType(field);

		if (type === 'checkbox') {
			return field.defaultValue === '1' || false;
		}

		return field.defaultValue;
	}

	/**
	 * Converts field data into useable props for a form field component
	 */
	renderField(field: FormField) {
		const type = this.getFieldType(field);
		if (!type) return undefined;

		const alleWochenTage = [
			'Sonntag',
			'Montag',
			'Dienstag',
			'Mittwoch',
			'Donnerstag',
			'Freitag',
			'Samstag',
		];
		let disabledWeekDays: number[] = [];

		if (field.availableDaysOfWeek) {
			try {
				const arr = JSON.parse(field.availableDaysOfWeek);
				disabledWeekDays = alleWochenTage
					.filter((item) => !arr.includes(item))
					.map((str) => alleWochenTage.indexOf(str));
			} catch (error) {
				console.error(error);
			}
		}

		return {
			type,
			description: field.description,
			label: field.name,
			error: field.errorMessage,

			placeholder: field.placeholder,
			name: field.handle,
			required: field.required,
			value: this.getFieldValue(field),

			disabledDates: {
				days: disabledWeekDays,
				customPredictor(date) {
					if (field.minDate && date.valueOf() < new Date(field.minDate)) {
						return true;
					}
					if (field.maxDate && date.valueOf() > new Date(field.maxDate)) {
						return true;
					}
					return false;
				},
			},
		};
	}

	renderRow(row: FormSpec['rows'][number]) {
		return row.rowFields.map((field) => this.renderField(field)).filter(Boolean);
	}

	renderRows(rows: FormSpec['rows']) {
		return rows.map((row) => this.renderRow(row));
	}

	/**
	 * Turns a form into fields and turns fields into variables
	 */
	variables(formSpec: FormSpec, formData: FormData): [object, object] {
		// TODO: refactor this method
		const fields = {};

		for (const entry of formData.entries()) {
			const [key, value] = entry;
			const field = formSpec.rows
				.find((row) => row.rowFields.find((field) => field.handle === key))
				?.rowFields.find((field) => field.handle === key);
			fields[key] = {
				...field,
				value,
			};
		}

		const variables = {};

		for (const key in fields) {
			switch (fields[key].typeName) {
				case 'Field_Date':
					variables[key] = new Date(fields[key].value);
					break;
				default:
					variables[key] = fields[key].value;
			}
		}

		return [fields, variables];
	}
}
