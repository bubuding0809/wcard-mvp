import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";

type MessageFormProps = {
  innerRef: React.RefObject<HTMLTextAreaElement>;
  handleSubmit: any;
};

const MessageTextAreaForm: React.FC<MessageFormProps> = ({
  innerRef,
  handleSubmit,
}) => {
  const [messageToSend, setMessageToSend] = useState("");
  return (
    <div className="w-full px-2 bg-slate-50 p-2">
      <form onSubmit={e => handleSubmit(e, messageToSend, setMessageToSend)}>
        <div className="flex gap-2 items-center">
          <TextareaAutosize
            ref={innerRef}
            className="w-full rounded-lg p-3 leading-5 resize-none"
            maxRows={4}
            value={messageToSend}
            onChange={e => setMessageToSend(e.target.value)}
            placeholder="Send something..."
            autoFocus
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e, messageToSend, setMessageToSend);
              }
            }}
          />
          <button className="btn btn-square btn-md self-end" type="submit">
            <PaperAirplaneIcon className="w-6 h-auto" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageTextAreaForm;
