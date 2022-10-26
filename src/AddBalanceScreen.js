import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    TextInput,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    Alert,
    Modal,
    Linking,
    Clipboard
} from "react-native";
const listWidth = Dimensions.get('window').width - 60;

import GLOBAL from './Functions/Global.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import Images from "./img/Images";
import Api from "./Functions/Api";
import Loader from "./Functions/Loader"
import { NavigationEvents } from "react-navigation";

import { useIsFocused } from "@react-navigation/native";

import Toast from "./Functions/Toast";

const AddBalanceScreen = (props) => {

    const arrayIconsType = {};
    arrayIconsType["visa"] = Images.icon_ub_creditcard_visa;
    arrayIconsType["mastercard"] = Images.icon_ub_creditcard_mastercard;
    arrayIconsType["master"] = Images.icon_ub_creditcard_mastercard;
    arrayIconsType["amex"] = Images.icon_ub_creditcard_amex;
    arrayIconsType["diners"] = Images.icon_ub_creditcard_diners;
    arrayIconsType["discover"] = Images.icon_ub_creditcard_discover;
    arrayIconsType["jcb"] = Images.icon_ub_creditcard_jcb;
    arrayIconsType["terracard"] = Images.terra_card;

    GLOBAL.lang = GLOBAL.lang ? GLOBAL.lang : props.lang;
    GLOBAL.color = GLOBAL.color ? GLOBAL.color : props.PrimaryButton;
    GLOBAL.navigation_v5 = GLOBAL.navigation_v5 ? GLOBAL.navigation_v5 : props.navigation_v5;

    GLOBAL.appUrl = GLOBAL.appUrl ? GLOBAL.appUrl : props.appUrl;
    GLOBAL.removeCardUrl = GLOBAL.removeCardUrl ? GLOBAL.removeCardUrl : props.removeCardUrl;
    GLOBAL.id = GLOBAL.id ? GLOBAL.id : props.id;
    GLOBAL.token = GLOBAL.token ? GLOBAL.token : props.token;
    GLOBAL.type = GLOBAL.type ? GLOBAL.type : props.type;
    GLOBAL.socket_url = GLOBAL.socket_url ? GLOBAL.socket_url : props.socket_url;
    
    GLOBAL.toolbar = GLOBAL.toolbar ? GLOBAL.toolbar : props.toolbar;
    GLOBAL.titleHeader = GLOBAL.titleHeader ? GLOBAL.titleHeader : props.titleHeader;
    
    const [totalToAddBalance, setTotalToAddBalance] = useState("");
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentBalance, setCurrentBalance] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const [digitable_line, setDigitable_line] = useState("");
    const [billet_url, setBillet_url] = useState("");
    const [addBalanceActive, setAddBalanceActive] = useState(false);
    const [referralBalance, setReferralBalance] = useState(0);
    const [cumulated_balance_monthly, setCumulated_balance_monthly] = useState(0);
    const [isCustomIndicationEnabled, setIsCustomIndicationEnabled] = useState(false);
    const [program_name, setProgram_name] = useState("");
    const [addCardIsWebview, setAddCardIsWebview] = useState("");

    const [settings, setSettings] = useState({
        prepaid_min_billet_value: "0",
        prepaid_tax_billet: "0",
        prepaid_billet_user: "0",
        prepaid_billet_provider: "0",
        prepaid_card_user: "0",
        prepaid_card_provider: "0",
        with_draw_enabled: false,

    });

    const isUser = GLOBAL.type == "user";
    const isProvider = GLOBAL.type == "provider";
    const withDrawalScreen = props.withDrawalScreen ? props.withDrawalScreen : '';

    //Get the lang from props. If hasn't lang in props, default is pt-BR
    var strings = require('./langs/pt-BR.json');

    //If has lang from props, get form props, if not, get from global.
    if(props && props.lang) {
        if(props.lang == "pt-BR")
            strings = require('./langs/pt-BR.json');
        else if(props.lang.indexOf("en") != -1)
            strings = require('./langs/en.json');
    }
    else if(GLOBAL.lang) {
        if(GLOBAL.lang == "pt-BR")
            strings = require('./langs/pt-BR.json');
        else if(GLOBAL.lang.indexOf("en") != -1)
            strings = require('./langs/en.json');
    }

    const api = new Api();


    if(GLOBAL.navigation_v5) {
        const isVisible = useIsFocused();
        useEffect(() => {
            if(isVisible) {
                getCardsAndBalanceInfo();
            }
        }, [isVisible]);
    }


    useEffect(() => {
        const backAction = () => {
            props.navigation.goBack()
            return true;
        };

        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          backAction
        );

        return () => backHandler.remove();
    }, []);

    const isBallance = () => {
      let value = '';
      if(typeof currentBalance == "string") {
        if(currentBalance.includes('R$')) {
          value = currentBalance.replace('R$', '');
          value = value.replace('.', '');
          value = value.replace(',', '.');
        } else if(currentBalance.includes('$')) {
          value = currentBalance.replace('$', '');
        } else {
          value = currentBalance;
        }

        value = parseFloat(value);
        return value > 0;
      }
    }



    /**
	 * Get all user's cards and their informations
	 * Pega todos os cartões do usuário e as informações deles
	 * @param {Number} user_id
	 * @param {String} user_token
	 */

    const getCardsAndBalanceInfo = () => {
        setIsLoading(true);
        api.GetCardsAndBalance(
            GLOBAL.appUrl,
            GLOBAL.id,
            GLOBAL.token,
            GLOBAL.type
        )
        .then((json) => {
            var isBalanceActive = false;
            if(json && json.settings) {
                if(GLOBAL.type == "user") {
                    isBalanceActive = json.settings.prepaid_billet_user == "1" || json.settings.prepaid_card_user == "1" ? true : false;
                } else if(GLOBAL.type == "provider") {
                    isBalanceActive = json.settings.prepaid_billet_provider == "1" || json.settings.prepaid_card_provider == "1" ? true : false;
                }

                setCards(json.cards);
                setCurrentBalance(json.current_balance);
                setSettings(json.settings);
                setAddBalanceActive(isBalanceActive);
                setReferralBalance(json.referralBalance);
                setCumulated_balance_monthly(json.cumulated_balance_monthly);
                setIsCustomIndicationEnabled(json.settings.indication_settings ? json.settings.indication_settings.isCustomIndicationEnabled : false);
                setProgram_name(json.settings.indication_settings ? json.settings.indication_settings.program_name : false);
                setAddCardIsWebview(json.add_card_is_webview);
            }
            setIsLoading(false);
        })
        .catch((error) => {
            console.error(error);
            setIsLoading(false);
        });
    }
    const alertOk = (title, msg) => {
        Alert.alert(
            title, msg,
            [{ text: "Ok"},],
            { cancelable: false }
        );
    }

    const addBalanceCard = (valueToAdd, cardId) => {
        setIsLoading(true);

        api.AddCreditCardBalance(
            GLOBAL.appUrl,
            GLOBAL.id,
            GLOBAL.token,
            valueToAdd,
            cardId,
            GLOBAL.type
        )
        .then((json) => {
            if(json.success) {
                setIsLoading(false);
                setCurrentBalance(json.current_balance);

                alertOk(strings.card, strings.card_success);
            } else {
                setIsLoading(false);
                if(json.error){
                    Toast.showToast(json.error);
                }
                else {
                    Toast.showToast(strings.card_refused);
                }
            }
        })
        .catch((error) => {
            setIsLoading(false);
            console.error(error);
        });

    }

    const addBalancePix = (valueToAdd) => {
        setIsLoading(true);
        api.AddPixBalance(
            GLOBAL.appUrl,
            GLOBAL.id,
            GLOBAL.token,
            valueToAdd,
            GLOBAL.type
        )
        .then((json) => {
            if(json.success) {
                setIsLoading(false);
                GLOBAL.pix_transaction_id = json.transaction_id;
                props.navigation.navigate('PixScreen',
                    {
                        originScreen: 'AddBalanceScreen'
                    }
                );
            } else {
                setIsLoading(false);
                if(json.error){
                    Toast.showToast(json.error);
                } else if(json.message){
                    Toast.showToast(json.message);
                }
                else {

                    Toast.showToast(strings.billet_error);
                }
            }
        })
        .catch((error) => {
            console.error(error);
        });


    }

    const addBalanceBillet = (valueToAdd) => {
        setIsLoading(true);

        api.AddBilletBalance(
            GLOBAL.appUrl,
            GLOBAL.id,
            GLOBAL.token,
            valueToAdd,
            GLOBAL.type
        )
        .then((json) => {
            if(json.success) {

                setIsLoading(false);
                setDigitable_line(json.digitable_line);
                setBillet_url(json.billet_url);
                setModalVisible(true);

            } else {
                msgError = strings.try_again
                Alert.alert(
                    strings.billet_error,
                    msgError,
                    [
                        { text: strings.ok, style: "cancel" },
                        
                    ],
                    { cancelable: false }
                );
                setIsLoading(false);
                if(json.error){
                    Toast.showToast(json.error);
                } else if (json.message){
                    Toast.showToast(json.message);
                }
                else {

                    Toast.showToast(strings.billet_error);
                }
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }

    //Valor a adicionar convertido em float. Remove as virgulas e substitui por ponto.
    const getFloatValue = () => {
        return parseFloat(totalToAddBalance.toString().replace(',', '.')).toFixed(2);
    }

    const alertAddBalancePix = () => {
        var valueToAdd = getFloatValue();

        var msg = strings.confirm_pix_value + " " + valueToAdd + "?";
        var pixMinValue = 1.5; // #todo: setting from api

        if(totalToAddBalance && valueToAdd && valueToAdd >= pixMinValue) {

            Alert.alert(
                strings.pay_with_pix,
                msg,
                [
                    { text: strings.cancel, style: "cancel" },
                    { text: strings.yes, onPress: () => addBalancePix(valueToAdd) }
                ],
                { cancelable: false }
            );
        } else {
            Toast.showToast(strings.please_digit_value + pixMinValue);
        }
    }

    const alertAddBalanceBillet = () => {

        var valueToAdd = getFloatValue();
        var prepaid_tax_billet = parseFloat(settings.prepaid_tax_billet);
        var msgMinimum=strings.minimumValueToCharge +  " " + strings.currency + parseFloat(settings.prepaid_min_billet_value);

        var msg = strings.confirm_billet_value + " " + strings.currency + valueToAdd  +"?";
        if(parseFloat(settings.prepaid_tax_billet) > 0) {
            msg += " " + strings.billet_addition + " " + strings.currency + prepaid_tax_billet;
        }
        if(settings.prepaid_min_billet_value) {
            var prepaidMinValue = parseFloat(settings.prepaid_min_billet_value);
        } else {
            var prepaidMinValue = 0;
        }
        if(totalToAddBalance && valueToAdd && valueToAdd >= prepaidMinValue) {

            Alert.alert(
                strings.pay_with_billet,
                msg,
                [
                    { text: strings.cancel, style: "cancel" },
                    { text: strings.yes, onPress: () => addBalanceBillet(valueToAdd) }
                ],
                { cancelable: false }
            );
        } else {
            Alert.alert(
                strings.pay_with_billet,
                msgMinimum,
                [
                    { text: strings.ok, style: "cancel" },
                    
                ],
                { cancelable: false }
            );
            // Toast.showToast(strings.please_digit_value + prepaidMinValue);
        }
    }
    const alertAddBalanceCard = (card) => {
        var valueToAdd = getFloatValue();

        if(totalToAddBalance && valueToAdd && valueToAdd > 0) {
            Alert.alert(
                strings.pay_with_card,
                strings.confirm_card_value + " " + valueToAdd + " " + strings.in_card + " **** **** **** " + card.last_four + "?",
                [
                    { text: strings.cancel, style: "cancel" },
                    { text: strings.yes, onPress: () => addBalanceCard(valueToAdd, card.id) }
                ],
                { cancelable: false }
            );
        } else {
            Toast.showToast(strings.please_digit_value + "0");
        }

    }

    const removeCardAlert = (card) => {
        if(card) {
            Alert.alert(
                strings.remove_card,
                strings.confirm_remove_card,
                [
                    { text: strings.cancel, style: "cancel" },
                    { text: strings.yes, onPress: () => removeCard(card) }
                ],
                { cancelable: true }
            );
        }
    }

    const removeCard = (card) => {
        setIsLoading(true);
        if(card) {
            api.RemoveCard(
                GLOBAL.removeCardUrl,
                GLOBAL.id,
                GLOBAL.token,
                card.id,
            )
            .then((json) => {
                if(json.success) {
                    setIsLoading(false);
                    getCardsAndBalanceInfo();
                    alertOk(strings.card, strings.remove_card_success);
                } else {
                    setIsLoading(false);
                    if(json.error){
                        Toast.showToast(json.error);
                    }
                    else {
                        Toast.showToast(strings.card_refused);
                    }
                }
            })
            .catch((error) => {
                setIsLoading(false);
                console.error(error);
            });
        }
    }

    const copyClipBoard = () => {
        Clipboard.setString(digitable_line);
        Toast.showToast(strings.billet_copied);
    }

    const goToAddCardScreen = () => {
        const screen = addCardIsWebview  ? 'AddCardWebView' : 'AddCardScreenLib';
        props.navigation.navigate(screen,
            {
                originScreen: 'AddBalanceScreen',
                cards: cards
            }
        )
    }

    const goToWithDrawal = () => {
        props.navigation.navigate(withDrawalScreen,
            {
                originScreen: 'AddBalanceScreen'
            }
        )
    }

	const infoTotal = () => {
		Toast.showToast(strings.infoTotal)
	}

	const infoMonthly = () => {
		Toast.showToast(strings.infoMonthly)
	}

    return (
        <View style={styles.container}>
            {!GLOBAL.navigation_v5 ? (
                <NavigationEvents
                    onWillFocus={() => {
                        getCardsAndBalanceInfo();
                    }}
                />
            ) : null}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}>

                <View style={styles.centeredView}>
                    <View style={styles.modalView}>

                    <Text style={styles.modalText}>{strings.new_billet_success}</Text>
                    <Text style={{color: 'blue', fontSize: 15}} onPress={() => Linking.openURL(billet_url)}>{strings.click_to_download}</Text>

                    <TouchableOpacity
                        onPress={() => copyClipBoard()}
                    >
                        <View style={{flexDirection: "row", marginVertical: 20}}>
                            <Text style={{fontSize: 17}}>{digitable_line}</Text>
                            <Icon style={{marginLeft: 10}} name="clipboard" size={25} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                        onPress={() => {
                            setModalVisible(false);
                        }}
                    >
                        <Text style={styles.textStyle}>Fechar</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView>
                <Loader loading={isLoading} message={strings.loading_message} />

                {/* Ajustando layout padrão mobilidade */}
                {GLOBAL.toolbar ? (
                    <View>
                        <GLOBAL.toolbar
                            back={true}
                            handlePress={() => props.navigation.navigate('MainScreen')}
                        />

                        <GLOBAL.titleHeader
                            text={strings.add_balance}
                            align="flex-start"
                        />
                    </View>
                ) :	(
                    <View style={{flex: 1, flexDirection: "row"}}>
                        <TouchableOpacity
                            onPress={() =>  props.navigation.goBack()}
                        >
                            <Text style={{fontSize: 20, paddingLeft: 20, paddingTop: 20, fontWeight: "bold"}}>X</Text>
                        </TouchableOpacity>
                        <View style={{
                            position: 'absolute',
                            width: Dimensions.get('window').width,
                            justifyContent: 'center',
                            alignItems: 'center'}}
                        >
                            <Text style={{ top: 20, fontWeight: "bold", fontSize: 20 }}>{strings.add_balance}</Text>
                        </View>
                    </View>
                )}

                {/* flex 4/10 */}
                <View style={{flex: 4, marginTop: 5}}>
                    <View style={{flex: 1, paddingHorizontal: 20, marginBottom: 10}}>

                        {!isLoading ? (
                          <View style={{ justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles.currentValueText}>{strings.currentBalance}</Text>
                            <Text style={styles.currentValue}>{currentBalance}</Text>
                        </View>
                        ) : null}

                        {isCustomIndicationEnabled ? (
                            <View style={styles.indicationContainer}>
                                <Text style={[styles.currentValueText, {marginBottom: 10, marginTop: 10}]}>{program_name}</Text>
                                <View style={styles.cardContainer}>
                                    {referralBalance !== 0 ? (
                                        <TouchableOpacity style={styles.card} onPress={() => infoTotal()}>
                                            <View style={styles.cardText}>
                                                <Text style={styles.indicationValueText}>{strings.total}</Text>
                                                <Text style={styles.indicationValue}>{referralBalance}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ) : null }

                                    {cumulated_balance_monthly !== 0 ? (
                                        <TouchableOpacity style={styles.card} onPress={() => infoMonthly()}>
                                            <View style={styles.cardText}>
                                                <Text style={styles.indicationValueText}>{strings.cumulated_balance_monthly}</Text>
                                                <Text style={styles.indicationValue}>{cumulated_balance_monthly}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ) : null }
                                </View>
                            </View>
                        ) : null }
                    </View>

                    { /* verify if exist bank account and app is user and ballance > 0 */}
                    { isUser && isBallance() && settings.with_draw_enabled == 1 ? (
                        <View style={{flex: 1, marginTop: 20}}>
                             <TouchableOpacity
                                style={styles.listTypes}
                                onPress={() => {
                                    goToWithDrawal();
                                }}
                            >
                                <View style={{ flex: 0.2 }}>
                                    <Image 
                                        style={{flex: 1, width: 30, height: 30, resizeMode: 'contain'}} 
                                        source={Images.icon_bank_profile } />
                                </View>

                                <View style={{ flex: 0.7 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{strings.make_widthdrawal}</Text>
                                </View>

                            </TouchableOpacity>
                        </View>
                    ) : null }

                    {addBalanceActive ? (
                        <View style={{flex: 1, marginTop: 20}}>
                            <View style={{marginTop: 10}}>
                                <Text style={styles.formValueTransfer}>{strings.add_balance_msg}</Text>
                                <View style={styles.form}>
                                    <TextInput
                                        style={{fontSize: 16, paddingLeft: 10}}
                                        keyboardType='numeric'
                                        placeholder={'0,00'}
                                        onChangeText={ text => setTotalToAddBalance(text) }
                                        value={totalToAddBalance ? String(totalToAddBalance) : null}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : ( null ) }

                    <ScrollView>
                        {
                            addBalanceActive && (
                                (GLOBAL.type == "user" && settings.prepaid_pix_user == "1") ||
                                (GLOBAL.type == "provider" && settings.prepaid_pix_provider == "1")
                            )
                        ? (
                            <TouchableOpacity
                                style={styles.listTypes}
                                onPress={() => {
                                    alertAddBalancePix();
                                }}
                            >
                                <View style={{ flex: 0.2 }}>
                                    <Image source={Images.icon_pix}
                                        style={{
                                        width: 45,
                                        height: 45,
                                        resizeMode: "contain"
                                    }} />
                                </View>

                                <View style={{ flex: 0.7 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{strings.pay_with_pix}</Text>
                                </View>

                            </TouchableOpacity>
                        ) : ( null ) }

                        {
                            addBalanceActive && (
                                (GLOBAL.type == "user" && settings.prepaid_billet_user == "1") ||
                                (GLOBAL.type == "provider" && settings.prepaid_billet_provider == "1")
                            ) && (totalToAddBalance)
                        ? (
                            <TouchableOpacity
                                style={styles.listTypes}
                                onPress={() => {
                                    alertAddBalanceBillet();
                                }}
                            >
                                <View style={{ flex: 0.2 }}>
                                    <Icon name="barcode" size={40} />
                                </View>

                                <View style={{ flex: 0.7 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{strings.pay_with_billet}</Text>
                                </View>

                            </TouchableOpacity>
                        ) : ( null ) }


                        {/* Add card button */}
                        {
                            addBalanceActive && (
                                (GLOBAL.type == "user" && settings.prepaid_card_user == "1") ||
                                (GLOBAL.type == "provider" && settings.prepaid_card_provider == "1")
                            )
                        ? (
                                <View style={{ flex: 1 }}>
                                <TouchableOpacity
                                    style={styles.listTypes}
                                    onPress={() => {
                                        goToAddCardScreen();
                                    }}
                                >
                                    <View style={{ flex: 0.2 }}>
                                        <Icon name="credit-card" size={40} />
                                    </View>

                                    <View style={{ flex: 0.7 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{strings.manage_cards}</Text>
                                    </View>
                                </TouchableOpacity>

                                <FlatList
                                    style={{ marginBottom: 30 }}
                                    data={cards}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.listTypes}
                                            onPress={() => {
                                                alertAddBalanceCard(item);
                                            }}
                                        >
                                            <View style={{ flex: 0.2 }}>
                                                {!item.card_type || item.card_type == "unknown" ? (
                                                    <Icon name="credit-card" size={40} />
                                                ) : (
                                                    <Image source={arrayIconsType[item.card_type]}
                                                        style={{
                                                        width: 40,
                                                        height: 28,
                                                        resizeMode: "contain"
                                                    }} />
                                                )}
                                            </View>

                                            <View style={{ flex: 0.7 }}>
                                                <Text style={{ fontWeight: 'bold' }}>**** **** **** {item.last_four}</Text>
                                            </View>

                                            <View style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center' }}>
                                                <TouchableOpacity
                                                    onPress={() => removeCardAlert(item)}
                                                >
                                                    <Image resizeMode="contain" source={Images.icon_remove} style={styles.removeCard} />
                                                </TouchableOpacity>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    keyExtractor={(item, index) => `${index}`}
                                />
                            </View>
                        ) : ( null ) }
                    </ScrollView>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({

    infoView: {
        flex: 1,
        alignItems: "flex-start",
        marginTop: 22
    },
    container: {
        flex: 1,
        backgroundColor: "white",
		paddingHorizontal: 25,
    },
    text: {
        marginBottom: 15,
        fontSize: 15,
        paddingLeft: 10
    },
    textTitle: {
        marginBottom: 15,
        fontSize: 17,
        paddingLeft: 10,
        fontWeight: "bold"
    },
    formText: {
        fontSize: 16,
        color: "#bfbfbf",
        marginLeft: 5
    },
    currentValueText: {
        fontSize: 20,
        color: "#bfbfbf",
        marginLeft: 5,
		marginBottom: 10
    },
    currentValue: {
        fontSize: 35,
        color: "black",
        marginLeft: 5,
        fontWeight: "bold"
    },
    formValueTransfer: {
        fontSize: 17,
        color: "black",
        marginLeft: 5,
        fontWeight: "bold"
    },
    form: {
        height: 40,
        fontSize: 16,
        marginHorizontal: 7,
        marginBottom: 15,
        borderBottomWidth: 0.2
    },
    hr: {
        paddingVertical: 5,
        borderBottomWidth: 0.7,
        borderBottomColor: '#C4C4C4'
    },
    infoText: {
        marginBottom: 15,
        fontSize: 15,
        paddingHorizontal: 10
    },
    iconCheck: {
        flex: 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: "grey",
        borderRadius: 12,
        height: 23
      },
    listTypes: {
        margin: 5,
        width: listWidth,
        backgroundColor: "#fff",
        borderRadius: 4,
        borderWidth: 0,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 3,
        flexDirection: 'row',
        alignItems: 'center'
    },

    centeredView: {
        flex: 1,
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "space-around",
        backgroundColor: "#00000040"
      },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    openButton: {
        backgroundColor: "#F194FF",
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
	redDivider: {
		width: window.width,
		height: 1,
		backgroundColor: "#EAEAEA",
		marginBottom: 5
	},
	cardContainer: {
		width: '100%',
		height: '60%',
		padding: 2,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-around',
	},
	card: {
		width: '50%',
		height: '100%',
		padding: 5,
		flex: 1
	},
	cardText: {
		flex: 1,
		backgroundColor: '#FBFBFB',
		alignItems: 'center',
		padding: 5
	},
	indicationValue: {
		fontSize: 30,
        color: "black",
        marginLeft: 5,
        fontWeight: "bold",
		flex: 0.60
	},
	indicationValueText: {
		fontSize: 20,
        color: "#bfbfbf",
		flex: 0.5,
		textAlign:'center',
	},
	indicationContainer: {
		marginTop: 10,
		alignItems: "flex-start",
	},
    removeCard: {
        height: 15,
        width: 15,
        marginTop: 5,
        marginLeft: 10
    },
});

export default AddBalanceScreen;
