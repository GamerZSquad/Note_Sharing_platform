"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { PasswordStrength } from "@/components/password-strength";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  className?: string;
  /** Live strength meter — for create/reset flows only, not login. */
  showStrength?: boolean;
};

export function PasswordInput({
  className,
  showStrength = false,
  onChange,
  id,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(
    typeof props.defaultValue === "string" ? props.defaultValue : "",
  );
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const strengthId = `${inputId}-strength`;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          {...props}
          id={inputId}
          type={visible ? "text" : "password"}
          {...(showStrength
            ? {
                value,
                "aria-describedby": value ? strengthId : undefined,
                onChange: (event: ChangeEvent<HTMLInputElement>) => {
                  setValue(event.target.value);
                  onChange?.(event);
                },
              }
            : { onChange })}
          className={cn(
            "w-full rounded-xl border border-line bg-paper py-3 pl-4 pr-12",
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      {showStrength ? <PasswordStrength password={value} id={strengthId} /> : null}
    </div>
  );
}
