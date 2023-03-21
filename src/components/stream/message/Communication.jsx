import { useEffect, useState } from "react";
import { useSigner, useConnect, useAccount } from "wagmi";
import { Client } from "@xmtp/xmtp-js";
import { ethers, getDefaultProvider } from "ethers";
import "./communication.css";
import ConversationLeft from "./ConversationLeft";
import ConversationRight from "./ConversationRight";
import { InjectedConnector } from "wagmi/connectors/injected";

function Communication({ setShowSuper, streamId, notShow }) {
  const { data } = useSigner();
  const { address } = useAccount();
  const [activeAddress, setActiveAddress] = useState("");
  const [client, setClient] = useState(null);
  const [allConversations, setAllConversations] = useState([]);
  const [allMessages, setAllMessages] = useState([
    {
      sender: address,
      createdAt: new Date(),
      msg: "Stream is started !",
    },
  ]);
  const [Conversation, setConversation] = useState();
  const [singleMessage, setSingleMessage] = useState();
  // const [signer, setSigner] = useState(null);
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });

  const getXmtp = async (wallet) => {
    if (!data) {
      connect();
      // alert("Please connect with the wallet first.");

      return;
    }
    const xmtp = await Client.create(data);
    console.log(xmtp);
    setClient(xmtp);
    const allConvs = await xmtp.conversations.list();
    console.log(allConvs);
    // setActiveAddress("0x1c8E4C749754c6EB8Ab0629AfE41Bd5527C33e9E");
    setActiveAddress(address);
    // setActiveAddress(allConvs[0].peerAddress)
    setAllConversations(allConvs);
    setShowSuper(true);
  };

  const getConversation = async () => {
    // Get all the conversations
    const signer = new ethers.Wallet(
      "0x567514509ca3de736e96d064a40356b437b5bfc9a7878eea4cb786b50f76a024",
      getDefaultProvider()
    );

    const ccClient = await Client.create(signer);

    for await (const message of await ccClient.conversations.streamAllMessages()) {
      if (message.conversation.context.conversationId !== streamId) {
        // This message was sent from me
        continue;
      }
      console.log(message);
      let newMessage = {
        sender: message.senderAddress,
        createdAt: message.sent,
        msg: message.content,
        // isSuper: message.isSuper,
      };
      console.log(newMessage);
      let myAppConversations = allMessages;
      console.log(allMessages);
      myAppConversations.push(newMessage);
      setAllMessages(myAppConversations);
      setSingleMessage("");
    }
  };

  useEffect(() => {
    console.log("in");
    console.log(streamId);
    getConversation();
  }, []);

  const sendMsg = async (msg, b) => {
    const conversation = await client.conversations.newConversation(
      "0x2242007ae74311B7B0Bb17274C2ed9369C015227",
      {
        conversationId: streamId,
        metadata: {
          super: b === "super" ? "super" : "",
          title: "Classic Chords -stream" + streamId,
          msg: msg,
          sender: address,
        },
      }
    );
    console.log("Test conversation", conversation);
    conversation.send(msg, b);
  };

  // setTimeout(() => {
  //   getConversation();
  // }, 1000);

  useEffect(() => {
    console.log(activeAddress);

    if (activeAddress) {
      const checkNewMessage = async () => {
        const conversation = await client.conversations.newConversation(
          activeAddress
        );
        for await (const message of await conversation.streamMessages()) {
          if (message.senderAddress === client.address) {
            // This message was sent by me
            continue;
          }
          // getConversations();
          console.log(
            `New message from ${message.senderAddress}: ${message.content}`
          );
        }
      };

      checkNewMessage();
      // getConversations();
    }
  }, [activeAddress]);

  // useEffect(() => {
  //     if (allMessages.length > 0) {
  //         sendMessage();
  //     }
  // }, [allMessages])

  // useEffect(() => {
  //     if (activeAddress) {
  //         const checkStream = async () => {
  //             if (client) {
  //                 const stream = await client.conversations.stream();
  //                 for await (setShowSuperconst conv of stream) {
  //                     console.log("inside stream")
  //                     console.log("Newly added code" + conv.peerAddress);
  //                 }
  //             }
  //         }
  //     }
  //     // sendMessage();
  // }, [])

  if (!client) {
    return (
      <>
        <div className="inactive_client_main">
          <div className="inactive_client_inner">
            <div className="inactive_client_message">
              You are not connected to the XMTP client. Please click on the
              button below to sign and start the conversation.
            </div>
            <div className="inactive_client_btn_holder">
              <button
                onClick={() => {
                  getXmtp();
                  // setShowSuper(true);
                }}
                className="inactive_client_btn"
              >
                Sign
              </button>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        {client ? (
          <div className="message__main">
            {/* <ConversationLeft allConversations={allConversations} setAllConversations={setAllConversations} client={client} activeAddress={activeAddress} setActiveAddress={setActiveAddress} /> */}
            <ConversationRight
              allMessages={allMessages}
              activeAddress={activeAddress}
              sendMessage={sendMsg}
              singleMessage={singleMessage}
              setSingleMessage={setSingleMessage}
              notShow={notShow}
            />
          </div>
        ) : null}
      </>
    );
  }
}

export default Communication;
