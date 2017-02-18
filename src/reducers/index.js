import {combineReducers} from "redux";
import {routerReducer} from "react-router-redux";
import {reducer as formReducer} from "redux-form";
import {userReducer} from "./userReducer";
import {indexReducer} from './indexReducer';
import {mainReducer} from './mainReducer'
import {firstLoginReducer} from './firstLoginReducer';

// main reducers
export const reducers = combineReducers({
    routing: routerReducer,
    user: userReducer,
    indexForm: indexReducer,
    main: mainReducer,
    firstLogin:firstLoginReducer
    // your reducer here
});
