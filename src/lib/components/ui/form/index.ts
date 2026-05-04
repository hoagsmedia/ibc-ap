import * as FormPrimitive from "formsnap";
import Description from "./form-description.svelte";
import Label from "./form-label.svelte";
import FieldErrors from "./form-field-errors.svelte";
import Field from "./form-field.svelte";
import Button from "./form-button.svelte";

const Control = FormPrimitive.Control;

export {
	Field,
	Control,
	Label,
	Button,
	FieldErrors,
	Description,
};
