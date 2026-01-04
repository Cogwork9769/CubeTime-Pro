import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`px-3 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition ${className}`}
      {...props}
    />
  );
}
