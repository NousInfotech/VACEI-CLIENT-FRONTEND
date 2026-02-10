"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Dropdown from "@/components/Dropdown";
import { Calendar } from "lucide-react";

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
    const renderFields = (fields: FormField[]) =>
        fields.map((field, index) => {
            const key = field.question;

            return (
                <div
                    key={index}
                    className="space-y-2 p-4 border rounded-lg bg-white"
                >
                    <label className="block text-sm font-medium text-gray-800">
                        {field.question}
                        {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                        )}
                    </label>

                    {renderField(field)}
                </div>
            );
        });

    const PickerWrapper = ({
        children,
    }: {
        children: React.ReactNode;
    }) => (
        <div className="flex items-center gap-3 h-10 px-3 border rounded-md bg-gray-50 focus-within:bg-white">
            <Calendar size={16} className="text-gray-500" />
            {children}
        </div>
    );

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
                        className="h-10 bg-gray-50 focus:bg-white"
                        onChange={(e) => onChange(key, e.target.value)}
                    />
                );

            case "text_area":
                return (
                    <Textarea
                        value={value || ""}
                        placeholder={field.placeholder}
                        rows={4}
                        className="resize-none bg-gray-50 focus:bg-white"
                        onChange={(e) => onChange(key, e.target.value)}
                    />
                );

            /* -------- DATE -------- */
            case "date":
                return (
                    <PickerWrapper>
                        <input
                            type="date"
                            className="w-full bg-transparent text-sm outline-none"
                            value={value || ""}
                            onChange={(e) =>
                                onChange(key, e.target.value)
                            }
                        />
                    </PickerWrapper>
                );

            /* -------- MONTH -------- */
            case "month":
                return (
                    <PickerWrapper>
                        <input
                            type="month"
                            className="w-full bg-transparent text-sm outline-none"
                            value={value || ""}
                            onChange={(e) =>
                                onChange(key, e.target.value)
                            }
                        />
                    </PickerWrapper>
                );

            /* -------- YEAR -------- */
            case "year": {
                const minYear = field.minYear;
                const maxYear = field.maxYear;

                const years =
                    typeof minYear === "number" &&
                        typeof maxYear === "number" &&
                        maxYear >= minYear
                        ? Array.from(
                            { length: maxYear - minYear + 1 },
                            (_, i) => String(minYear + i)
                        )
                        : [];

                return (
                    <PickerWrapper>
                        <Dropdown
                            className="w-full"
                            trigger={
                                <button
                                    type="button"
                                    className="w-full text-left text-sm bg-transparent outline-none flex justify-between items-center"
                                >
                                    <span className={value ? "" : "text-muted-foreground"}>
                                        {value ||
                                            field.placeholder ||
                                            "Select year"}
                                    </span>
                                    <span className="opacity-50">▾</span>
                                </button>
                            }
                            items={years.map((year) => ({
                                id: year,
                                label: year,
                                onClick: () => onChange(key, year),
                            }))}
                        />
                    </PickerWrapper>
                );
            }




            /* -------- MONTH YEAR -------- */
            case "month_year":
                return (
                    <PickerWrapper>
                        <input
                            type="month"
                            className="w-full bg-transparent text-sm outline-none"
                            value={value || ""}
                            onChange={(e) =>
                                onChange(key, e.target.value)
                            }
                        />
                    </PickerWrapper>
                );

            case "radio":
                return (
                    <div className="space-y-4">
                        {field.options?.map((opt) => {
                            const optionValue =
                                typeof opt === "string" ? opt : opt.value;
                            const isSelected = value === optionValue;

                            return (
                                <div key={optionValue} className="space-y-2">
                                    <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="radio"
                                            checked={isSelected}
                                            onChange={() =>
                                                onChange(key, optionValue)
                                            }
                                        />
                                        {typeof opt === "string"
                                            ? opt
                                            : opt.label || opt.value}
                                    </label>

                                    {isSelected &&
                                        typeof opt === "object" &&
                                        opt.questions && (
                                            <div className="ml-6 p-4 bg-gray-50 border rounded-md space-y-4">
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
                            checked={!!value}
                            onChange={(e) =>
                                onChange(key, e.target.checked)
                            }
                        />
                        {field.placeholder || "Yes"}
                    </label>
                );

            case "checklist":
                return (
                    <div className="space-y-3">
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
                                        checked={current.includes(optionValue)}
                                        onChange={() =>
                                            onChange(
                                                key,
                                                current.includes(optionValue)
                                                    ? current.filter(
                                                        (v: any) =>
                                                            v !== optionValue
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
                                className="w-full h-10 px-3 border rounded-md text-left text-sm flex justify-between items-center bg-gray-50"
                            >
                                <span>
                                    {value ||
                                        field.placeholder ||
                                        "Select an option"}
                                </span>
                                <span className="opacity-50">▾</span>
                            </button>
                        }
                        items={
                            field.options?.map((opt) => {
                                const optionValue =
                                    typeof opt === "string"
                                        ? opt
                                        : opt.value;

                                return {
                                    id: optionValue,
                                    label:
                                        typeof opt === "string"
                                            ? opt
                                            : opt.label || opt.value,
                                    onClick: () =>
                                        onChange(key, optionValue),
                                };
                            }) || []
                        }
                    />
                );

            default:
                return null;
        }
    };

    return <div className="space-y-6">{renderFields(fields)}</div>;
}
