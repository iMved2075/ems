import { type ButtonProps } from "../types/Button.types"

const Button = (buttonProps: ButtonProps) => {
  return (
    <div>
        <button className={buttonProps.className || "bg-emerald-500 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded"} onClick={buttonProps.onClick} disabled={buttonProps.disabled} type={buttonProps.type}>
            {buttonProps.text}
        </button>
    </div>
  )
}

export default Button
