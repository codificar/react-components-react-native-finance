import React, { useRef, useState, useEffect } from "react"

import Toolbar from './Functions/Toolbar'

import { NavigationEvents } from "react-navigation";
import { useIsFocused } from "@react-navigation/native";

import Loader from "./Functions/Loader"
import Images from "./img/Images";

import { 
    View, 
    BackHandler,
    TextInput,
    StyleSheet,
    Text,
    Clipboard,
    AppState,
    TouchableOpacity,
    Alert,
    Image
} from 'react-native';
import Api from "./Functions/Api";
import GLOBAL from './Functions/Global.js';
import Toast from "./Functions/Toast";
import WebSocketServer from "./Functions/socket";

const PixScreen = (props) => {

    GLOBAL.lang = GLOBAL.lang ? GLOBAL.lang : props.lang;
    GLOBAL.color = GLOBAL.color ? GLOBAL.color : props.PrimaryButton;
    GLOBAL.navigation_v5 = GLOBAL.navigation_v5 ? GLOBAL.navigation_v5 : props.navigation_v5;
    GLOBAL.appUrl = GLOBAL.appUrl ? GLOBAL.appUrl : props.appUrl;
    GLOBAL.id = GLOBAL.id ? GLOBAL.id : props.id;
    GLOBAL.token = GLOBAL.token ? GLOBAL.token : props.token;
    GLOBAL.type = GLOBAL.type ? GLOBAL.type : props.type;
    GLOBAL.socket_url = GLOBAL.socket_url ? GLOBAL.socket_url : props.socket_url;

    //Get the lang from props. If hasn't lang in props, default is pt-BR
    var strings = require('./langs/pt-BR.json');
    if(GLOBAL.lang) {
        if(GLOBAL.lang == "pt-BR") {
            strings = require('./langs/pt-BR.json');
        }
        else if(GLOBAL.lang == ("es-PY")) {
            strings = require('./langs/es-PY.json');
          }
        // if is english
        else if(GLOBAL.lang.indexOf("en") != -1) {
            strings = require('./langs/en.json');
        }
    }

    const [isLoading, setIsLoading] = useState(false);
    const [errorPix, setErrorPix] = useState(false);
    const [copyAndPaste, setCopyAndPaste] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    let socket = null;
    if(GLOBAL.socket_url != undefined ) {
        socket = WebSocketServer.connect(GLOBAL.socket_url);
    }

    const api = new Api();
    
    // caso a o react navigation seja v5, entao usa isso ao inves do onWillFocus
    if(GLOBAL.navigation_v5) {
        const isVisible = useIsFocused();
        useEffect(() => {
            if(isVisible) {
                retrievePix(true, false);
            }
        }, [isVisible]);
    }

   
    useEffect(() => {
        const backAction = () => {
            goBack();
            return true;
        };
        
        const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
        );
        
        return () => backHandler.remove();
    }, []);
    
    
    // caso saia do app e volte depois, pode ser q o pagamento foi confirmado mas o usuario nao viu, entao chama api para verificar
    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
          if (appState.current.match(/inactive|background/) && nextAppState === "active") {
            retrievePix(false, false);
          }
          appState.current = nextAppState;
          setAppStateVisible(appState.current);
        });
        return () => {
            if(subscription) {
                subscription.remove();
            }
        };
    }, []);

    /*
    * Copy a string and show a toast to a user by toast
    */
    const copyClipBoard = () => {
        Clipboard.setString(copyAndPaste);
        Toast.showToast(strings.copied);
    }

    /**
     * @description  subscribe scoket
     */
    const subscribeSocket = () => {
        if (socket !== null && !isSubscribed) {
            setIsSubscribed(true);
            socket
            .emit('subscribe', {
                channel: 'pix.' + GLOBAL.pix_transaction_id,
            })
            .on('pixUpate', (channel, data) => {
                alertPaid();
            })
        }
    }

    const unsubscribeSocket = () => {
        if (socket != null) {
            socket.emit("unsubscribe", {
                channel: "pix." + GLOBAL.pix_transaction_id
            });
            socket.disconnect();
            socket.removeAllListeners("pixUpate");
            socket.removeAllListeners("pix");
            socket.removeAllListeners("pix." + GLOBAL.pix_transaction_id); 
        }
    }

    const retrievePix = (subSocket, showFailMsg) => {
        api.RetrievePix(
            GLOBAL.appUrl,
            GLOBAL.id, 
            GLOBAL.token, 
            GLOBAL.pix_transaction_id,
            null,
            GLOBAL.type
        )
        .then((json) => {
            console.log(json);
            if(json.success) {
                setErrorPix(false);
                setCopyAndPaste(json.copy_and_paste);
                setFormattedValue(json.formatted_value);
                if(json && json.paid) {
                    alertPaid();
                } else {
                    if(showFailMsg) {
                        Toast.showToast(strings.payment_not_confirmed);
                    }
                    GLOBAL.pix_transaction_id = json.transaction_id;
                    if(subSocket) {
                        subscribeSocket();
                    }
                }
            } else {
                setErrorPix(true);
                GLOBAL.pix_transaction_id = json.transaction_id;
                setFormattedValue(json.formatted_value);
                Toast.showToast(strings.payment_error);
            }
        })
        .catch((error) => {
            Toast.showToast(strings.payment_error);
            setErrorPix(true);
            console.log("fail");
            console.error(error);
        });
    }

    const alertPaid = () => {
        unsubscribeSocket(); 
        Alert.alert(
            strings.pix,
            strings.confirmed_pix,
            [
                { text: strings.confirm, onPress: () => goBack() }
            ],
            { cancelable: false }
        );
        
    }

    const goBack = () => {
        GLOBAL.pix_transaction_id = null;
        props.navigation.goBack()
    }

    return (
        <View style={styles.container}>
            {!GLOBAL.navigation_v5 ? (
                <NavigationEvents
                    onWillFocus={() => {
                        retrievePix(true, false);
                    }}
                />
            ) : null}
            <Loader loading={isLoading} message={strings.loading_message} />
            
          
            <Toolbar
                back={true}
                handlePress={() => goBack() }
            />
            <View style={{ marginTop: -15, alignItems: 'center' }}>
                <Text style={{color: "#363636", fontSize: 20, fontWeight: "bold"}}>{strings.pix_payment}</Text>
            </View>

            {/* Flex vertical of 2/13 */}
            <View style={{flex: 2, marginTop: 10 }}>
                <Text style={styles.text}>{strings.pix_info}</Text>
            </View>

             {/* Flex vertical of 4/13 */}
            <View style={{flex: 4}}>
                <Text style={[styles.textBold, styles.text, styles.textBlack, {textAlign: 'center'}]}>
                    {copyAndPaste && !errorPix ? 
                        strings.pix_code :
                        strings.payment_error 
                    }
                </Text>
                <View style={{ marginTop: 10, alignItems: "center"}}>

                    {errorPix
                        ? <Image source={Images.warning} style={styles.imgWarning} /> 
                        : null
                    }
                    {copyAndPaste && !errorPix ? (
                        <>
                    <TextInput
                        style={styles.input}
                        selectTextOnFocus={true}
                        showSoftInputOnFocus={false} 
                        value={copyAndPaste}
                    />

                    <TouchableOpacity
                        style={styles.buttonStyle}
                        onPress={() =>  copyClipBoard()} 
                    >
                        <Text style={[styles.greenText, {fontSize: 16, fontWeight: "bold", textAlign: "center" }]}>{strings.copy_pix}</Text>
                    </TouchableOpacity>
                    </>
                    ) : 
                    null
                    }             
                </View>
            </View>

            {/* Flex vertical of 4/13 */}
            {copyAndPaste && !errorPix ?
                <View style={{ flex: 4, alignItems: 'center' }}>
                    <View style={styles.yellowCard}>
                        <Text style={[styles.textBold, styles.yellowText]}>{strings.attention}</Text>
                        <Text style={styles.yellowText}>{strings.pix_info_2}</Text>
                        <Text style={[{marginBottom: 20}, styles.yellowText]}>{strings.pix_info_3}</Text>
                    </View>
                </View>
            : null}

            {/* Flex vertical of 1/13 */}
            <View style={{flex: 1, alignItems: "center"}}>
                <Text style={[styles.text, styles.textBlack]}>{strings.payment_made}</Text>
                <TouchableOpacity
                    onPress={() =>  retrievePix(false, true)} 
                >
                    <Text style={[styles.text, styles.greenText]}>{strings.check_payment}</Text>
                </TouchableOpacity>
            </View>

            {/* Flex vertical of 2/13 */}
            <View style={{flex: 2, alignItems: "center"}}>
                <View style={styles.hr}/>

                <View style={{flexDirection: 'row', width: '90%', justifyContent: 'space-between'}}>
                    <Text style={styles.valueText}>{strings.total}</Text>
                    <Text style={[styles.valueText, styles.textBold]}>{formattedValue}</Text>
                </View>
                
                <View style={styles.hr}/>
            </View>

        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 0,
        backgroundColor: "white"
    },
    text: {
        color: 'grey', 
        fontSize: 16, 
        marginHorizontal: 20
    },
    textBold: {
        fontWeight: "bold"
    },
    textBlack: {
        color: 'black'
    },
    input: {
        borderColor: "#adadad",
        width: "90%",
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    buttonStyle: {
        borderColor: "white",
        backgroundColor: '#f0f8f3',
        width: "90%",
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
        marginTop: 10,
    },
    yellowCard: {
        width: "90%",
        backgroundColor: "#fefaed"
    },
    valueText: {
        color: '#808080', 
        fontSize: 20,
    },
    yellowText: {
        color: '#F2994A', 
        fontSize: 16, 
        marginHorizontal: 20,
        marginTop: 8
    },
    greenText: {
        color: '#6EB986'
    },
    hr: {
        backgroundColor: '#e3e3e3', 
        height: 1, 
        width: "90%",
        marginVertical: 10
    },
    imgWarning: {
        width: 130, 
        height: 130, 
        resizeMode: 'contain'
    },
});

export default PixScreen;