export interface FormField {
  question: string;
  input_type:
    | "text"
    | "number"
    | "checkbox"
    | "radio"
    | "checklist"
    | "text_area"
    | "select"
    | "date"
    | "month"
    | "year"
    | "month_year";
  options?: (
    | string
    | {
        value: string;
        label?: string;
        questions?: FormField[];
      }
  )[];
  minYear?: number;
  maxYear?: number;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface TemplateResponse {
  success: boolean;
  data: {
    formFields: FormField[];
  };
  message: string;
}
