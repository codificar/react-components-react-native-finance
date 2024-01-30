import React, { useRef, useState, useEffect } from "react"

import Images from "./img/Images";

import Loader from "./Functions/Loader"
import Toolbar from './Functions/Toolbar'
import Toast from "./Functions/Toast";
import {Picker} from '@react-native-picker/picker';

import { 
    View, 
    Image,
    StyleSheet,
    Text,
    AppState,
    Alert,
    TouchableOpacity,
    Modal,
    Dimensions,
    BackHandler,
    TextInput
} from 'react-native';
import Api from "./Functions/Api";
import WebSocketServer from "./Functions/socket";
import QRCode from "react-native-qrcode-svg";
import Clipboard from "@react-native-clipboard/clipboard";

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
    const [errorPix, setErrorPix] = useState(false);
    const [formattedValue, setFormattedValue] = useState("");
    const [transactionId, setTransactionId] = useState(0);
    const [transactionType, setTransactionType] = useState("");
    const [qrCodeBase64, setQrCodeBase64] = useState("");
    const [copyAndPaste, setCopyAndPaste] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const appState = useRef(AppState.currentState);
    const [modalVisible, setModalVisible] = useState(false);
    const [newPaymentMode, setNewPaymentMode] = useState();
    const [paymentsTypes, setPaymentsTypes] = useState({});

    const socket = WebSocketServer.connect(props.socket_url);

    const [shouldRetrievePix, setShouldRetrievePix] = useState(true);

    const [paymentConfirmed, setPaymentConfirmed] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            console.log(paymentConfirmed, "aquiiii")
            if (paymentConfirmed === false && shouldRetrievePix) {
                retrievePix(false, true);
            }
        }, 20000);
    
        return () => clearInterval(intervalId);
    }, [paymentConfirmed, shouldRetrievePix]);

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
                if(data.is_paid) {
                    alertPaid();
                }
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

    /*
    * Copy a string and show a toast to a user by toast
    */
    const copyClipBoard = () => {
        Clipboard.setString(copyAndPaste);
        Toast.showToast(strings.copied);
    }

    useEffect(() => {
        retrievePix(props.callRetrieve, false);
    }, [props.callRetrieve]);

    const retrievePix = (qtd, showFailMsg) => {
        api.RetrievePix(
            props.appUrl,
            props.id, 
            props.token, 
            props.pix_transaction_id,
            props.request_id,
            "provider"
        )
        .then((json) => {
            if(json.success) {
                setErrorPix(false);
                setFormattedValue(json.formatted_value);
                setCopyAndPaste(json.copy_and_paste);
                if (json && json.paid && !paymentConfirmed) {
                    alertPaid();
                    setPaymentConfirmed(true);
                    setShouldRetrievePix(false);
                } else {
                    setTransactionId(json.transaction_id);
                    if(json.transaction_type) {
                        setTransactionType(json.transaction_type);
                    }
                    setQrCodeBase64(json.qr_code_base64);
                    if(showFailMsg) {
                        Toast.showToast(strings.payment_not_confirmed);
                    }
                    //se for a primeira vez que chama essa api (qtd = 0), entao se inscreve no socket
                    if(qtd == 0) {
                        subscribeSocket(json.transaction_id);
                        getPaymentTypes();
                    }
                }
            } else {
                if(json && json.paid && !paymentConfirmed) {
                    alertPaid();
                    alertChange(true);
                    setPaymentConfirmed(true);
                    setShouldRetrievePix(false);
                } else {
                    if(json.formatted_value) {
                        setFormattedValue(json.formatted_value);
                    }
                    Toast.showToast(strings.payment_error);
                }
                getPaymentTypes();
                setErrorPix(true);
                Toast.showToast(strings.payment_error);
            }
        })
        .catch((error) => {
            getPaymentTypes();
            setErrorPix(true);
            console.log('retrievePix error:', error.message);
            Toast.showToast(strings.payment_error);
        });
    }

    const getPaymentTypes = () => {
        api.getPaymentTypes(
            props.appUrl,
            props.id, 
            props.token,
            props.type
        )
        .then((json) => {
            if(json) {
                //set money as default change payment type
                setPaymentsTypes(json);
                setNewPaymentMode(json.money_code);
            } else {
                console.log("error");
            }
        })
        .catch((error) => {
            console.error(error.message);
        });
    }

    const changePayment = () => {
        setModalVisible(false);
        setIsLoading(true);
        api.changePaymentType(
            props.appUrl,
            props.id, 
            props.token,
            props.request_id,
            newPaymentMode,
            props.type
        )
        .then((json) => {
            setIsLoading(false);

            if(json.success) {
                props.onPaymentChange(json.bill)
            } else {
                console.log("an error as occurred, unable to change payment");
            }
        })
        .catch((error) => {
            setIsLoading(false);
            console.error(error.message);
        });
    }

    const goBack = () => {
        if(transactionType == 'subscription_transaction') {
            return props.navigation.navigate('SubscriptionDetailsScreen',{
                provider: props.providerProfile,
                route: props.appUrl,
                routeAPI: props.API_VERSION,
                routeBack: props.routeBack,
                isContainerPaymentType: props.isContainerPaymentType,
            });             
        }
        Alert.alert(
            strings.exit_app,
            strings.exit_app_msg,
            [
                {
                    text: strings.no,
                    onPress: () => function () { },
                    style: "cancel",
                },
                {
                    text: strings.yes,
                    onPress: () => BackHandler.exitApp(),
                },
            ],
            { cancelable: true }
        );
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

            {/* Modal to change payment mode */}
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    style={{ backgroundColor: '#FBFBFB' }}
                    onRequestClose={() => {
                        Alert.alert("Modal has been closed.");
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <View style={styles.modalView}>

                            <View style={{flex: 5, alignItems: "center"}}>
                                <Text style={[styles.text, {textAlign: "center"}]}>{strings.change_payment_mode}</Text>

                                <View style={{alignItems: "center", flex: 1, justifyContent: "center", width: "100%"}}>
                                    <Picker
                                        selectedValue={newPaymentMode}
                                        style={{ width: Dimensions.get('window').width/2, height: 40 }}
                                        onValueChange={(itemValue, itemIndex) => setNewPaymentMode(itemValue)}
                                    >
                                        {paymentsTypes.money ? <Picker.Item label="Dinheiro" value={paymentsTypes.money_code} /> : null}
                                        {paymentsTypes.card ? <Picker.Item label="Cartão" value={paymentsTypes.card_code} /> : null}

                                        {paymentsTypes.direct_pix ? <Picker.Item label="Pix Direto em minha conta" value={paymentsTypes.direct_pix_code} /> : null}
                                        {paymentsTypes.machine ? <Picker.Item label="Maquineta de cartão" value={paymentsTypes.machine_code} /> : null}
                                    </Picker>
                                </View>
                                
                            </View>

                            <View style={{flex: 1, flexDirection:"row", justifyContent: 'flex-end'}}>
                                <TouchableOpacity
                                    onPress={() =>  setModalVisible(!modalVisible)}
                                    style={{justifyContent: 'flex-end'}}
                                >
                                    <Text style={[styles.text, styles.greenText]}>{strings.cancel}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => changePayment()}
                                    style={{justifyContent: 'flex-end'}}
                                >
                                    <Text style={[styles.text, styles.greenText]}>{strings.confirm}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>

            <Toolbar
                back={true}
                handlePress={() => goBack() }
            />
            <View style={{ marginTop: -15, alignItems: 'center' }}>
                <Text style={{color: "#363636", fontSize: 20, fontWeight: "bold"}}>{strings.pix_payment}</Text>
            </View>

            <Loader loading={isLoading} message={strings.loading_message} />


            {/* Flex vertical of 2/15 */}
            <View style={{flex: 2, marginTop: 15 }}>
                <Text style={{color: 'grey', textAlign: 'center', fontSize: 16, marginHorizontal: 20}}>
                    {qrCodeBase64 && !errorPix 
                        ? strings.pix_qr_info 
                        : strings.payment_error
                    }
                </Text>
            </View>

             {/* Flex vertical of 7/15 */}
             <View 
                style={{
                    flex: 7, 
                    marginTop: 20,
                    marginBottom: 20,
                    padding: 10,  
                    flexDirection: 'column', 
                    alignItems: "center", 
                    justifyContent: "center"
                }}>
                {errorPix 
                    ? <Image source={Images.warning} style={styles.imgWarning} />
                    : null 
                }
                { qrCodeBase64 && !errorPix
                    ? <QRCode value={qrCodeBase64} size={250} /> 
                    : null  
                }
                {copyAndPaste 
                    && transactionType == 'subscription_transaction' 
                    && !errorPix ? (<>
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
                    </>) : null
                    } 
            </View>

            {/* Flex vertical of 2/15 */}
            <View style={{flex: 2, alignItems: "center"}}>
                <Text style={[styles.text, styles.textBlack, {paddingTop: 10}]}>{strings.payment_made}</Text>
                <TouchableOpacity
                    onPress={() =>  retrievePix(false, true)} 
                >
                    <Text style={[styles.text, styles.greenText]}>{strings.check_payment}</Text>
                </TouchableOpacity>
            </View>

             {/* Flex vertical of 2/15 */}
             { props.request_id && props.changePayment && (
                <View style={{flex: 2, alignItems: "center"}}>
                    <Text style={[styles.text, styles.textBlack]}>{strings.pix_problems}</Text>
                    <TouchableOpacity
                        onPress={() =>  setModalVisible(true)} 
                    >
                        <Text style={[styles.text, styles.greenText]}>{strings.change_payment_mode}</Text>
                    </TouchableOpacity>
                </View>)
             }

            {/* Flex vertical of 2/15 */}
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
    valueText: {
        color: '#808080', 
        fontSize: 20,
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
    modalView: {
        margin: 5,
        width: "60%",
        height: "40%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: "5%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
    },
    input: {
        borderColor: "#adadad",
        width: "90%",
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
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
});

export default PixQrCode;