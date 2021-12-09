import React, { useState, useEffect } from "react"

import Toolbar from './Functions/Toolbar'


import Loader from "./Functions/Loader"

import { 
    View, 
    BackHandler,
    TextInput,
    StyleSheet,
    Text,
    Clipboard,
    AppState,
    TouchableOpacity,
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
        retrievePix(props.callRetrieve, false);
    }, [props.callRetrieve]);

    const retrievePix = (qtd, showFailMsg) => {
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
                    if(showFailMsg) {
                        Toast.showToast(strings.payment_not_confirmed);
                    }
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

    const goBack = () => {
        props.navigation.goBack()
    }

    return (
        <View style={styles.container}>
            
            <Loader loading={isLoading} message={strings.loading_message} />
            
          
            <Toolbar
                back={true}
                handlePress={() => goBack() }
            />
            <View style={{ marginTop: -15, alignItems: 'center' }}>
                <Text style={{color: "#222B45", fontSize: 20, fontWeight: "bold"}}>{strings.pix_payment}</Text>
            </View>

            {/* Flex vertical of 2/13 */}
            <View style={{flex: 2, marginTop: 10 }}>
                <Text style={styles.text}>{strings.pix_info}</Text>
            </View>

             {/* Flex vertical of 4/13 */}
            <View style={{flex: 4}}>
                <Text style={[styles.textBold, styles.text, styles.textBlack]}>{strings.pix_info_1}</Text>
                <View style={{ marginTop: 10, alignItems: "center"}}>
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
                                     
                </View>
            </View>

            {/* Flex vertical of 4/13 */}
            <View style={{ flex: 4, alignItems: 'center' }}>
                <View style={styles.yellowCard}>
                    <Text style={[styles.textBold, styles.yellowText]}>{strings.attention}</Text>
                    <Text style={styles.yellowText}>{strings.req_pix_info_2}</Text>
                    <Text style={[{marginBottom: 20}, styles.yellowText]}>{strings.req_pix_info_3}</Text>
                </View>
            </View>

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
    }
});

export default RequestPix;