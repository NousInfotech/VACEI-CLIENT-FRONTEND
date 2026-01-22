"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface LiquidationFormData {
  whatDoYouNeed: "mvl" | "cvl" | "strike_off" | "wind_down" | "other" | "";
  otherSpecify?: string;
  isSolvent?: "yes" | "no" | "not_sure";
  estimatedTimeline?: "asap" | "flexible";
  liquidationClarification?: string;
  isTrading?: "yes" | "no" | "not_sure";
  strikeOffClarification?: string;
  windDownSituation?: "not_operating" | "restructuring" | "planned_exit" | "other";
  windDownOtherSpecify?: string;
  windDownClarification?: string;
  additionalDetails?: string;
  uploadedFiles: File[];
}

interface LiquidationRequestFormProps {
  formData: LiquidationFormData;
  onChange: (data: LiquidationFormData) => void;
  onFileChange: (files: File[]) => void;
}

export default function LiquidationRequestForm({
  formData,
  onChange,
  onFileChange,
}: LiquidationRequestFormProps) {
  const showLiquidationFields = formData.whatDoYouNeed === "mvl" || formData.whatDoYouNeed === "cvl";
  const showStrikeOffFields = formData.whatDoYouNeed === "strike_off";
  const showWindDownFields = formData.whatDoYouNeed === "wind_down";
  const showOtherField = formData.whatDoYouNeed === "other";
  const showWindDownOther = formData.windDownSituation === "other";

  return (
    <div className="space-y-6">
      {/* Purpose Section */}
      <div className="space-y-2 pb-4 border-b">
        <h3 className="text-sm font-semibold text-gray-900">Purpose</h3>
        <p className="text-sm text-gray-600">
          This form does not cover ongoing corporate administration (CSP) or company structure changes.
        </p>
      </div>

      {/* Required Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">Required fields</h3>

        {/* What do you need? */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">
            What do you need? <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            {[
              { value: "mvl", label: "Members' Voluntary Liquidation (MVL)" },
              { value: "cvl", label: "Creditors' Voluntary Liquidation (CVL)" },
              { value: "strike_off", label: "Company strike-off (dormant or inactive company)" },
              { value: "wind_down", label: "Wind-down planning / advice" },
              { value: "other", label: "Other" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="radio"
                  name="whatDoYouNeed"
                  value={option.value}
                  checked={formData.whatDoYouNeed === option.value}
                  onChange={(e) =>
                    onChange({ ...formData, whatDoYouNeed: e.target.value as any })
                  }
                  className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* If Other */}
        {showOtherField && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              If Other → Please specify
            </label>
            <Input
              type="text"
              value={formData.otherSpecify || ""}
              onChange={(e) => onChange({ ...formData, otherSpecify: e.target.value })}
              placeholder="Please specify"
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Conditional Fields - MVL or CVL */}
      {showLiquidationFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Members' or Creditors' Voluntary Liquidation → Is the company solvent?
              </label>
              <div className="flex gap-4">
                {[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                  { value: "not_sure", label: "Not sure" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="isSolvent"
                      value={option.value}
                      checked={formData.isSolvent === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, isSolvent: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estimated timeline</label>
              <div className="flex gap-4">
                {[
                  { value: "asap", label: "ASAP" },
                  { value: "flexible", label: "Flexible" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="estimatedTimeline"
                      value={option.value}
                      checked={formData.estimatedTimeline === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, estimatedTimeline: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.liquidationClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, liquidationClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Strike-off */}
      {showStrikeOffFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Company strike-off → Is the company currently trading?
              </label>
              <div className="flex gap-4">
                {[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                  { value: "not_sure", label: "Not sure" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="isTrading"
                      value={option.value}
                      checked={formData.isTrading === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, isTrading: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.strikeOffClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, strikeOffClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Conditional Fields - Wind-down */}
      {showWindDownFields && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="text-sm font-semibold text-gray-900">Conditional fields</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                If Wind-down planning / advice → What best describes your situation?
              </label>
              <div className="space-y-2">
                {[
                  { value: "not_operating", label: "Company no longer operating" },
                  { value: "restructuring", label: "Business restructuring" },
                  { value: "planned_exit", label: "Planned exit" },
                  { value: "other", label: "Other" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="radio"
                      name="windDownSituation"
                      value={option.value}
                      checked={formData.windDownSituation === option.value}
                      onChange={(e) =>
                        onChange({ ...formData, windDownSituation: e.target.value as any })
                      }
                      className="w-4 h-4 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {showWindDownOther && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  If Other → Please specify
                </label>
                <Input
                  type="text"
                  value={formData.windDownOtherSpecify || ""}
                  onChange={(e) =>
                    onChange({ ...formData, windDownOtherSpecify: e.target.value })
                  }
                  placeholder="Please specify"
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Optional clarification</label>
              <Textarea
                value={formData.windDownClarification || ""}
                onChange={(e) =>
                  onChange({ ...formData, windDownClarification: e.target.value })
                }
                rows={3}
                className="w-full"
                placeholder="Enter optional clarification..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Optional clarification */}
      <div className="space-y-2 border-t pt-4">
        <label className="text-sm font-medium text-gray-700">
          Optional clarification (free text)
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Additional details related to the liquidation or wind-down. You may include background information, known deadlines, creditor considerations, or prior advice received.
        </p>
        <Textarea
          value={formData.additionalDetails || ""}
          onChange={(e) => onChange({ ...formData, additionalDetails: e.target.value })}
          rows={4}
          className="w-full"
          placeholder="Enter additional details..."
        />
      </div>
    </div>
  );
}

