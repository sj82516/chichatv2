import React from "react";
import "../stylesheets/main.scss";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';

import {pageInit} from "../actions/indexAction";

const muiTheme = getMuiTheme({
    appBar: {
        height: 50,
    },
});

function mapStateToProps(state) {
    return {}
}

function mapDispatchToProps(dispatch) {
    return {
        pageInit: bindActionCreators(pageInit, dispatch)
    }
}

@connect(mapStateToProps, mapDispatchToProps)
// app component
export default class App extends React.Component {
    componentWillMount(){
        this.props.pageInit();
    }
    // render
    render() {
        return (
            <MuiThemeProvider className="container" muiTheme={muiTheme}>
                <div>
                    {this.props.children}
                </div>
            </MuiThemeProvider>
        );
    }
}
