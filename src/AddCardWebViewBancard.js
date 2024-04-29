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

const AddCardWebViewBancard = (props) => {

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

    const getUrl = () => {
        setIsLoading(true); 
    
        const {appUrl, id, token, type} = props.navigation.state.params
            GLOBAL.appUrl = GLOBAL.appUrl || appUrl,
            GLOBAL.id = GLOBAL.id || id,
            GLOBAL.token = GLOBAL.token || token,
            GLOBAL.type = GLOBAL.type || type,

        api.AddCardBancard(
            GLOBAL.appUrl,
            GLOBAL.id,
            GLOBAL.token,
            GLOBAL.type,
                 
        ).then(response => {
            setIsLoading(false); 
            if (response.success) {
                var url = GLOBAL.appUrl + "/libs/gateways/bancard/iframe_card/" + response.process_id;
                setWebviewUrl(url); 
            } else {
                alert('Erro ao obter a URL: ' + response.message);
            }
        }).catch(error => {
            setIsLoading(false);  
            alert('Erro na API: ' + error.message);
        });
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

export default AddCardWebViewBancard;