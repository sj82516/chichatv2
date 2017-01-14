import React from "react";
import "../stylesheets/main.scss";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import FlatButton from 'material-ui/FlatButton';

const muiTheme = getMuiTheme({
    palette: {
        textColor: 'red',
    },
    appBar: {
        height: 50,
    },
});


// app component
export default class App extends React.Component {
    // render
    render() {
        return (
            <MuiThemeProvider className="container" muiTheme={muiTheme}>
                <div>
                    {this.props.children}
                    <FlatButton label="Secondary" secondary={true}/>
                </div>
            </MuiThemeProvider>
        );
    }
}
