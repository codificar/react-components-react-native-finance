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

const CardList = (props) => {

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

    const [arrayIconsType, setArrayIconsType] = useState({
        visa: Images.icon_ub_creditcard_visa,
        mastercard: Images.icon_ub_creditcard_mastercard,
        master: Images.icon_ub_creditcard_mastercard,
        amex: Images.icon_ub_creditcard_amex,
        diners: Images.icon_ub_creditcard_diners,
        discover: Images.icon_ub_creditcard_discover,
        elo: Images.icon_ub_creditcard_elo,
        jcb: Images.icon_ub_creditcard_jcb,
        terracard: Images.terra_card
    });
    

    const api = new Api();

    return (
        <View style={{flex: 1}}>
             <View style={styles.principal}>
                <Text style={styles.text}>{strings.add_cards}</Text>
            </View>
            <ScrollView style={styles.screen}>
                <View style={styles.areaView}>

                    <FlatList
                        data={props.cards}
                        renderItem={({ item, index }) => (
                            ("card_type" in item) &&
                            <View key={index} style={styles.listTypes}>
                                <View style={{ flex: 0.2 }}>

                                    <Image
                                        source={arrayIconsType[item.card_type.toLowerCase()]}
                                        style={{ width: 50, height: 30, resizeMode: "contain" }}
                                    />

                                </View>

                                <View style={{ flex: 0.7 }}>
                                    <Text style={{ fontWeight: 'bold' }}>**** **** **** {item.last_four}</Text>
                                </View>

                                <View style={{ flex: 0.1, justifyContent: 'center', alignItems: 'center' }}>
                                    <TouchableOpacity
                                        onPress={() => props.delete_card(item.id)}
                                    >
                                        <Image resizeMode="contain" source={Images.icon_remove} style={styles.removeCard} />
                                    </TouchableOpacity>
                                </View>

                            </View>
                        )}
                        keyExtractor={(item, index) => `${index}`}
                    />


                    <View style={[styles.areaBlankState, {width: 0, height: 0}]}>
                        <Image source={Images.blank_state} style={styles.imgBlankState} />
                        <Text style={styles.txtBlankState}>
                            {strings.blank_state_message}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            <View style={{ marginBottom: 20, marginHorizontal: 20 }} >
                <TouchableOpacity
                    style={[styles.btnAddCard, {backgroundColor: props.color}]}
                    onPress={() => props.add_card()}
                    accessibilityLabel={strings.addCardTitle}
                >
                    <Text style={{ color: '#fff', fontSize: 16 }}>{strings.addCardTitle}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    screen: {
        backgroundColor: "#ffffff",
        left: 0,
        right: 0,
        zIndex: 0,
        flex: 1,
        width: window.width,
    },
    areaView: {
        alignItems: "center"
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
    removeCard: {
        height: 15,
        width: 15,
        marginTop: 5,
        marginLeft: 10
    },
    areaBlankState: {
        flex: 1,
        alignItems: "center",
        paddingTop: 100,
        overflow: "hidden"
    },
    imgBlankState: {
        width: 150,
        height: 150
    },
      txtBlankState: {
        color: "grey"
    },
    btnAddCard: {
        width: '100%',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    principal: {
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

export default CardList;