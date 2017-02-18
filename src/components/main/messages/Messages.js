import React from "react";
require('./Messages.scss');

export default class Messages extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                {
                    this.props.friendList.map((fq)=>
                        <ChatUnit friend={fq}
                                  key={fq.account}
                                  lastMsg={this.props.messageList[fq.account][this.props.messageList[fq.account].length-1] || '快來跟好友請安囉'}
                                  enterChatRoom={this.props.enterChatRoom}
                        />
                    )
                }
            </div>
        )
    }
}

class ChatUnit extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block" style={{position:'relative'}} onTouchTap={()=>this.props.enterChatRoom(this.props.friend)}>
                <div className="user-block__avatar-section">
                    <img className="user-block__avatar" src={this.props.friend.avatar || '/media/default_avatar.png'}
                         onError={()=>{this.src='/media/default_avatar.png'}}/>
                    <span className={`user-block__avatar_online-status ${this.props.friend.onlineStatus?'user-block__avatar_online-status_on':'user-block__avatar_online-status_off'}`}/>
                </div>
                <div className="chat-block__info">
                    <p className="chat-block__nickname">{this.props.friend.nickname}</p>
                    <p className="chat-block__last-msg-content">{this.props.lastMsg.content}</p>
                </div>
                <p className="chat-block__last-msg-time">{this.props.lastMsg.createAt}</p>
            </div>
        )
    }
}