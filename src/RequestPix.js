import React, { useRef, useState, useEffect } from "react"

import Images from "./img/Images";

import Loader from "./Functions/Loader"

import { 
    View, 
    Image,
    TextInput,
    StyleSheet,
    Text,
    Clipboard,
    Button,
    AppState,
    Alert
} from 'react-native';
import Api from "./Functions/Api";
import Toast from "./Functions/Toast";
import WebSocketServer from "./Functions/socket";

const RequestPix = (props) => {

    //Get the lang from props. If hasn't lang in props, default is pt-BR
    var strings = require('./langs/pt-BR.json');
    if(props.lang) {
        if(props.lang == "pt-BR") {
            strings = require('./langs/pt-BR.json');
        } 
        // if is english
        else if(props.lang.indexOf("en") != -1) {
            strings = require('./langs/en.json');
        }
    }

    const [isLoading, setIsLoading] = useState(false);
    const [copyAndPaste, setCopyAndPaste] = useState("");
    const [formattedValue, setFormattedValue] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [transactionId, setTransactionId] = useState(0);

    const appState = useRef(AppState.currentState);

    const socket = WebSocketServer.connect(props.socket_url);

    const api = new Api();


    const copyClipBoard = () => {
        Clipboard.setString(copyAndPaste);
        Toast.showToast(strings.copied);
    }

    /**
     * @description  subscribe scoket
     */
     const subscribeSocket = (id) => {
        if (socket !== null && !isSubscribed) {
            setIsSubscribed(true);
            socket
            .emit('subscribe', {
                channel: 'pix.' + id,
            })
            .on('pixUpate', (channel, data) => {
                alertPaid();
            })
        }
    }

    const unsubscribeSocket = () => {
        if (socket != null) {
            socket.emit("unsubscribe", {
                channel: "pix." + transactionId
            });
            socket.disconnect();
            socket.removeAllListeners("pixUpate");
            socket.removeAllListeners("pix");
            socket.removeAllListeners("pix." + transactionId); 
        }
    }

    useEffect(() => {
        retrievePix(props.callRetrieve);
    }, [props.callRetrieve]);

    const retrievePix = (qtd) => {
        api.RetrievePix(
            props.appUrl,
            props.id, 
            props.token, 
            null,
            props.request_id,
            "user" // only user do pix in a request
        )
        .then((json) => {
            //console.log(json);
            if(json.success) {
                setCopyAndPaste(json.copy_and_paste);
                setFormattedValue(json.formatted_value);
                if(json && json.paid) {
                    alertPaid();
                } else {
                    setTransactionId(json.transaction_id);
                    //se for a primeira vez que chama essa api (qtd = 0), entao se inscreve no socket
                    if(qtd == 0) {
                        subscribeSocket(json.transaction_id);
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
        unsubscribeSocket();
        Alert.alert(
            "Pix",
            "O pagamento Pix foi confirmado!",
            [
                { text: "Confirmar", onPress: () => props.onPaid(true) }
            ],
            { cancelable: false }
        );
    }

    return (
        <View style={styles.container}>

            <Loader loading={isLoading} message={strings.loading_message} />
        
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
                    color={props.color ? props.color : "#2ebdaf"}
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
        backgroundColor: "#2ebdaf", //pix logo color
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

export default RequestPix;