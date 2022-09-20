import { User } from "next-auth";

type chatMessageData = {
  message: string;
  sender: User;
  createdAt: string;
};

type MessageBubbleProps = {
  data: chatMessageData;
  isImage: boolean;
  isFirst: boolean;
};

export const LeftMessageBubble: React.FC<MessageBubbleProps> = ({
  isImage,
  isFirst,
  data,
}) => {
  const { message, sender, createdAt } = data;

  return (
    <div className="flex gap-2 items-end self-start">
      <div className="avatar">
        <div className="w-8 rounded-full">
          {isImage && <img src={sender.image!} alt="avatar" />}
        </div>
      </div>
      <p
        className={`text-white border border-neutral bg-neutral rounded-r-3xl rounded-l-lg p-2 px-4 whitespace-pre-line leading-5 max-w-[75%] mr-auto overflow-hidden text-ellipsis        ${
          isImage && "rounded-bl-3xl"
        } 
        ${isFirst && "rounded-tl-3xl"}`}
      >
        {message}
        <span className="ml-1.5 text-xs italic text-white">
          {new Date(createdAt).toLocaleString("en", {
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
  const { message, sender, createdAt } = data;
  return (
    <div
      className={`flex gap-2 items-end self-end ${isImage && "mb-2"} ${
        isFirst && "mt-2"
      }`}
    >
      <p
        className={`text-white border border-primary rounded-l-3xl rounded-r-lg p-2 px-4 bg-primary whitespace-pre-line leading-5 max-w-[75%] ml-auto overflow-hidden text-ellipsis
        ${isImage && "rounded-br-3xl"} 
        ${isFirst && "rounded-tr-3xl"}
        `}
      >
        {message}
        <span className="ml-1.5 text-xs italic text-white">
          {new Date(createdAt).toLocaleString("en", {
            hour: "numeric",
            minute: "numeric",
          })}
        </span>
      </p>
      <div className="avatar">
        <div className="w-8 rounded-full">
          {isImage && <img src={sender.image!} alt="avatar" />}
        </div>
      </div>
    </div>
  );
};
