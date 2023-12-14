import React, { useState, useEffect } from "react"

import Toolbar from './Functions/Toolbar'


import Loader from "./Functions/Loader"
import Images from "./img/Images";

import { 
    View, 
    BackHandler,
    TextInput,
    StyleSheet,
    Modal,
    Text,
    Clipboard,
    Dimensions,
    AppState,
    TouchableOpacity,
    Alert,
    Image
} from 'react-native';
import Api from "./Functions/Api";
import Toast from "./Functions/Toast";
import WebSocketServer from "./Functions/socket";
import {Picker} from '@react-native-picker/picker';

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
    const [modalVisible, setModalVisible] = useState(false);
    const [newPaymentMode, setNewPaymentMode] = useState();
    const [paymentsTypes, setPaymentsTypes] = useState({});

    const socket = WebSocketServer.connect(props.socket_url);

    const api = new Api();
    
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
    const subscribeSocket = (id) => {
        if (socket !== null && !isSubscribed) {
            setIsSubscribed(true);
            socket
            .emit('subscribe', {
                channel: 'pix.' + id,
            })
            .on('pixUpate', (channel, data) => {                
                if(data.is_paid) {
                    alertChange(true);
                }
                if(data.payment_change) {
                    alertChange(false);
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

    useEffect(() => {
        retrievePix(props.callRetrieve, false);
        getPaymentTypes();

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
            if(json.success) {
                subscribeSocket(json.transaction_id);
                setCopyAndPaste(json.copy_and_paste);
                setFormattedValue(json.formatted_value);
                if(json && json.paid) {
                    alertChange(true);
                }
                else if(json && json.payment_changed) {
                    alertChange(false);
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
                if(json.paid) {
                    alertChange(true);
                } else {
                    if(json.formatted_value) {
                        setFormattedValue(json.formatted_value);
                    }
                    Toast.showToast(strings.payment_error);
                }
                console.log("error: ", json);
            }
        })
        .catch((error) => {
            console.log("fail");
            Toast.showToast(strings.payment_error);
            console.error(error.message);
        });
    }

    const alertChange = (isPaid) => {
        unsubscribeSocket(); 
        Alert.alert(
            strings.payment,
            isPaid ? strings.confirmed_payment : strings.payment_changed,
            [
                { text: strings.confirm, onPress: () => props.onPaid(true) }
            ],
            { cancelable: false }
        );
        
    }

    const goBack = () => {
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
                                <Text style={[styles.text2, {textAlign: "center"}]}>{strings.change_payment_mode}</Text>

                                <View style={{alignItems: "center", flex: 1, justifyContent: "center", width: "100%"}}>
                                    <Picker
                                        selectedValue={newPaymentMode}
                                        style={{ width: Dimensions.get('window').width/2, height: 40 }}
                                        onValueChange={(itemValue, itemIndex) => setNewPaymentMode(itemValue)}
                                    >
                                        {paymentsTypes.money ? <Picker.Item label="Dinheiro" value={paymentsTypes.money_code} /> : null}
                                        {paymentsTypes.card ? <Picker.Item label="Cartão" value={paymentsTypes.card_code} /> : null}

                                        {paymentsTypes.direct_pix ? <Picker.Item label="Pix Direto em minha conta" value={paymentsTypes.direct_pix_code} /> : null}
                                        {paymentsTypes.machine ? <Picker.Item label="Maquineta de Cartão" value={paymentsTypes.machine_code} /> : null}
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
            <Loader loading={isLoading} message={strings.loading_message} />
            
          
            <Toolbar
                back={true}
                handlePress={() => goBack() }
            />
            <View style={{ marginTop: -15, alignItems: 'center' }}>
                <Text style={{color: "#363636", fontSize: 20, fontWeight: "bold"}}>{strings.pix_payment}</Text>
            </View>
                    
            {/* Flex vertical of 2/13 */}
            <View style={{flex: 2, marginTop: 10}}>
                <Text style={[styles.text, {textAlign: 'center'}]}>
                    {copyAndPaste ? 
                            strings.pix_info :
                            strings.payment_error 
                    }
                </Text>
            </View>

             {/* Flex vertical of 4/13 */}
            <View style={{flex: 4}}>
                    {copyAndPaste ? 
                        <Text style={[styles.textBold, styles.text, styles.textBlack]}>
                            {strings.pix_code} 
                        </Text>
                        : null
                    }
                <View style={{ marginTop: 10, alignItems: "center"}}>
                    {copyAndPaste ? (
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
                        <Image source={Images.warning} style={styles.imgWarning} />
                    }             
                </View>

                {/*change payment mode modal*/}
                {props.changePayment ? <View style={{flex: 2, alignItems: "center"}}>
                    <Text style={[styles.text, styles.textBlack]}>{strings.pix_problems}</Text>
                    <TouchableOpacity
                        onPress={() =>  setModalVisible(true)} 
                    >
                        <Text style={[styles.text, styles.greenText]}>{strings.change_payment_mode}</Text>
                    </TouchableOpacity>
                </View> : null}
            </View>
            {/* Flex vertical of 4/13 */}
            {copyAndPaste ?
                <View style={{ flex: 4, alignItems: 'center' }}>
                    <View style={styles.yellowCard}>
                        <Text style={[styles.textBold, styles.yellowText]}>{strings.attention}</Text>
                        <Text style={styles.yellowText}>{strings.req_pix_choose_or_code}</Text>
                        <Text style={[{marginBottom: 20}, styles.yellowText]}>{strings.req_pix_info}</Text>
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
    text2: {
        color: 'grey', 
        fontSize: 16, 
        marginHorizontal: 20
    },
});

export default RequestPix;