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

const DebitActiveScreen = (props) => {

    GLOBAL.lang = GLOBAL.lang ? GLOBAL.lang : props.lang;
    GLOBAL.color = GLOBAL.color ? GLOBAL.color : props.PrimaryButton;
    GLOBAL.navigation_v5 = GLOBAL.navigation_v5 ? GLOBAL.navigation_v5 : props.navigation_v5;

    GLOBAL.appUrl = GLOBAL.appUrl ? GLOBAL.appUrl : props.appUrl;
    GLOBAL.id = GLOBAL.id ? GLOBAL.id : props.id;
    GLOBAL.token = GLOBAL.token ? GLOBAL.token : props.token;
    GLOBAL.type = GLOBAL.type ? GLOBAL.type : props.type;
    GLOBAL.socket_url = GLOBAL.socket_url ? GLOBAL.socket_url : props.socket_url;
    
    const [currentBalance, setCurrentBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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

    if (props) {
        if (props.toolbar) {
            GLOBAL.toolbar = props.toolbar;
            GLOBAL.titleHeader = props.titleHeader;
        }
    }

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

    const verifyProps = () => {
        if(props.navigation.state.params) {
            const {params} = props.navigation.state;
            if(params.id)
                GLOBAL.id = params.id;
            if(params.token)
                GLOBAL.token = params.token;
            if(params.type)
                GLOBAL.type = params.type;
            if(params.appUrl)
                GLOBAL.appUrl = params.appUrl; 
        }
    }


    /**
	 * Get all user's cards and their informations
	 * Pega todos os cartões do usuário e as informações deles
	 * @param {Number} user_id
	 * @param {String} user_token
	 */

    const getCardsAndBalanceInfo = () => {
      verifyProps();
      setIsLoading(true);
        api.GetCardsAndBalance(
            GLOBAL.appUrl,
            GLOBAL.id,
            GLOBAL.token,
            GLOBAL.type
        )
        .then((json) => {
            if(json && json.settings) {
                if(parseFloat(json.current_balance) >= 0)
                    props.navigation.navigate('MainScreen');
                setCurrentBalance(json.current_balance_formated);
            }
            setIsLoading(false);
        })
        .catch((error) => {
            console.error(error);
            setIsLoading(false);
        });
    }

    const openAddBalanceScreen = () => {
        props.navigation.navigate('AddBalanceScreen',
            {
                originScreen: 'MainScreen',
            }
        )
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
            <Loader loading={isLoading} message={strings.loading_message} />

            {/* Ajustando layout padrão mobilidade */}
            {GLOBAL.toolbar ? (
                <View>
                    <GLOBAL.toolbar
                        back={true}
                        handlePress={() => props.navigation.navigate('MainScreen')}
                    />

                    <GLOBAL.titleHeader
                        text={strings.debit_active_balance}
                        align="flex-start"
                    />
                </View>
            ) :	(
                <View style={{flexDirection: "row"}}>
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
                        <Text style={{ top: 20, fontWeight: "bold", fontSize: 20 }}>{strings.debit_active_balance}</Text>
                    </View>
                </View>
            )}

            {/* flex 4/10 */}
            <View style={{display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                {!isLoading ? (
                    <View style={styles.containerBody}>
                        <Text style={styles.messageBody}>{strings.message_current_debit_active}</Text>
                        <Image 
                            style={styles.imgWarning} 
                            source={Images.warning } />
                        <Text style={styles.currentValueText}>{strings.current_debit_active}</Text>
                        <Text style={styles.currentValue}>{currentBalance}</Text>
                        <TouchableOpacity
                            style={styles.buttonToAddBallance}
                            onPress={openAddBalanceScreen} 
                        >
                            <Text style={{color: 'white', fontSize: 16, fontWeight: "bold", textAlign: "center" }}>{strings.add_balance}</Text>
                        </TouchableOpacity>
                        
                    </View>
                ) : null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        height: Dimensions.get('window').height,
        flex: 1,
        backgroundColor: "white",
		paddingHorizontal: 25,
        paddingBottom: 25
    },
    containerBody: {
        justifyContent: 'center', 
        alignItems: 'center',
        flex: 1,
    },
    currentValueText: {
        fontSize: 20,
        color: "#bfbfbf",
        marginLeft: 5,
		marginBottom: 10
    },
    messageBody: {
        fontSize: 27,
        fontWeight: "bold",
        textAlign: 'center',
        color: "#595959",
        marginLeft: 5,
		marginBottom: 10
    },
    currentValue: {
        fontSize: 35,
        color: "black",
        marginLeft: 5,
        fontWeight: "bold"
    },
    imgWarning: {
        width: 130, 
        height: 130, 
        resizeMode: 'contain'
    },
    buttonToAddBallance: {
        position:'absolute', 
        bottom: 0, 
        borderRadius: 3, 
        padding: 10, 
        elevation: 2, 
        width: Dimensions.get('window').width - 40, 
        backgroundColor: '#00A8FF'
    }

});

export default DebitActiveScreen;
