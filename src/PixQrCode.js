import React, { useRef, useState, useEffect } from "react"

import Images from "./img/Images";

import Loader from "./Functions/Loader"

import { 
    View, 
    Image,
    StyleSheet,
    Text,
    AppState,
    Alert
} from 'react-native';
import Api from "./Functions/Api";
import WebSocketServer from "./Functions/socket";

const PixQrCode = (props) => {

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
    const [formattedValue, setFormattedValue] = useState("");
    const [transactionId, setTransactionId] = useState(0);
    const [qrCodeBase64, setQrCodeBase64] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const appState = useRef(AppState.currentState);

    const socket = WebSocketServer.connect(props.socket_url);

    const api = new Api();

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
            props.pix_transaction_id,
            props.request_id,
            "provider" // only provider has qr code screen
        )
        .then((json) => {
            if(json.success) {
                setFormattedValue(json.formatted_value);
                if(json && json.paid) {
                    alertPaid();
                } else {
                    setTransactionId(json.transaction_id);
                    setQrCodeBase64(json.qr_code_base64);
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
            strings.pix,
            strings.confirmed_pix,
            [
                { text: strings.confirm, onPress: () => props.onPaid(true) }
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
                        top: 10,
                        resizeMode: 'contain'
                    }} 
                />
            </View>
            {/* Flex vertical of 2/10 */}
            <View style={{flex: 2, justifyContent: "center" }}>
                <Text style={{color: 'grey', textAlign: "center", fontSize: 16, marginHorizontal: 20}}>{strings.pix_qr_info}</Text>
            </View>

             {/* Flex vertical of 6/10 */}
             <View style={{flex: 6, flexDirection: 'row', alignItems: "center", justifyContent: "center"}}>
                 {qrCodeBase64 ? 
                    <Image
                        source={{ uri: `data:image/png;base64,${qrCodeBase64}`}}
                        style={{ width: "80%", height: "80%", resizeMode: 'contain'}}
                    />
                    :
                    <Text>QR CODE</Text>
                }
            </View>

            {/* Flex vertical of 1/10 */}
            <View style={{flex: 1, justifyContent: 'flex-end', alignItems: "center"}}>
                <Text style={{color: "#222B45",fontSize: 23,fontWeight: "bold"}}>{strings.total}: {formattedValue}</Text>
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

export default PixQrCode;