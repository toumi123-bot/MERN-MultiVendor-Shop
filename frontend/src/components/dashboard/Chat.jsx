import React, { useEffect, useRef, useState } from "react";
import { AiOutlineMessage, AiOutlinePlus } from "react-icons/ai";
import { GrEmoji } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  add_friend,
  messageClear,
  send_message,
  updateMessage,
} from "../../store/reducers/chatReducer";
import toast from "react-hot-toast";
import io from "socket.io-client";
import { FaList } from "react-icons/fa";
const socket = io(
  "https://bimastore-backend-hredgxfkhxfgf9dt.francecentral-01.azurewebsites.net",
  {
    withCredentials: true,
    transports: ["websocket"], // 🔒 éviter le fallback polling (cause souvent des 403 sur Azure)
  }
);

const Chat = () => {
  const scrollRef = useRef();
  const dispatch = useDispatch();
  const { sellerId } = useParams();
  const { userInfo } = useSelector((state) => state.auth);
  const { fb_messages, currentFd, my_friends, successMessage } = useSelector(
    (state) => state.chat
  );
  const [text, setText] = useState("");
  const [receverMessage, setReceverMessage] = useState("");
  const [activeSeller, setActiveSeller] = useState([]);
  const [show, setShow] = useState(false);
  useEffect(() => {
    socket.emit("add_user", userInfo.id, userInfo);
  }, []);

  useEffect(() => {
    dispatch(
      add_friend({
        sellerId: sellerId || "",
        userId: userInfo.id,
      })
    );
  }, [sellerId]);

  const send = () => {
    if (text) {
      dispatch(
        send_message({
          userId: userInfo.id,
          text,
          sellerId,
          name: userInfo.name,
        })
      );
      setText("");
    }
  };
  useEffect(() => {
    socket.on("seller_message", (msg) => {
      setReceverMessage(msg);
    });
    socket.on("activeSeller", (sellers) => {
      setActiveSeller(sellers);
    });
  }, []);
  useEffect(() => {
    if (successMessage) {
      socket.emit("send_customer_message", fb_messages[fb_messages.length - 1]);
      dispatch(messageClear());
    }
  }, [successMessage]);

  useEffect(() => {
    if (receverMessage) {
      if (
        sellerId === receverMessage.senderId &&
        userInfo.id === receverMessage.receverId
      ) {
        dispatch(updateMessage(receverMessage));
      } else {
        toast.success(receverMessage.senderName + " " + "Send A message");
        dispatch(messageClear());
      }
    }
  }, [receverMessage]);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fb_messages]);
  return (
    <div className="bg-white p-3 rounded-md">
      <div className="w-full flex">
        <div
          className={`w-[230px] md-lg:absolute bg-white md-lg:h-full -left-[350px] ${
            show ? "-left-0" : "-left-[350px]"
          }`}
        >
          <div className="flex justify-center gap-3 items-center text-slate-600 text-xl h-[50px]">
            <span>
              <AiOutlineMessage />
            </span>
            <span>Message</span>
          </div>
          <div className="w-full flex flex-col text-slate-600 py-4 h-[400px] pr-3">
            {my_friends.map((f, i) => (
              <Link
                to={`/dashboard/chat/${f.fdId}`}
                key={i}
                className={`flex gap-2 justify-start items-center pl-2 py-[5px]`}
              >
                <div className="w-[30px] h-[30px] rounded-full relative">
                  {activeSeller.some((c) => c.sellerId === f.fdId) && (
                    <div className="w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0"></div>
                  )}

                  <img src={f.image} alt="" />
                </div>
                <span>{f.name}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="w-[calc(100%-230px)] md-lg:w-full">
          {currentFd ? (
            <div className="w-full h-full">
              <div className="flex justify-between gap-3 items-center text-slate-600 text-xl h-[50px]">
                <div className="flex gap-2">
                  <div className="w-[30px] h-[30px] rounded-full relative">
                    {activeSeller.some(
                      (c) => c.sellerId === currentFd.fdId
                    ) && (
                      <div className="w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0"></div>
                    )}
                    <img src={currentFd.image} />
                  </div>
                  <span>{currentFd.name}</span>
                </div>
                <div
                  onClick={() => setShow(!show)}
                  className="w-[35px] h-[35px] hidden md-lg:flex cursor-pointer rounded-sm justify-center items-center bg-sky-500 text-white"
                >
                  <FaList />
                </div>
              </div>
              <div className="h-[400px] w-full bg-slate-100 p-3 rounded-md">
                <div className="w-full h-full overflow-y-auto flex flex-col gap-3">
                  {fb_messages.map((m, i) => {
                    if (currentFd?.fdId !== m.receverId) {
                      return (
                        <div
                          ref={scrollRef}
                          key={i}
                          className="w-full flex gap-2 justify-start items-center text-[14px]"
                        >
                          <img
                            className="w-[30px] h-[30px] "
                            src="https://icy-smoke-09917aa1e.1.azurestaticapps.net/images/user.png"
                            alt=""
                          />
                          <div className="p-2 bg-purple-500 text-white rounded-md">
                            <span>{m.message}</span>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          ref={scrollRef}
                          key={i}
                          className="w-full flex gap-2 justify-end items-center text-[14px]"
                        >
                          <img
                            className="w-[30px] h-[30px] "
                            src="https://icy-smoke-09917aa1e.1.azurestaticapps.net/images/user.png"
                            alt=""
                          />
                          <div className="p-2 bg-cyan-500 text-white rounded-md">
                            <span>{m.message}</span>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
              <div className="flex p-2 justify-between items-center w-full">
                <div className="w-[40px] h-[40px] border p-2 justify-center items-center flex rounded-full">
                  <label className="cursor-pointer" htmlFor="">
                    <AiOutlinePlus />
                  </label>
                  <input className="hidden" type="file" />
                </div>
                <div className="border h-[40px] p-0 ml-2 w-[calc(100%-90px)] rounded-full relative">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    type="text"
                    placeholder="input message"
                    className="w-full rounded-full h-full outline-none p-3"
                  />
                  <div className="text-2xl right-2 top-2 absolute cursor-auto">
                    <span>
                      <GrEmoji />
                    </span>
                  </div>
                </div>
                <div className="w-[40px] p-2 justify-center items-center rounded-full">
                  <div onClick={send} className="text-2xl cursor-pointer">
                    <IoSend />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShow(true)}
              className="w-full h-[400px] flex justify-center items-center text-lg ont-bold text-slate-600"
            >
              <span>Select Seller</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Chat;
