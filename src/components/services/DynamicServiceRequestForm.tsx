"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Dropdown from "@/components/Dropdown";

export interface FormField {
    question: string;
    input_type:
    | "text"
    | "number"
    | "checkbox"
    | "radio"
    | "checklist"
    | "text_area"
    | "select";
    options?: (
        | string
        | {
            value: string;
            label?: string;
            questions?: FormField[];
        }
    )[];
    required?: boolean;
    placeholder?: string;
    maxLength?: number;
}

interface Props {
    fields: FormField[];
    values: Record<string, any>;
    onChange: (key: string, value: any) => void;
}

export default function DynamicServiceRequestForm({
    fields,
    values,
    onChange,
}: Props) {
    /* -------------------- Render helpers -------------------- */

    const renderFields = (fields: FormField[]) => {
        return fields.map((field, index) => {
            const key = field.question;

            return (
                <div key={index} className="space-y-2">
                    <label className="font-medium">
                        {field.question}
                        {field.required && (
                            <span className="text-red-500"> *</span>
                        )}
                    </label>

                    {renderField(field)}
                </div>
            );
        });
    };


    const renderConditionalQuestions = (field: FormField) => {
        const value = values[field.question];
        if (!field.options) return null;

        return field.options.map((option) => {
            if (typeof option === "object" && option.questions) {
                // RADIO → only selected option
                if (
                    field.input_type === "radio" &&
                    value === option.value
                ) {
                    return (
                        <div
                            key={option.value}
                            className="mt-4 ml-4 pl-4 border-l border-gray-200 space-y-6"
                        >
                            {renderFields(option.questions)}
                        </div>
                    );
                }

                // CHECKLIST → additive
                if (
                    field.input_type === "checklist" &&
                    Array.isArray(value) &&
                    value.includes(option.value)
                ) {
                    return (
                        <div
                            key={option.value}
                            className="mt-4 ml-4 pl-4 border-l border-gray-200 space-y-6"
                        >
                            {renderFields(option.questions)}
                        </div>
                    );
                }
            }

            return null;
        });
    };

    const renderField = (field: FormField) => {
        const key = field.question;
        const value = values[key];

        switch (field.input_type) {
            case "text":
            case "number":
                return (
                    <Input
                        type={field.input_type}
                        value={value || ""}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        className="h-9"
                        onChange={(e) =>
                            onChange(key, e.target.value)
                        }
                    />
                );

            case "text_area":
                return (
                    <Textarea
                        value={value || ""}
                        placeholder={field.placeholder}
                        rows={4}
                        className="resize-none"
                        onChange={(e) =>
                            onChange(key, e.target.value)
                        }
                    />
                );

            case "radio":
                return (
                    <div className="space-y-3">
                        {field.options?.map((opt) => {
                            const optionValue =
                                typeof opt === "string" ? opt : opt.value;

                            const isSelected = value === optionValue;

                            return (
                                <div key={optionValue} className="space-y-3">
                                    {/* Radio option */}
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={key}
                                            checked={isSelected}
                                            onChange={() =>
                                                onChange(key, optionValue)
                                            }
                                        />
                                        <span>
                                            {typeof opt === "string"
                                                ? opt
                                                : opt.label || opt.value}
                                        </span>
                                    </label>

                                    {/* ✅ Conditional questions DIRECTLY under option */}
                                    {isSelected &&
                                        typeof opt === "object" &&
                                        opt.questions && (
                                            <div className="ml-6 pl-4 border-l space-y-4">
                                                {renderFields(opt.questions)}
                                            </div>
                                        )}
                                </div>
                            );
                        })}
                    </div>
                );


            case "checkbox":
                return (
                    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            className="accent-primary"
                            checked={!!value}
                            onChange={(e) =>
                                onChange(key, e.target.checked)
                            }
                        />
                        <span>{field.placeholder || "Yes"}</span>
                    </label>
                );

            case "checklist":
                return (
                    <div className="space-y-3 pt-1">
                        {field.options?.map((opt) => {
                            const optionValue =
                                typeof opt === "string" ? opt : opt.value;

                            const current = Array.isArray(value)
                                ? value
                                : [];

                            return (
                                <label
                                    key={optionValue}
                                    className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        className="accent-primary"
                                        checked={current.includes(optionValue)}
                                        onChange={() =>
                                            onChange(
                                                key,
                                                current.includes(optionValue)
                                                    ? current.filter(
                                                        (v: any) => v !== optionValue
                                                    )
                                                    : [...current, optionValue]
                                            )
                                        }
                                    />
                                    {typeof opt === "string"
                                        ? opt
                                        : opt.label || opt.value}
                                </label>
                            );
                        })}
                    </div>
                );

            case "select":
                return (
                    <Dropdown
                        className="w-full"
                        trigger={
                            <button
                                type="button"
                                className="w-full h-9 px-3 border rounded-md text-left text-sm flex justify-between items-center"
                            >
                                <span className={value ? "" : "text-muted-foreground"}>
                                    {value
                                        ? field.options?.find((opt) =>
                                            typeof opt === "string"
                                                ? opt === value
                                                : opt.value === value
                                        ) instanceof Object
                                            ? (field.options?.find(
                                                (opt) =>
                                                    typeof opt !== "string" &&
                                                    opt.value === value
                                            ) as any)?.label || value
                                            : value
                                        : field.placeholder || "Select an option"}
                                </span>
                                <span className="opacity-50">▾</span>
                            </button>
                        }
                        items={
                            field.options?.map((opt) => {
                                const optionValue =
                                    typeof opt === "string" ? opt : opt.value;

                                return {
                                    id: optionValue,
                                    label:
                                        typeof opt === "string"
                                            ? opt
                                            : opt.label || opt.value,
                                    onClick: () => onChange(key, optionValue),
                                };
                            }) || []
                        }
                    />
                );


            default:
                return null;
        }
    };

    /* -------------------- UI -------------------- */

    return (
        <div className="space-y-8">
            {renderFields(fields)}
        </div>
    );
}
