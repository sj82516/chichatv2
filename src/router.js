import React from "react";
import {Router, Route, IndexRoute} from "react-router";
import {history} from "./store.js";
import App from "./components/App";
import IndexForm from "./components/index/IndexForm";
import {FirstLogin, Step1, Step2, Step3, Step4} from "./components/index/FirstLogin";
import Main from "./components/main/Main";
import NotFound from "./components/NotFound";

// build the router
const router = (
    <Router onUpdate={() => window.scrollTo(0, 0)} history={history}>
        <Route path="/" component={App}>
            <IndexRoute component={IndexForm}/>
            <Route path="/firstLogin" component={FirstLogin}>
                <IndexRoute component={Step1}/>
                <Route path="/firstLogin/step1" component={Step1}/>
                <Route path="/firstLogin/step2" component={Step2}/>
                <Route path="/firstLogin/step3" component={Step3}/>
                <Route path="/firstLogin/step4" component={Step4}/>
            </Route>
            <Route path="/main" component={Main}/>
            <Route path="*" component={NotFound}/>
        </Route>
    </Router>
);

// export
export {router};
