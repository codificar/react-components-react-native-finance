import React, { useState, useEffect } from "react"

import Toolbar from 'react-native-finance/src/Functions/Toolbar.js'
import TitleHeader from 'react-native-finance/src/Functions/TitleHeader.js'

import { WebView } from 'react-native-webview';
import { NavigationEvents } from "react-navigation";
import { useIsFocused } from "@react-navigation/native";
import Loader from "react-native-finance/src/Functions/Loader.js"

import { 
    View, 
    BackHandler,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Text
} from 'react-native';
import Api from "react-native-finance/src/Functions/Api.js";
import GLOBAL from 'react-native-finance/src/Functions/Global.js';

const AddCardWebView = (props) => {

    //Get the lang from props. If hasn't lang in props, default is pt-BR
    var strings = require('react-native-finance/src/langs/pt-BR.json');
    if(GLOBAL.lang) {
        if(GLOBAL.lang == "pt-BR") {
            strings = require('react-native-finance/src/langs/pt-BR.json');
        } 
        // if is english
        else if(GLOBAL.lang.indexOf("en") != -1) {
            strings = require('react-native-finance/src/langs/en.json');
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

    const getUrl = async () => {

        const requestBody = {
            id: 3,
            provider_id: 3,
            user_id: 3,
            token: "2y10sNDgsa3YoK5uUd0HmQXm4eM32K2Zzu2onVhxBA420F59VSKRIJXUe",
        };
    
        try {
            const response = await fetch('http://192.168.0.16/libs/finance/provider/add_credit_card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',  
                },
                body: JSON.stringify(requestBody),  
            });
            const jsonResponse = await response.json();
            const iframeUrl = jsonResponse.url;
        } catch (error) {
            console.error('Error fetching the URL: ', error);
        }

        var url = iframeUrl;
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