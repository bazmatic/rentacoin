import { ChangeEvent } from "react";

interface CheckboxProps {
    id: string;
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    disabled: boolean;
    label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
    id,
    checked,
    onChange,
    disabled,
    label
}) => (
    <div className="flex items-center space-x-2">
        <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="form-checkbox h-4 w-4 text-green-500 border-green-500 rounded focus:ring-green-500 focus:ring-opacity-25 bg-black"
        />
        <label
            htmlFor={id}
            className={`text-sm font-medium leading-none ${
                disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
        >
            {label}
        </label>
    </div>
);

export {
    Checkbox
}
