import { FormEventHandler, useEffect, useState } from "react";
import Pusher from "pusher-js";
import axios from "axios";

const random_users = [
  "John",
  "Jane",
  "Bob",
  "Alice",
  "Peter",
  "Paul",
  "Mary",
  "Mark",
  "Luke",
];

const getRandomUser = () => {
  return random_users[Math.floor(Math.random() * random_users.length)];
};

const Chat = () => {
  const [sender, setSender] = useState(getRandomUser());
  const [chats, setChats] = useState<{ sender: string; message: string }[]>([]);
  const [messageToSend, setMessageToSend] = useState("");

  useEffect(() => {
    const pusher = new Pusher("3439d72211e8cfad8d9b", {
      cluster: "ap1",
    });

    const channel = pusher.subscribe("chat");
    channel.bind("chat-event", (data: any) => {
      setChats(prevState => [
        ...prevState,
        { sender: data.sender, message: data.message },
      ]);
    });

    return () => {
      pusher.unsubscribe("chat");
    };
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault();
    await axios.post("/api/pusher", { message: messageToSend, sender });
  };

  return (
    <>
      <p>Hello, {sender}</p>
      <div>
        {chats.map((chat, id) => (
          <div key={id}>
            <p>{chat.message}</p>
            <small>{chat.sender}</small>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={messageToSend}
          onChange={e => setMessageToSend(e.target.value)}
          placeholder="start typing...."
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
};

export default Chat;
