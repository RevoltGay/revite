import { observer } from "mobx-react-lite";
import { Message as MessageObject } from "revolt.js";

import { useTriggerEvents } from "preact-context-menu";
import { memo } from "preact/compat";
import { useEffect, useState } from "preact/hooks";

import { internalEmit } from "../../../lib/eventEmitter";
import { isTouchscreenDevice } from "../../../lib/isTouchscreenDevice";

import { QueuedMessage } from "../../../mobx/stores/MessageQueue";

import { useIntermediate } from "../../../context/intermediate/Intermediate";
import { useClient } from "../../../context/revoltjs/RevoltClient";

import Overline from "../../ui/Overline";

import { Children } from "../../../types/Preact";
import Markdown from "../../markdown/Markdown";
import UserIcon from "../user/UserIcon";
import { Username } from "../user/UserShort";
import MessageBase, {
    MessageContent,
    MessageDetail,
    MessageInfo,
} from "./MessageBase";
import Attachment from "./attachments/Attachment";
import { MessageReply } from "./attachments/MessageReply";
import { MessageOverlayBar } from "./bars/MessageOverlayBar";
import Embed from "./embed/Embed";
import InviteList from "./embed/EmbedInvite";

interface Props {
    attachContext?: boolean;
    queued?: QueuedMessage;
    message: MessageObject;
    highlight?: boolean;
    contrast?: boolean;
    content?: Children;
    head?: boolean;
    hideReply?: boolean;
}

const Message = observer(
    ({
        highlight,
        attachContext,
        message,
        contrast,
        content: replacement,
        head: preferHead,
        queued,
        hideReply,
    }: Props) => {
        const client = useClient();
        const user = message.author;

        const { openScreen } = useIntermediate();

        const content = message.content;
        const head =
            preferHead || (message.reply_ids && message.reply_ids.length > 0);

        const userContext = attachContext
            ? useTriggerEvents("Menu", {
                  user: message.author_id,
                  contextualChannel: message.channel_id,
                  // eslint-disable-next-line
              })
            : undefined;

        const openProfile = () =>
            openScreen({ id: "profile", user_id: message.author_id });

        const handleUserClick = (e: MouseEvent) => {
            if (e.shiftKey && user?._id) {
                internalEmit(
                    "MessageBox",
                    "append",
                    `<@${user._id}>`,
                    "mention",
                );
            } else {
                openProfile();
            }
        };

        // ! FIXME(?): animate on hover
        const [mouseHovering, setAnimate] = useState(false);
        useEffect(() => setAnimate(false), [replacement]);

        return (
            <div id={message._id}>
                {!hideReply &&
                    message.reply_ids?.map((message_id, index) => (
                        <MessageReply
                            key={message_id}
                            index={index}
                            id={message_id}
                            channel={message.channel}
                            parent_mentions={message.mention_ids ?? []}
                        />
                    ))}
                <MessageBase
                    highlight={highlight}
                    head={
                        hideReply
                            ? false
                            : (head &&
                                  !(
                                      message.reply_ids &&
                                      message.reply_ids.length > 0
                                  )) ??
                              false
                    }
                    contrast={contrast}
                    sending={typeof queued !== "undefined"}
                    mention={message.mention_ids?.includes(client.user!._id)}
                    failed={typeof queued?.error !== "undefined"}
                    {...(attachContext
                        ? useTriggerEvents("Menu", {
                              message,
                              contextualChannel: message.channel_id,
                              queued,
                          })
                        : undefined)}
                    onMouseEnter={() => setAnimate(true)}
                    onMouseLeave={() => setAnimate(false)}>
                    <MessageInfo click={typeof head !== "undefined"}>
                        {head ? (
                            <UserIcon
                                className="avatar"
                                url={message.generateMasqAvatarURL()}
                                target={user}
                                size={36}
                                onClick={handleUserClick}
                                animate={mouseHovering}
                                {...(userContext as any)}
                                showServerIdentity
                            />
                        ) : (
                            <MessageDetail message={message} position="left" />
                        )}
                    </MessageInfo>
                    <MessageContent>
                        {head && (
                            <span className="detail">
                                <Username
                                    user={user}
                                    className="author"
                                    showServerIdentity
                                    onClick={handleUserClick}
                                    masquerade={message.masquerade!}
                                    {...userContext}
                                />
                                <MessageDetail
                                    message={message}
                                    position="top"
                                />
                            </span>
                        )}
                        {replacement ?? <Markdown content={content} />}
                        {!queued && <InviteList message={message} />}
                        {queued?.error && (
                            <Overline type="error" error={queued.error} />
                        )}
                        {message.attachments?.map((attachment, index) => (
                            <Attachment
                                key={index}
                                attachment={attachment}
                                hasContent={
                                    index > 0 ||
                                    (content ? content.length > 0 : false)
                                }
                            />
                        ))}
                        {message.embeds?.map((embed, index) => (
                            <Embed key={index} embed={embed} />
                        ))}
                        {mouseHovering &&
                            !replacement &&
                            !isTouchscreenDevice && (
                                <MessageOverlayBar
                                    message={message}
                                    queued={queued}
                                />
                            )}
                    </MessageContent>
                </MessageBase>
            </div>
        );
    },
);

export default memo(Message);
