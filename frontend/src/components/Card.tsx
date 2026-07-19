import { type CardProps } from "../types/card.types";

const Card = (cardProps: CardProps) => {
  return (
    <div
      className={
        cardProps.className ||
        "w-1/4 h-48 rounded overflow-hidden shadow-lg bg-(--card-background) border border-slate-400/80 "
      }
    >
      <div className="px-6 py-4">
        {cardProps.icon}
        <div className="text-base my-2">{cardProps.title}</div>
        <p className="font-bold text-xl text-gray-700">
          {cardProps.description}
        </p>
      </div>
    </div>
  );
};

export default Card;
