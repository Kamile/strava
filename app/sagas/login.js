//redux-saga
import {put, select, call, take} from 'redux-saga/effects'

//router
import {Actions} from 'react-native-router-flux';

//actions
import * as login from '../actions/login';
import * as athlete from '../actions/athlete'

//constants
import * as types from '../constants/actionTypes'

//service
import {fetchToken} from './../services/login'

function* logout(){
    try{
        //1- redirect to login component
        yield call(Actions.login);

    }catch (error){
        throw error;
    }
}

function* authorize(temporary_access_token) {
    try {

        //TODO: use config file to retrieve client id + client secret.
        let formData  = new FormData();
        formData.append('client_id', '15688');
        formData.append('client_secret', '');
        formData.append('code', temporary_access_token);

        //1- convert access-token
        const response = yield call(fetchToken, formData);

        //2- store token
        let token = response.data.access_token;
        yield put(login.getAccessToken(token));

        //3- get athlete details
        let details = response.data.athlete;
        yield put(athlete.getAthleteDetails(details));

        //4- route application
        yield call(Actions.localhost);

        return token;
    }
    catch (error) {
        throw error;
    }
}

export function* authenticationFlowSaga() {
    try {

        while (true) {

            const {temporary_access_token} = yield take(types.GET_TEMPORARY_ACCESS_TOKEN);
            let token = yield call(authorize, temporary_access_token);

            if (token) {
                let userSignedOut;
                while (!userSignedOut) {

                    yield take(types.LOGOUT);
                    userSignedOut = true;
                    token = null;

                    yield call(logout);
                }
            }
        }
    }
    catch (error) {
    }
}