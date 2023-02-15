import { Message } from "@prisma/client";
import { User } from "next-auth";

type MessageBubbleProps = {
  data: Message & {
    fromUser: {
      name: string | null;
      image: string | null;
    };
    toUser: {
      name: string | null;
      image: string | null;
    };
  };
  isImage: boolean;
  isFirst: boolean;
};

export const LeftMessageBubble: React.FC<MessageBubbleProps> = ({
  isImage,
  isFirst,
  data,
}) => {
  const { text, createdAt, fromUser } = data;
  return (
    <div className={`flex gap-2 items-end self-start ${isImage && "mb-2"}`}>
      <div className="avatar">
        <div className="w-8 rounded-full">
          {isImage && <img src={fromUser.image!} alt="avatar" />}
        </div>
      </div>
      <p
        className={`text-white border border-neutral bg-neutral rounded-r-3xl rounded-l-lg p-2 px-4 whitespace-pre-line leading-5 max-w-[75%] mr-auto overflow-hidden text-ellipsis        ${
          isImage && "rounded-bl-3xl"
        } 
        ${isFirst && "rounded-tl-3xl"}`}
      >
        {text}
        <span className="ml-1.5 text-xs italic text-white">
          {createdAt.toLocaleString("en", {
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      </p>
    </div>
  );
};

export const RightMessageBubble: React.FC<MessageBubbleProps> = ({
  isImage,
  isFirst,
  data,
}) => {
  const { text, createdAt, fromUser } = data;

  return (
    <div className={`flex gap-2 items-end self-end ${isImage && "mb-2"}`}>
      <p
        className={`text-white border border-primary rounded-l-3xl rounded-r-lg p-2 px-4 bg-primary whitespace-pre-line leading-5 max-w-[75%] ml-auto overflow-hidden text-ellipsis
        ${isImage && "rounded-br-3xl"} 
        ${isFirst && "rounded-tr-3xl"}
        `}
      >
        {text}
        <span className="ml-1.5 text-xs italic text-white">
          {createdAt.toLocaleString("en", {
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      </p>
      <div className="avatar">
        <div className="w-8 rounded-full">
          {isImage && <img src={fromUser.image!} alt="avatar" />}
        </div>
      </div>
    </div>
  );
};
