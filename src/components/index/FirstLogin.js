import React from "react";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {browserHistory} from 'react-router';
import Cropper from 'react-crop';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';

import * as FirstLoginAction from "../../actions/firstLoginAction";
import CommonStyle from "../common/CommonStyle"

require('./FirstLogin.scss');

function mapStateToProps(state) {
    return {firstLogin: state.firstLogin, user: state.user}
}

@connect(mapStateToProps)
export class FirstLogin extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
    }

    render() {
        return (
            <div className="first-login">
                <div className="first-login-header">
                    <div className="first-login-header__title">
                        輸入基本資料
                    </div>
                    <div className="first-login-header__subtitle">
                        讓大家更快認識你，也可選擇進入後修改
                    </div>
                </div>
                <div className="first-login-step-container">
                    {this.props.children}
                </div>
                <div className="first-login-footer">
                    <div className="first-login-footer-steps-mask"
                         style={{width:`calc( (${this.props.firstLogin.step} - 1) * (90vw / 4) + 10vw + 48px )`}}>
                        <span className="first-login-footer-step-space-mask"/>
                        <span className="first-login-footer-step-space-mask"/>
                        <span className="first-login-footer-step-space-mask"/>
                        <span className="first-login-footer-step-mask">1</span>
                        <span className="first-login-footer-step-mask">2</span>
                        <span className="first-login-footer-step-mask">3</span>
                        <span className="first-login-footer-step-mask">4</span>
                    </div>
                    <div className="first-login-footer-steps">
                        <span className="first-login-footer-step-space"/>
                        <span className="first-login-footer-step-space"/>
                        <span className="first-login-footer-step-space"/>
                        <span className="first-login-footer-step">1</span>
                        <span className="first-login-footer-step">2</span>
                        <span className="first-login-footer-step">3</span>
                        <span className="first-login-footer-step">4</span>
                    </div>
                </div>
            </div>
        )
    }
}

// 設定暱稱與性別
const Step1Style = {
    TextField: {
        textField: {
            display: "block"
        }
        ,
        floatingLabel: {
            fontSize: CommonStyle.mid_font,
            letterSpacing: '5px',
            color: CommonStyle.dark_brwon
        },
        input: {
            letterSpacing: '3px'
        },
        underlineFocus: {
            borderColor: CommonStyle.light_yellow
        }
    },
    RaisedButton: {
        fontSize: CommonStyle.mid_font,
        color: 'white',
        backgroundColor: CommonStyle.dark_brwon
    }
};

@connect(mapStateToProps, (dispatch)=> {
    return {
        nicknameInputValidate: bindActionCreators(FirstLoginAction.nicknameInputValidate, dispatch),
        setUserGender: bindActionCreators(FirstLoginAction.setUserGender, dispatch),
        setUserNicknameAndGender: bindActionCreators(FirstLoginAction.setUserNicknameAndGender, dispatch),
        goNextStep: bindActionCreators(FirstLoginAction.goNextStep, dispatch)
    }
})
export class Step1 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.nicknameInputValidate(this.props.user.get('nickname'));
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.firstLogin.step !== 1) {
            browserHistory.push('/firstLogin/step' + nextProps.firstLogin.step);
        }
    }

    render() {
        return (
            <form className="first-login-step1-form">
                <TextField
                    style={Step1Style.TextField.textField}
                    hintText="輸入由中英文和數字組成的暱稱"
                    type="text"
                    errorText={this.props.firstLogin.nicknameInputValidationErr}
                    inputStyle={Step1Style.TextField.input}
                    fullWidth={true}
                    floatingLabelText="暱稱"
                    floatingLabelStyle={Step1Style.TextField.floatingLabel}
                    floatingLabelFixed={true}
                    underlineFocusStyle={Step1Style.TextField.underlineFocus}
                    defaultValue={this.props.user.get('nickname')}
                    onChange={(event, newValue) => this.props.nicknameInputValidate(newValue)}
                />
                <div className="form-input-section">
                    <label className="form-input-section__input-label">性別</label>
                    <RadioButtonGroup name="shipSpeed" defaultSelected="男"
                                      onChange={(evt, value)=> this.props.setUserGender(value==='男')}
                    >
                        <RadioButton
                            value="男"
                            label="男"
                            iconStyle={{fill: '#2DC0C6'}}
                        />
                        <RadioButton
                            value="女"
                            label="女"
                            iconStyle={{fill: '#C74A4E'}}
                        />
                    </RadioButtonGroup>
                </div>
                <RaisedButton
                    label="下一步"
                    labelColor="white"
                    backgroundColor={Step1Style.RaisedButton.backgroundColor}
                    disabledBackgroundColor={"#4D4D4D"}
                    disabledLabelColor="white"
                    disabled={!this.props.firstLogin.nicknameInputValidation || this.props.firstLogin.nicknameInput===''}
                    className="first-login-form__next-button"
                    style={{display:'flex'}}
                    onClick={(evt)=>{
                            evt.preventDefault();
                            this.props.setUserNicknameAndGender(this.props.firstLogin.nicknameInput,this.props.firstLogin.gender)
                        }}

                />
            </form>
        )
    }
}


// 設定大頭照
@connect(mapStateToProps, (dispatch) => {
    return {
        getUserAvatarBlob: bindActionCreators(FirstLoginAction.getUserAvatarBlob, dispatch),
        uploadUserAvatar: bindActionCreators(FirstLoginAction.uploadUserAvatar, dispatch),
        setFirstLoginAvatar: bindActionCreators(FirstLoginAction.setFirstLoginAvatar, dispatch),
        goNextStep: bindActionCreators(FirstLoginAction.goNextStep, dispatch)
    }
})
export class Step2 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (this.props.user.get('avatar')) {
            this.props.getUserAvatarBlob(this.props.user.get('avatar'));
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.firstLogin.step !== 2) {
            browserHistory.push('/first-login/step' + nextProps.firstLogin.step);
        }
    }

    onChange(evt) {
        this.props.setFirstLoginAvatar(evt.target.files[0]);
    }

    async crop() {
        let image = await this.refs.crop.cropImage();
        console.log(this.refs.file);
        this.props.uploadUserAvatar(image);
    }

    clear() {
        this.refs.file.value = null;
        this.props.setFirstLoginAvatar(null);
    }

    imageLoaded(img) {
        if (img.naturalWidth && img.naturalHeight) {
            this.crop()
        }
    }

    render() {
        return (
            <div>
                <h4 className="form-input-section__input-label" style={{margin:'10px'}}>設定大頭照</h4>
                <RaisedButton
                    label="選擇照片"
                    labelPosition="before"
                    containerElement="label"
                    fullWidth={true}
                    style={{margin:'5px'}}
                >
                    <input type="file" ref='file' accept="image/jpg, image/png, image/jpeg, image/bmp"
                           style={{cursor: 'pointer',position: 'absolute',top: 0,bottom: 0,right: 0,left: 0,width: '100%',opacity: 0}}
                           onChange={(evt)=>this.onChange(evt)}/>
                </RaisedButton>
                <div className="image-crop-area">
                    {
                        this.props.firstLogin.avatar &&
                        <div className="image-crop-area_cropper">
                            <Cropper
                                ref='crop'
                                //image 只吃File和Blob型態，webURL要轉換
                                image={this.props.firstLogin.avatar}
                                width={400}
                                height={400}
                                onImageLoaded={(evt)=>this.imageLoaded}
                            />
                        </div>
                    }
                </div>
                <RaisedButton
                    label="裁切"
                    labelColor="white"
                    backgroundColor="#a4c639"
                    style={{width: '48%', marginTop: '10px', marginRight:'4%'}}
                    onTouchTap={(evt)=>this.crop()}
                />
                <RaisedButton
                    label="清除"
                    secondary={true}
                    style={{width: '48%', marginTop: '10px'}}
                    onTouchTap={(evt)=>this.clear()}
                />

                <RaisedButton
                    label="下一步"
                    labelColor="white"
                    backgroundColor={Step1Style.RaisedButton.backgroundColor}
                    className="first-login-form__next-button"
                    style={{display:'flex'}}
                    onClick={(evt)=>{
                         evt.preventDefault();
                         this.props.goNextStep(3);
                    }}

                />
            </div>
        )
    }
}

// 設定背景照
@connect(mapStateToProps, (dispatch) => {
    return {
        getUserBgImgBlob: bindActionCreators(FirstLoginAction.getUserBgImgBlob, dispatch),
        uploadUserBgImg: bindActionCreators(FirstLoginAction.uploadUserBgImg, dispatch),
        setFirstLoginBgImg: bindActionCreators(FirstLoginAction.setFirstLoginBgImg, dispatch),
        goNextStep: bindActionCreators(FirstLoginAction.goNextStep, dispatch)
    }
})
export class Step3 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        if (this.props.user.get('bgImg')) {
            this.props.getUserBgImgBlob(this.props.user.get('bgImg'));
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.firstLogin.step !== 3) {
            browserHistory.push('/first-login/step' + nextProps.firstLogin.step);
        }
    }

    onChange(evt) {
        this.props.setFirstLoginBgImg(evt.target.files[0]);
    }

    async crop() {
        let image = await this.refs.crop.cropImage();
        this.props.uploadUserBgImg(image);
    }

    clear() {
        this.refs.file.value = null;
        this.props.setFirstLoginBgImg(null);
    }

    imageLoaded(img) {
        if (img.naturalWidth && img.naturalHeight) {
            this.crop()
        }
    }

    render() {
        return (
            <div>
                <h4 className="form-input-section__input-label" style={{margin:'10px'}}>設定背景照</h4>
                <RaisedButton
                    label="選擇照片"
                    labelPosition="before"
                    containerElement="label"
                    fullWidth={true}
                    style={{margin:'5px'}}
                >
                    <input type="file" ref='file' accept="image/jpg, image/png, image/jpeg, image/bmp"
                           style={{cursor: 'pointer',position: 'absolute',top: 0,bottom: 0,right: 0,left: 0,width: '100%',opacity: 0}}
                           onChange={(evt)=>this.onChange(evt)}/>
                </RaisedButton>
                <div className="image-crop-area">
                    {
                        this.props.firstLogin.bgImg &&
                        <div className="image-crop-area_cropper">
                            <Cropper
                                ref='crop'
                                //image 只吃File和Blob型態，webURL要轉換
                                image={this.props.firstLogin.bgImg}
                                width={400}
                                height={400}
                                onImageLoaded={(evt)=>this.imageLoaded}
                            />
                        </div>
                    }
                </div>
                <RaisedButton
                    label="裁切"
                    labelColor="white"
                    backgroundColor="#a4c639"
                    style={{width: '48%', marginTop: '10px', marginRight:'4%'}}
                    onTouchTap={(evt)=>this.crop()}
                />
                <RaisedButton
                    label="清除"
                    secondary={true}
                    style={{width: '48%', marginTop: '10px'}}
                    onTouchTap={(evt)=>this.clear()}
                />

                <RaisedButton
                    label="下一步"
                    labelColor="white"
                    backgroundColor={Step1Style.RaisedButton.backgroundColor}
                    className="first-login-form__next-button"
                    style={{display:'flex'}}
                    onClick={(evt)=>{
                         evt.preventDefault();
                         this.props.goNextStep(4);
                    }}

                />
            </div>
        )
    }
}


@connect(mapStateToProps, (dispatch) => {
    return {
        getUserData: bindActionCreators(FirstLoginAction.getUserData, dispatch),
        goNextStep: bindActionCreators(FirstLoginAction.goNextStep, dispatch)
    }
})
export class Step4 extends React.Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.props.getUserData(this.props.user.account, this.props.user.token);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.firstLogin.step !== 4) {
            browserHistory.push('/first-login/step' + nextProps.firstLogin.step);
        }
    }

    render() {
        return (
            <div>
                <h3 className="user-info__title">目前的個人資料</h3>
                <h3 className="user-info__title">如果有誤可以至“設定頁”更新</h3>
                <div className="user-info__area">
                    <h4 className="user-info__nickname">{this.props.user.get('nickname')}</h4>
                    <img className="user-info__avatar" src={this.props.user.get('avatar')}/>
                    <img className="user-info__bgImg" src={this.props.user.get('bgImg')}/>
                </div>
                <RaisedButton
                    label="下一步"
                    labelColor="white"
                    backgroundColor={Step1Style.RaisedButton.backgroundColor}
                    className="first-login-form__next-button"
                    style={{display:'flex'}}
                    onClick={(evt)=>{
                         evt.preventDefault();
                         this.props.goNextStep(5);
                    }}

                />
            </div>
        )
    }
}