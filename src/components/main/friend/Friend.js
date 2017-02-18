import React from "react";
import RaisedButton from 'material-ui/RaisedButton';
import {red500, green500, grey50} from 'material-ui/styles/colors';
require('./Friend.scss');

export default class Friend extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div>
                <section className="friend-list">
                    <div className="friend-list__title"
                         onTouchTap={()=>this.props.toggleFriendInvitationRequestList()}
                    >
                        <span className="friend-list__title-text">好友申請</span>
                        <span
                            className="friend-list__title-num">{this.props.friendInvitationRequestList.length}</span>
                        <i className={`material-icons friend-list__title-show-button fa fa-arrow-right
                            ${this.props.friendInvitationRequestListShow?'friend-list__title-show-button_show':''}`}
                        ></i>
                    </div>
                    <div
                        className={`friend-list__section ${this.props.friendInvitationRequestListShow?'friend-list__section_show':''}`}>
                        {
                            this.props.friendInvitationRequestList.map((fq)=> {

                                return <FriendshipResponse requester={fq}
                                                           friendInvitationReponseS={this.props.friendInvitationReponseS}
                                                           key={fq.account}/>
                            })
                        }
                    </div>
                </section>
                <section className="friend-list">
                    <div className="friend-list__title"
                         onTouchTap={()=>this.props.toggleFriendList()}
                    >
                        <span className="friend-list__title-text">好友列表</span>
                        <span
                            className="friend-list__title-num">{this.props.friendList.length}</span>
                        <i className={`material-icons friend-list__title-show-button fa fa-arrow-right
                                ${this.props.friendListShow?'friend-list__title-show-button_show':''}`}
                        ></i>
                    </div>
                    <div
                        className={`friend-list__section ${this.props.friendListShow?'friend-list__section_show':''}`}>
                        {
                            this.props.friendList.map((fq)=>

                                <FriendUnit friend={fq}
                                            key={fq.account}
                                            enterChatRoom={this.props.enterChatRoom}
                                />
                            )
                        }
                    </div>
                </section>
            </div>
        )
    }
}

// 回覆交友請求
// 需要傳入 user.id, user.avatar , user.nickname
class FriendshipResponse extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block">
                <img className="user-block__avatar" src={this.props.requester.avatar || '/media/default_avatar.png' }
                     onError={()=>{this.src='/media/default_avatar.png'}}/>
                <span className="user-block__nickname">{this.props.requester.nickname}</span>
                <RaisedButton label="接受" className="friendship-response-btn friendship-response-btn_accept"
                              onClick={()=>this.props.friendInvitationReponseS(this.props.requester.account, true)} backgroundColor={green500} labelColor={grey50}
                />
                <RaisedButton label="拒絕" className="friendship-response-btn friendship-response-btn_reject"
                              onClick={()=>this.props.friendInvitationReponseS(this.props.requester.account, false)} backgroundColor={red500} labelColor={grey50}
                />
            </div>
        )
    }
}
FriendshipResponse.propTypes = {
    requester: React.PropTypes.object
};

//好友清單中的好友元件，傳入user
class FriendUnit extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block" onTouchTap={()=>this.props.enterChatRoom(this.props.friend)}>
                <div className="user-block__avatar-section">
                    <img className="user-block__avatar" src={this.props.friend.avatar || '/media/default_avatar.png'}
                         onError={()=>{this.src='/media/default_avatar.png'}}/>
                    <span className={`user-block__avatar_online-status ${this.props.friend.onlineStatus?'user-block__avatar_online-status_on':'user-block__avatar_online-status_off'}`}/>
                </div>
                <span className="user-block__nickname">{this.props.friend.nickname}</span>
            </div>
        )
    }
}
FriendUnit.propTypes = {
    friend: React.PropTypes.object
};