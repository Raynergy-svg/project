"use client";

import { useState } from "react";
import { DebtAccount } from "@/hooks/useDashboard";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  FileText,
} from "lucide-react";

// Debt categories
const DEBT_CATEGORIES = [
  { value: "Credit Card", label: "Credit Card", icon: CreditCard },
  { value: "Mortgage", label: "Mortgage", icon: Home },
  { value: "Auto Loan", label: "Auto Loan", icon: Car },
  { value: "Student Loan", label: "Student Loan", icon: GraduationCap },
  { value: "Personal Loan", label: "Personal Loan", icon: Briefcase },
  { value: "Medical Debt", label: "Medical Debt", icon: FileText },
  { value: "Other", label: "Other", icon: FileText },
];

export interface DebtFormProps {
  initialData?: Partial<DebtAccount>;
  onSubmit: (data: Partial<DebtAccount>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function DebtForm({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DebtFormProps) {
  const [formData, setFormData] = useState<Partial<DebtAccount>>({
    name: "",
    category: "Credit Card",
    amount: 0,
    interestRate: 0,
    minimumPayment: 0,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Handle number inputs
    if (["amount", "interestRate", "minimumPayment"].includes(name)) {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Clear error when field is updated
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Debt name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than zero";
    }

    if (formData.interestRate === undefined || formData.interestRate < 0) {
      newErrors.interestRate = "Interest rate must be a positive number";
    }

    if (!formData.minimumPayment || formData.minimumPayment <= 0) {
      newErrors.minimumPayment = "Minimum payment must be greater than zero";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Debt Name */}
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium text-white block">
          Debt Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black/20 border ${
            errors.name ? "border-red-500" : "border-white/20"
          } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50`}
          placeholder="e.g., Chase Credit Card"
        />
        {errors.name && (
          <p className="text-xs text-red-500 mt-1">{errors.name}</p>
        )}
      </div>

      {/* Debt Category */}
      <div className="space-y-2">
        <label
          htmlFor="category"
          className="text-sm font-medium text-white block"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-black/20 border ${
            errors.category ? "border-red-500" : "border-white/20"
          } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50`}
        >
          {DEBT_CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-xs text-red-500 mt-1">{errors.category}</p>
        )}
      </div>

      {/* Debt Amount */}
      <div className="space-y-2">
        <label
          htmlFor="amount"
          className="text-sm font-medium text-white block"
        >
          Current Balance
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/60">
            $
          </span>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount?.toString()}
            onChange={handleChange}
            className={`w-full pl-8 pr-3 py-2 bg-black/20 border ${
              errors.amount ? "border-red-500" : "border-white/20"
            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50`}
            placeholder="0.00"
          />
        </div>
        {errors.amount && (
          <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
        )}
      </div>

      {/* Interest Rate */}
      <div className="space-y-2">
        <label
          htmlFor="interestRate"
          className="text-sm font-medium text-white block"
        >
          Interest Rate (%)
        </label>
        <div className="relative">
          <input
            id="interestRate"
            name="interestRate"
            type="number"
            min="0"
            step="0.01"
            value={formData.interestRate?.toString()}
            onChange={handleChange}
            className={`w-full pr-8 px-3 py-2 bg-black/20 border ${
              errors.interestRate ? "border-red-500" : "border-white/20"
            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50`}
            placeholder="0.00"
          />
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/60">
            %
          </span>
        </div>
        {errors.interestRate && (
          <p className="text-xs text-red-500 mt-1">{errors.interestRate}</p>
        )}
      </div>

      {/* Minimum Payment */}
      <div className="space-y-2">
        <label
          htmlFor="minimumPayment"
          className="text-sm font-medium text-white block"
        >
          Minimum Monthly Payment
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white/60">
            $
          </span>
          <input
            id="minimumPayment"
            name="minimumPayment"
            type="number"
            min="0"
            step="0.01"
            value={formData.minimumPayment?.toString()}
            onChange={handleChange}
            className={`w-full pl-8 pr-3 py-2 bg-black/20 border ${
              errors.minimumPayment ? "border-red-500" : "border-white/20"
            } rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50`}
            placeholder="0.00"
          />
        </div>
        {errors.minimumPayment && (
          <p className="text-xs text-red-500 mt-1">{errors.minimumPayment}</p>
        )}
      </div>

      {/* Optional: Due Date */}
      <div className="space-y-2">
        <label
          htmlFor="dueDate"
          className="text-sm font-medium text-white block"
        >
          Due Date (Optional)
        </label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={formData.dueDate || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#88B04B]/50"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-white/20 text-white hover:bg-white/10"
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#88B04B] hover:bg-[#79A042] text-white"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : initialData.id
            ? "Update Debt"
            : "Add Debt"}
        </Button>
      </div>
    </form>
  );
}
