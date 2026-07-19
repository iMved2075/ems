import type { JSX } from "@emotion/react/jsx-runtime";

interface CardProps {
    title: string;
    description: string;
    icon: JSX.Element;
    onClick: () => void;
    className?: string;
}

export type { CardProps };