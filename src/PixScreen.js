import React, { useRef, useState, useEffect } from "react"

import Toolbar from './Functions/Toolbar'

import { NavigationEvents } from "react-navigation";
import { useIsFocused } from "@react-navigation/native";

import Images from "./img/Images";

import Loader from "./Functions/Loader"

import { 
    View, 
    Image,
    BackHandler,
    TextInput,
    StyleSheet,
    Text,
    Clipboard,
    Button,
    AppState,
    Alert
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

    const [isLoading, setIsLoading] = useState(false);
    const [copyAndPaste, setCopyAndPaste] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [callAlertPaid, setCallAlertPaid] = useState(true);

    const appState = useRef(AppState.currentState);
    const [appStateVisible, setAppStateVisible] = useState(appState.current);

    const socket = WebSocketServer.connect('https://dev3.motoristaprivado.com.br:8003');

    const api = new Api();
    
    // caso a o react navigation seja v5, entao usa isso ao inves do onWillFocus
    if(GLOBAL.navigation_v5) {
        const isVisible = useIsFocused();
        useEffect(() => {
            if(isVisible) {
                retrievePix(true);
            }
        }, [isVisible]);
    }

    // if is from request, so can't go back
    if(!props.is_request) {
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
    }
    
    // caso saia do app e volte depois, pode ser q o pagamento foi confirmado mas o usuario nao viu, entao chama api para verificar
    useEffect(() => {
        const subscription = AppState.addEventListener("change", nextAppState => {
          if (appState.current.match(/inactive|background/) && nextAppState === "active") {
            retrievePix(false);
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
        }
    }

    const retrievePix = (subSocket) => {
        api.RetrievePix(
            GLOBAL.appUrl,
            GLOBAL.id, 
            GLOBAL.token, 
            GLOBAL.pix_transaction_id,
            props.request_id,
            GLOBAL.type
        )
        .then((json) => {
            //console.log(json);
            if(json.success) {
                setCopyAndPaste(json.copy_and_paste);
                setFormattedValue(json.formatted_value);
                if(json && json.paid) {
                    alertPaid();
                } else {
                    GLOBAL.pix_transaction_id = json.transaction_id;
                    if(subSocket) {
                        subscribeSocket();
                    }
                }
            } else {
                console.log("error");
            }
        })
        .catch((error) => {
            console.log("fail");

            console.error(error);
        });
    }

    const alertPaid = () => {
        if(callAlertPaid) {
            setCallAlertPaid(false);
            Alert.alert(
                "Pix",
                "O seu pagamento Pix foi confirmado!",
                [
                    { text: "Confirmar", onPress: () => props.is_request ? props.onPaid(true) : goBack() }
                ],
                { cancelable: false }
            );
        }
        
    }

    // Quando for sair da tela, chama o unsubscribeSocket
    const goBack = () => {
        GLOBAL.pix_transaction_id = null;
        unsubscribeSocket(); 
        props.navigation.goBack()
    }

    return (
        <View style={styles.container}>
            {!GLOBAL.navigation_v5 ? (
                <NavigationEvents
                    onWillFocus={() => {
                        retrievePix(true);
                    }}
                />
            ) : null}
            <Loader loading={isLoading} message={strings.loading_message} />
            
            {/* if is from request, so can't go back */}
            {!props.is_request ?
                <Toolbar
                    back={true}
                    handlePress={() => goBack() }
                />
            : null }
        
             {/* Flex vertical of 1/10 */}
            <View style={{flex: 1}}>
                <Image source={Images.icon_pix_bc}
                    style={{
                        flex: 1,
                        width: null,
                        height: null,
                        resizeMode: 'contain'
                    }} 
                />
            </View>
            {/* Flex vertical of 2/10 */}
            <View style={{flex: 2, justifyContent: "center" }}>
                <Text style={{color: 'grey', textAlign: "center", fontSize: 16, marginHorizontal: 20}}>Pague com Pix em qualquer dia e a qualquer hora! O pagamento é instantâneo, prático e pode ser feito em poucos segundos. É rápido e seguro.</Text>
            </View>

             {/* Flex vertical of 1/10 */}
             <View style={{flex: 1, flexDirection: 'row', alignItems: "center"}}>
                <Text style={styles.circle}>1</Text>
                <Text style={styles.text}>Copie o código</Text>
            </View>

            {/* Flex vertical of 2/10 */}
            <View style={{flex: 2, alignItems: "center", alignItems: "center"}}>
                <TextInput
                    style={styles.input}
                    selectTextOnFocus={true}
                    showSoftInputOnFocus={false} 
                    value={copyAndPaste}
                />
                <Button
                    onPress={() => copyClipBoard()}
                    title="Copiar Pix"
                    color={GLOBAL.color ? GLOBAL.color : "#2ebdaf"}
                />
                
            </View>
             {/* Flex vertical of 1/10 */}
             <View style={{flex: 1, flexDirection: 'row', alignItems: "center"}}>
                <Text style={styles.circle}>2</Text>
                <Text style={styles.text}>Abra o app do seu banco e escolha Pix Copia e Cola</Text>
            </View>

             {/* Flex vertical of 1/10 */}
             <View style={{flex: 1, flexDirection: 'row', alignItems: "center"}}>
                <Text style={styles.circle}>3</Text>
                <Text style={styles.text}>Cole o código, confira as informações e finalize a compra</Text>
            </View>

            {/* Flex vertical of 1/10 */}
            <View style={{flex: 1, justifyContent: 'flex-end', alignItems: "center"}}>
                <Text style={{color: "#222B45",fontSize: 23,fontWeight: "bold"}}>Total: {formattedValue}</Text>
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
    main: {
        marginBottom: 20,
        marginLeft: 30
    },
    title: {
        color: "#222B45",
        fontSize: 30,
        fontWeight: "bold"
    },
    text: {
        color: 'grey', 
        fontSize: 17,
        marginHorizontal: 6, 
        flexShrink: 1
    },
    circle: {
        width: 36,
        height: 36,
        borderRadius: 36/2,
        fontSize: 20,
        marginLeft: 20,
        backgroundColor: GLOBAL.color ? GLOBAL.color : "#2ebdaf",
        color: "white",
        textAlign: "center",
        paddingTop: 3,
        fontWeight: "bold"
    },
    input: {
        borderColor: "gray",
        width: "70%",
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10
    },
    buttonStyle: {
        flex: 1,
        backgroundColor: 'black',
        marginLeft: 5,
        marginRight: 5,
        borderRadius: 50
    },
});

export default PixScreen;