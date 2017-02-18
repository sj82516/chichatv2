import React from "react";
import {RaisedButton, TextField, FontIcon} from 'material-ui';
import CommonStyle from "./../common/CommonStyle";
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import * as indexAction from "../../actions/indexAction";

require('./IndexForm.scss');

// Index Form component
export default class IndexForm extends React.Component {

    // render
    render() {
        return (
            <div className="index-form">
                <figure className="index__logo">
                    <img src="/media/logo.png" title="Chichat Logo" alt="Chichat Logo" className="index__logo-image"/>
                </figure>
                <Form/>
            </div>
        );
    }
}

const FormStyle = {
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
        socialBtn: {
            width: '30%',
            minWidth: '30px',
            fontSize: CommonStyle.mid_font,
            color: 'white',
            backgroundColor: CommonStyle.dark_brwon,
        },
        submitBtn: {
            backgroundColor: CommonStyle.light_yellow,
            borderRadius: '5px 5px 40px 40px',
            width: '100%'
        }
    }
}


function mapStateToProps(state) {
    return {indexForm: state.indexForm}
}

function mapDispatchToProps(dispatch) {
    return {
        setIndexFormType: bindActionCreators(indexAction.setIndexFormType, dispatch),
        accountInputValidate: bindActionCreators(indexAction.accountInputValidate, dispatch),
        passwordInputValidate: bindActionCreators(indexAction.passwordInputValidate, dispatch),
        loginByAccount: bindActionCreators(indexAction.loginByAccount, dispatch),
        signupByAccount: bindActionCreators(indexAction.signupByAccount, dispatch),
    }
}

@connect(mapStateToProps, mapDispatchToProps)
class Form extends React.Component {
    constructor(props) {
        super(props);
    }

    // OAUTH2頁面重導
    redirectToOauth(type) {
        window.location.href = "/auth/" + type;
    }

    render() {
        return (
            <div className="index-form-wrapper">
                <form>
                    <p className="form-type">
                        <span
                            className={`form-type__btn ${this.props.indexForm.get('formType')?'form-type__btn_unclicked':'form-type__btn_clicked'}`}
                            onClick={()=> this.props.setIndexFormType(true)}>登入</span> /
                        <span
                            className={`form-type__btn ${this.props.indexForm.get('formType')?'form-type__btn_clicked':'form-type__btn_unclicked'}`}
                            onClick={()=> this.props.setIndexFormType(false)}>註冊</span>
                    </p>
                    <TextField
                        style={FormStyle.TextField.textField}
                        hintText="輸入常用信箱當作帳號"
                        type="text"
                        errorText={this.props.indexForm.get('accountInputValidationErr')}
                        inputStyle={FormStyle.TextField.input}
                        fullWidth={true}
                        floatingLabelText="帳號"
                        floatingLabelStyle={FormStyle.TextField.floatingLabel}
                        floatingLabelFixed={true}
                        underlineFocusStyle={FormStyle.TextField.underlineFocus}

                        onChange={(event, newValue) => this.props.accountInputValidate(newValue)}
                    />
                    <TextField
                        style={FormStyle.TextField.textField}
                        hintText="6~12個英文與數字混合字串"
                        type="password"
                        errorText={this.props.indexForm.get('passwordInputValidationErr')}
                        fullWidth={true}
                        inputStyle={FormStyle.TextField.input}
                        floatingLabelText="密碼"
                        floatingLabelStyle={FormStyle.TextField.floatingLabel}
                        floatingLabelFixed={true}

                        underlineFocusStyle={FormStyle.TextField.underlineFocus}

                        onChange={(event, newValue) => this.props.passwordInputValidate(newValue)}
                    />
                    <p className="form-seperate-line">或是以社群帳號登入</p>
                    <div className="social-media-buttons">
                        <RaisedButton
                            target="_blank"
                            label="GH"
                            labelStyle={{paddingRight:0, verticalAlign: 'top'}}
                            labelColor="white"
                            backgroundColor={CommonStyle.dark_brwon}
                            style={FormStyle.RaisedButton.socialBtn}
                            icon={<i className="fa fa-github-alt" style={{margin:0, verticalAlign: 'baseline'}}></i>}
                            onTouchTap={(evt)=>{
                                            evt.preventDefault();
                                            this.redirectToOauth('github');
                                        }}
                        />
                        <RaisedButton
                            target="_blank"
                            label="FB"
                            labelStyle={{paddingRight:0, verticalAlign: 'top'}}
                            labelColor="white"
                            backgroundColor={CommonStyle.dark_brwon}
                            style={FormStyle.RaisedButton.socialBtn}
                            icon={<i className="fa fa-facebook-official" style={{margin:0, verticalAlign: 'baseline'}}></i>}
                            onTouchTap={(evt)=>{
                                            evt.preventDefault();
                                            this.redirectToOauth('facebook');
                                        }}
                        />
                        <RaisedButton
                            target="_blank"
                            label="G+"
                            labelStyle={{paddingRight:0, verticalAlign: 'top'}}
                            labelColor="white"
                            backgroundColor={CommonStyle.dark_brwon}
                            style={FormStyle.RaisedButton.socialBtn}
                            icon={<i className="fa fa-google-plus-square" style={{margin:0, verticalAlign: 'baseline'}}></i>}
                            onTouchTap={(evt)=>{
                                            evt.preventDefault();
                                            this.redirectToOauth('google');
                                        }}
                        />
                    </div>
                    <RaisedButton
                        label="送出"
                        labelColor="white"
                        fullWidth={true}
                        style={FormStyle.RaisedButton.submitBtn}
                        buttonStyle={FormStyle.RaisedButton.submitBtn}
                        backgroundColor={CommonStyle.dark_brwon}
                        className="form-submit-button"

                        disabled={
                            !(this.props.indexForm.get('accountInputValidation') && this.props.indexForm.get('passwordInputValidation'))
                        }
                        onClick={(evt)=>{
                                    evt.preventDefault();
                                    return this.props.indexForm.get('formType')?
                                        this.props.loginByAccount(this.props.indexForm.get('accountInput'), this.props.indexForm.get('passwordInput')):
                                        this.props.signupByAccount(this.props.indexForm.get('accountInput'), this.props.indexForm.get('passwordInput'))
                                }}
                    />
                </form>
            </div>
        )
    }
}
