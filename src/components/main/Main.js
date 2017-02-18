import React from 'react';
import Badge from 'material-ui/Badge';
import {Tabs, Tab} from 'material-ui/Tabs';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import SwipeableViews from 'react-swipeable-views';

import Friend from "./friend/Friend";
import Messages from "./messages/Messages"

import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import * as mainAction from '../../actions/mainAction';
import {logout} from '../../actions/indexAction';

require('./Main.scss');
const styles = {
    headline: {
        fontSize: 24,
        paddingTop: 16,
        marginBottom: 12,
        fontWeight: 400,
    },
    slide: {
        padding: 10,
    },
};

function mapStateToProps(state) {
    return {main: state.main, user:state.user}
}

function mapDispatchToProps(dispatch) {
    return {
        logout: bindActionCreators(logout, dispatch),

        chatInit: bindActionCreators(mainAction.chatInit, dispatch),
        togglefriendSearch: bindActionCreators(mainAction.togglefriendSearch, dispatch),
        leaveChatRoom: bindActionCreators(mainAction.leaveChatRoom, dispatch),
        friendSearch: bindActionCreators(mainAction.friendSearch, dispatch),
        friendInvitationRequestS: bindActionCreators(mainAction.friendInvitationRequestS, dispatch),
        messageS: bindActionCreators(mainAction.messageS, dispatch),

        toggleFriendInvitationRequestList: bindActionCreators(mainAction.toggleFriendInvitationRequestList, dispatch),
        toggleFriendList: bindActionCreators(mainAction.toggleFriendList, dispatch),
        friendInvitationReponseS: bindActionCreators(mainAction.friendInvitationReponseS, dispatch),
        enterChatRoom: bindActionCreators(mainAction.enterChatRoom, dispatch),
    }
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Main extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            slideIndex: 0,
        };
    }

    componentWillMount() {
        this.props.chatInit();
    }

    componentDidMount(){
    }

    componentWillUnmount(){

    }

    handleChange = (value) => {
        this.setState({
            slideIndex: value,
        });
    };

    render() {
        function createTitleBarButton(title, icon?) {
            return (
                <div className="">
                    {
                        icon ? (<i className={`fa ${icon}`} aria-hidden="true"></i>) : ''
                    }
                    <span className=""> {title} </span>
                </div>
            );
        }

        return (
            <div style={{position:'relative'}}>
                <FriendSearch main={this.props.main} user={this.props.user}
                              friendSearch={this.props.friendSearch}
                              friendInvitationRequestS={this.props.friendInvitationRequestS}
                />
                <Chatroom main={this.props.main} user={this.props.user}
                    messageS={this.props.messageS}
                />
                <div className="main-title-bar">
                    <p className="main-title-bar__title">{
                        this.props.location.pathname === '/main/friend' ? '朋友'
                            : this.props.location.pathname === '/main/chat' ? '聊天' : '設定'
                    }
                        <FlatButton className="main-title-bar__action-button"
                                    onTouchTap={()=>
                                    this.props.main['chatroomShow']?this.props.leaveChatRoom():
                                        this.state.slideIndex === 0?
                                            this.props.togglefriendSearch():'設定'
                                    }
                                    style={{textAlign: 'center',fontSize: '14px',color: 'white'}}
                        >
                            {/* 如果是在聊天室中，搜尋欄顯示 "離開聊天室", 如果是在 */}
                            {
                                this.props.main['chatroomShow'] ?
                                    createTitleBarButton("離開聊天室") :
                                    this.state.slideIndex === 0 ?
                                        createTitleBarButton("搜尋好友", 'fa-search')
                                        : this.state.slideIndex === 1 ?
                                        createTitleBarButton("點擊好友進入聊天")
                                        : createTitleBarButton("設定")
                            }
                        </FlatButton>
                    </p>
                </div>
                <Tabs
                    onChange={this.handleChange}
                    value={this.state.slideIndex}
                    tabItemContainerStyle={{backgroundColor: '#694D00'}}
                    inkBarStyle={{backgroundColor:'#FFCE07', height:'3px'}}
                >
                    <Tab label="好友" value={0}
                         icon={<BadgeWithIcon icon="fa-address-book-o"/>}>
                    </Tab>
                    <Tab label="訊息" value={1}
                         icon={<BadgeWithIcon icon="fa-commenting-o"/>}>
                    </Tab>
                    <Tab label="設定" value={2} icon={<i className="fa fa-cog"></i>}/>
                </Tabs>
                <SwipeableViews
                    index={this.state.slideIndex}
                    onChangeIndex={this.handleChange}
                >
                    <div>
                        <Friend
                            friendList={this.props.main.friendList}
                            friendListShow={this.props.main.friendListShow}
                            friendInvitationRequestList={this.props.main.friendInvitationRequestList}
                            friendInvitationRequestListShow={this.props.main.friendInvitationRequestListShow}
                            messageList={this.props.main.messageList}

                            toggleFriendInvitationRequestList={this.props.toggleFriendInvitationRequestList}
                            toggleFriendList={this.props.toggleFriendList}
                            friendInvitationReponseS={this.props.friendInvitationReponseS}
                            enterChatRoom={this.props.enterChatRoom}
                        />
                    </div>
                    <div style={styles.slide}>
                        <Messages
                            friendList={this.props.main.friendList}
                            messageList={this.props.main.messageList}
                            enterChatRoom={this.props.enterChatRoom}
                        />
                    </div>
                    <div style={styles.slide}>
                        <p>其他功能建置中....</p>
                        <RaisedButton label="登出" secondary={true} fullWidth={true} onTouchTap={()=>this.props.logout()}/>
                    </div>
                </SwipeableViews>
            </div>
        );
    }
}

// 如果直接放在 <Tab icon={}>中無法設定style，所以只能拉出來
class BadgeWithIcon extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Badge
                badgeContent={0}
                secondary={true}
                style={{padding: '2px 15px', fontSize:'24px'}}
                badgeStyle={{top: '-7px', backgroundColor:'#FFCE07'}}
            ><i className={`fa ${this.props.icon}`}></i>
            </Badge>)
    }
}

// 搜尋帳號或暱稱
class FriendSearch extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={`search-user-block ${this.props.main['friendSearchShow']?'search-user-block_show':''}`}>
                <div className="search-user-bar">
                    <input className="search-user-input" type="text" placeholder="輸入帳號或暱稱"
                           onChange={(evt)=>this.props.friendSearch(evt.target.value)}
                    />
                </div>
                <div className="search-user-results">
                    {
                        this.props.main['friendSearchList'].map((fs)=> {
                            return <FriendshipRequest requestee={fs} key={fs.account}
                                                      friendInvitationRequestS={this.props.friendInvitationRequestS}
                            />
                        })
                    }
                </div>
            </div>
        )
    }
}

// 發出交友請求
class FriendshipRequest extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="user-block">
                <img className="user-block__avatar" src={this.props.requestee.avatar || '/media/default_avatar.png'}
                     onError={()=>{this.src='/media/default_avatar.png'}}/>
                <span className="user-block__nickname">{this.props.requestee.nickname}</span>
                <FlatButton style={{
                    marginLeft: 'auto',
                    marginRight: '10px',
                    backgroundColor:
                        this.props.requestee.state === 4? 'lightgray':
                        this.props.requestee.state === 3? 'lightgray':
                        this.props.requestee.state === 2? '#6fca7a':
                        this.props.requestee.state === 1? '#6fca7a':'darkgreen'
                }}
                            onTouchTap={()=>this.props.requestee.state===0?
                            this.props.friendInvitationRequestS(this.props.requestee.account):''}
                            disabled={!(this.props.requestee.state===0)}
                >{
                    this.props.requestee.state === 4 ? '這是你自己' :
                        this.props.requestee.state === 3 ? '已加好友' :
                            this.props.requestee.state === 2 ? '對方已邀請' :
                                this.props.requestee.state === 1 ? '已申請' : '加好友'
                }
                </FlatButton>
            </div>
        )
    }
}

// 聊天室
class Chatroom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {chatContent: ''};
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={`chatroom-block ${this.props.main.chatroomShow?'chatroom-block_show':''}`}>
                <p className="chatList-room__title">
                    {this.props.main.other ? this.props.main.other.nickname : ''}
                </p>
                <div className="chatList-room">
                    {
                        this.props.main.other ? this.props.main.messageList[this.props.main.other.account].map((msg)=> {
                            return (
                                <div key={msg._id || msg.id} className="message-block"
                                     style={{justifyContent: msg.sender === this.props.user.get('account')?'flex-end':'flex-start'}}
                                >
                                    {
                                        msg.sender === this.props.user.get('account') ? '' :
                                            (<div className="user-block__avatar-section message-block__avatar-section">
                                                <img className="user-block__avatar" src={this.props.main.other.avatar || '/media/default_avatar.png'}
                                                     onError={()=>{this.src='/media/default_avatar.png'}}/>
                                                <span className={`user-block__avatar_online-status ${this.props.main.other.onlineStatus?'user-block__avatar_online-status_on':'user-block__avatar_online-status_off'}`}/>
                                            </div>)
                                    }
                                    <div className="message-content"
                                         style={{alignItems: msg.sender === this.props.user.get('account')?'flex-end':'flex-start'}}
                                    >
                                        <p className="message-content__text">{msg.content}</p>
                                        <p className="message-content__time">{msg.createAt || '發送中'}</p>
                                    </div>
                                </div>
                            )
                        }) : (<div></div>)
                    }
                </div>
                <div className="chatroom-send-message">
                    <input className="chatroom-send-message__input" placeholder="說些什麼呢"
                           value={this.state.chatContent} onChange={(evt) => {this.setState({'chatContent':evt.target.value})}} />
                    <button className="chatroom-send-message__button" onTouchTap={()=>{
                            let input = this.state.chatContent;
                            this.setState({chatContent:''});
                            return this.props.messageS(this.props.main.other.account, input)
                        }
                    } disabled={this.state.chatContent? this.state.chatContent==='':true}>發送
                    </button>
                </div>
            </div>
        )
    }
}