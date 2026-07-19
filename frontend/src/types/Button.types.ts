interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  text: string;
}

export type { ButtonProps };