"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Dropdown from "@/components/Dropdown";
import { Calendar, ChevronDown } from "lucide-react";

import { FormField } from "@/types/serviceTemplate";


interface Props {
    fields: FormField[];
    values: Record<string, any>;
    errors?: Record<string, string>;
    onChange: (key: string, value: any) => void;
}

export default function DynamicServiceRequestForm({
    fields,
    values,
    errors = {},
    onChange,
}: Props) {
    const renderFields = (fields: FormField[]) =>
        fields.map((field, index) => {
            const key = field.question;

            return (
                <div
                    key={index}
                    className="group space-y-3 p-5 border border-gray-100 rounded-xl bg-white shadow-sm hover:border-primary/20 transition-all duration-200"
                >
                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">
                        {field.question}
                        {field.required && (
                            <span className="text-destructive ml-1">*</span>
                        )}
                    </label>

                    <div className="mt-1">
                        {renderField(field)}
                    </div>

                    {errors[key] && (
                        <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                            {errors[key]}
                        </p>
                    )}
                </div>
            );
        });

    const PickerWrapper = ({
        children,
    }: {
        children: React.ReactNode;
    }) => (
        <div className="flex items-center gap-3 h-11 px-3 border border-gray-200 rounded-lg bg-gray-50/50 focus-within:bg-white focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/5 transition-all">
            <Calendar size={18} className="text-gray-400" />
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
                        placeholder={field.placeholder || "Enter details..."}
                        maxLength={field.maxLength}
                        className="h-11 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/5 rounded-lg transition-all"
                        onChange={(e) => onChange(key, e.target.value)}
                    />
                );

            case "text_area":
                return (
                    <Textarea
                        value={value || ""}
                        placeholder={field.placeholder || "Type your response here..."}
                        rows={4}
                        className="resize-none border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/5 rounded-lg transition-all"
                        onChange={(e) => onChange(key, e.target.value)}
                    />
                );

            /* -------- DATE -------- */
            case "date":
                return (
                    <PickerWrapper>
                        <input
                            type="date"
                            className="w-full bg-transparent text-sm outline-none cursor-pointer"
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
                            className="w-full bg-transparent text-sm outline-none cursor-pointer"
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
                            fullWidth
                            trigger={
                                <button
                                    type="button"
                                    className="w-full h-11 px-4 border border-gray-200 rounded-xl text-left text-sm flex justify-between items-center bg-gray-50/50 hover:bg-white hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all shadow-sm"
                                >
                                    <span className={value ? "text-gray-900 font-semibold" : "text-gray-400 font-medium"}>
                                        {value ||
                                            field.placeholder ||
                                            "Select year"}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-400 opacity-50" />
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
                            className="w-full bg-transparent text-sm outline-none cursor-pointer"
                            value={value || ""}
                            onChange={(e) =>
                                onChange(key, e.target.value)
                            }
                        />
                    </PickerWrapper>
                );

            case "radio":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {field.options?.map((opt) => {
                            const optionValue =
                                typeof opt === "string" ? opt : opt.value;
                            const isSelected = value === optionValue;

                            return (
                                <div key={optionValue} className="space-y-2 col-span-full">
                                    <label 
                                      className={`flex items-center gap-3 p-3 text-sm rounded-lg border cursor-pointer transition-all ${
                                        isSelected 
                                        ? "bg-primary/5 border-primary text-primary font-medium" 
                                        : "bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50"
                                      }`}
                                    >
                                        <input
                                            type="radio"
                                            className="w-4 h-4 accent-primary"
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
                                            <div className="ml-6 p-5 bg-gray-50/50 border border-dashed border-gray-200 rounded-xl space-y-6 animate-in slide-in-from-top-2 duration-300">
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
                    <label 
                      className={`flex items-center gap-3 p-3 text-sm rounded-lg border cursor-pointer transition-all ${
                        value 
                        ? "bg-primary/5 border-primary text-primary font-medium" 
                        : "bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                        <input
                            type="checkbox"
                            className="w-4 h-4 accent-primary"
                            checked={!!value}
                            onChange={(e) =>
                                onChange(key, e.target.checked)
                            }
                        />
                        {field.placeholder || "Yes, I agree"}
                    </label>
                );

            case "checklist":
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {field.options?.map((opt) => {
                            const optionValue =
                                typeof opt === "string" ? opt : opt.value;
                            const current = Array.isArray(value)
                                ? value
                                : [];
                            const isSelected = current.includes(optionValue);

                            return (
                                <label
                                    key={optionValue}
                                    className={`flex items-center gap-3 p-3 text-sm rounded-lg border cursor-pointer transition-all ${
                                      isSelected 
                                      ? "bg-primary/5 border-primary text-primary font-medium" 
                                      : "bg-gray-50/50 border-gray-100 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-primary"
                                        checked={isSelected}
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
                    fullWidth
                    searchable={field.options && field.options.length > 10}
                    trigger={
                        <button
                            type="button"
                            className="w-full h-11 px-4 border border-gray-200 rounded-xl text-left text-sm flex justify-between items-center bg-gray-50/50 hover:bg-white hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all shadow-sm"
                        >
                            <span className={value ? "text-gray-900 font-semibold" : "text-gray-400 font-medium"}>
                                {value ||
                                    field.placeholder ||
                                    "Select an option"}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-400 opacity-50" />
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

    return <div className="grid grid-cols-1 gap-6">{renderFields(fields)}</div>;
}
