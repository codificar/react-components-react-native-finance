import React, { useState, useEffect } from "react"

import Toolbar from './Functions/Toolbar'
import TitleHeader from './Functions/TitleHeader'

import { WebView } from 'react-native-webview';
import { NavigationEvents } from "react-navigation";
import { useIsFocused } from "@react-navigation/native";
import Loader from "./Functions/Loader"

import { 
    View, 
    BackHandler,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Text
} from 'react-native';
import Api from "./Functions/Api";
import GLOBAL from './Functions/Global.js';

const AddCardWebView = (props) => {

    //Get the lang from props. If hasn't lang in props, default is pt-BR
    var strings = require('./langs/pt-BR.json');
    if(GLOBAL.lang) {
        if(GLOBAL.lang == "pt-BR") {
            strings = require('./langs/pt-BR.json');
        } 
        // if is english
        else if(GLOBAL.lang.indexOf("en") != -1) {
            strings = require('./langs/en.json');
        }
    }

    const [webviewUrl, setWebviewUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const api = new Api();

    if(GLOBAL.navigation_v5) {
        const isVisible = useIsFocused();
        useEffect(() => {
            if(isVisible) {
                getUrl();
            }
        }, [isVisible]);
    }

    const getUrl = () => {
        var url = GLOBAL.appUrl + "/libs/gateways/juno/add_card";
        url += "?holder_type=user";
        url += "&holder_id=" + GLOBAL.id;
        url += "&holder_token=" + GLOBAL.token;
        setWebviewUrl(url);
    }

    return (
        <View style={styles.container}>
            {!GLOBAL.navigation_v5 ? (
                <NavigationEvents
                    onWillFocus={() => {
                        getUrl();
                    }}
                />
            ) : null}

            <Loader loading={isLoading} message={strings.loading_message} />
            
            <Toolbar
                back={true}
                handlePress={() => props.navigation.goBack()}
            />
            <View style={styles.container}>
                {webviewUrl ? (
                <WebView
                    automaticallyAdjustContentInsets={false}
                    scalesPageToFit={false}
                    javaScriptEnabled
                    source={{ uri: webviewUrl }}
                    onLoad={() => setIsLoading(false)}
                    onNavigationStateChange={(event) => {
                        //check if url is diff of original url (card is added)
                        //quando troca de url significa que o cartao foi adicionado.
                        if(webviewUrl != event.url && !event.loading) {
                            props.navigation.goBack();
                        }
                    }} 
                />
                ) : null}
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: "white"
    }
});

export default AddCardWebView;