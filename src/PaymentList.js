import React, { useRef, useState, useEffect } from "react"

import Images from "./img/Images";


import { 
    View, 
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    FlatList
} from 'react-native';
import Api from "./Functions/Api";
const listWidth = Dimensions.get('window').width - 60;

import Icon from 'react-native-vector-icons/FontAwesome';
import IconCheck from 'react-native-vector-icons/Feather';

const PaymentList = (props) => {

    //Get the lang from props. If hasn't lang in props, default is pt-BR
    var strings = require('./langs/pt-BR.json');
    const isBrazilian = NativeModules.I18nManager.localeIdentifier === 'pt_BR';
    if (!isBrazilian) strings = require('./langs/en.json');

    const [arrayIconsType, setArrayIconsType] = useState({
        visa: Images.icon_ub_creditcard_visa,
        mastercard: Images.icon_ub_creditcard_mastercard,
        master: Images.icon_ub_creditcard_mastercard,
        amex: Images.icon_ub_creditcard_amex,
        diners: Images.icon_ub_creditcard_diners,
        discover: Images.icon_ub_creditcard_discover,
        jcb: Images.icon_ub_creditcard_jcb,
        terracard: Images.terra_card,
        money: Images.icon_money,
        machine: Images.machine,
        bitcoin: Images.bitcoin,
        balance: Images.balance,
        pix: Images.icon_pix
    });
    

    const api = new Api();

    return (
        <View style={{flex: 1}}>
            <View style={styles.main}>
                <Text style={styles.text}>{strings.payment_methods}</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
                {props.enableAddCard ?
                    <TouchableOpacity
                        style={styles.listTypes}
                        onPress={() => props.addCard()}
                    >
                        <View style={{ flex: 0.2 }}>
                            <Icon name="credit-card" size={33} />
                        </View>

                        <View style={{ flex: 0.7 }}>
                            <Text style={[styles.manageCardText, {color: props.color}]}>{strings.manage_cards}</Text>
                        </View>

                    </TouchableOpacity>
                : null }
                <View>
                    <ScrollView>
                        {props.enableAddCard ?
                        <FlatList
                            data={props.cards}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.listTypes}
                                    onPress={() => props.selectCard(item.id, item)}
                                >
                                    <View style={{ flex: 0.2 }}>
                                        <Image
                                            source={arrayIconsType[item.card_type]}
                                            style={{
                                            width: 50,
                                            height: 30,
                                            resizeMode: 'contain',
                                            }}
                                        />
                                    </View>

                                    <View style={{ flex: 0.7 }}>
                                        <Text style={{ fontWeight: 'bold' }}>
                                            **** **** **** {item.last_four}
                                        </Text>
                                    </View>

                                    {props.defaultPaymentMode == 0 && item.is_default == 1 ? (
                                        <View style={[styles.iconCheck, {backgroundColor: props.color}]}>
                                        <IconCheck name="check" size={18} color="#ffffff" />
                                        </View>
                                    ) : (
                                        <View></View>
                                    )}
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => `${index}`}
                        />
                        : null}
                        <FlatList
                            style={{marginBottom: 100}}
                            data={props.paymentsType}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.listTypes}
                                    onPress={ () => props.selectPayment(item.type, item.value) }
                                >
                                    <View style={{ flex: 0.2 }}>
                                        <Image
                                            source={arrayIconsType[item.icon]}
                                            style={{
                                            width: 42,
                                            height: 27,
                                            resizeMode: 'contain',
                                            }}
                                        />
                                    </View>

                                    <View style={{ flex: 0.7 }}>
                                        <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
                                    </View>

                                    {props.defaultPaymentMode == item.type ? (
                                        <View style={[styles.iconCheck, {backgroundColor: props.color}]}>
                                            <IconCheck name="check" size={18} color="#ffffff" />
                                        </View>
                                    ) : (
                                        <View></View>
                                    )}
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => `${index}`}
                        />
                    </ScrollView>
                </View>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
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
    manageCardText: {
        fontWeight: "bold"
    },
    iconCheck: {
        flex: 0.1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        height: 23
    },
    main: {
        marginBottom: 20,
        alignItems: 'flex-start',
        marginLeft: 20,
        marginTop: 20
    },
    text: {
        color: "#222B45",
        fontSize: 20,
        fontWeight: "bold"
    }
});

export default PaymentList;
