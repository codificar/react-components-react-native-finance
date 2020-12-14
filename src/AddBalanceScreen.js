import React, { Component } from 'react';
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
    Alert
} from "react-native";
const listWidth = Dimensions.get('window').width - 60;

import GLOBAL from './Functions/Global.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import Images from "./img/Images";
import Api from "./Functions/Api";
import Loader from "./Functions/Loader"

import Toast from "./Functions/Toast";

class AddBalanceScreen extends Component {

    constructor(props) {
        super(props);

        this.arrayIconsType = {};
        this.arrayIconsType["visa"] = Images.icon_ub_creditcard_visa;
        this.arrayIconsType["mastercard"] = Images.icon_ub_creditcard_mastercard;
        this.arrayIconsType["master"] = Images.icon_ub_creditcard_mastercard;
        this.arrayIconsType["amex"] = Images.icon_ub_creditcard_amex;
        this.arrayIconsType["diners"] = Images.icon_ub_creditcard_diners;
        this.arrayIconsType["discover"] = Images.icon_ub_creditcard_discover;
        this.arrayIconsType["jcb"] = Images.icon_ub_creditcard_jcb;
        this.arrayIconsType["terracard"] = Images.terra_card;

        GLOBAL.appUrl = this.props.appUrl;
        GLOBAL.userId = this.props.userId;
        GLOBAL.userToken = this.props.userToken;

        this.state = {
            totalToAddBalance: "",
            cards: [],
            isLoading: false,
            currentBalance: 0
        }
        //Get the lang from props. If hasn't lang in props, default is pt-BR
        this.strings = require('./langs/pt-BR.json');

        //If has lang from props, get form props, if not, get from global.
        if(this.props && this.props.lang) {
            if(this.props.lang == "pt-BR")
                this.strings = require('./langs/pt-BR.json');
            else if(this.props.lang.indexOf("en") != -1) 
                this.strings = require('./langs/en.json');
        }
        else if(GLOBAL.lang) {
            if(GLOBAL.lang == "pt-BR")
                this.strings = require('./langs/pt-BR.json');
            else if(GLOBAL.lang.indexOf("en") != -1)
                this.strings = require('./langs/en.json');
        }

        this.api = new Api();

        this.willFocus = this.props.navigation.addListener("willFocus", () => {
            //Toda vez que entra na tela, pega os params novamente, para atualizar os dados da tela
            this.getCardsAndBalanceInfo();
        })

    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            this.props.navigation.goBack()
            return true
        });
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }


    /**
	 * Get all user's cards and their informations
	 * Pega todos os cartões do usuário e as informações deles
	 * @param {Number} user_id
	 * @param {String} user_token
	 */
    getCardsAndBalanceInfo() {
        this.api.GetCardsAndBalance(
            GLOBAL.appUrl,
            GLOBAL.userId, 
            GLOBAL.userToken, 
        )
        .then((json) => {
            this.setState({
                cards: json.cards,
                currentBalance: json.current_balance
            });
        })
        .catch((error) => {
            console.error(error);
        });
    }
    alertOk(title, msg) {
        Alert.alert(
            title, msg,
            [{ text: "Ok"},],
            { cancelable: false }
        );
    }

    addBalanceCard(valueToAdd, cardId) {
        this.setState({ isLoading: true })
        console.log("chamar api de pagar com cartao. Id: "+cardId);

        this.api.AddCreditCardBalance(
            GLOBAL.appUrl,
            GLOBAL.userId, 
            GLOBAL.userToken,
            valueToAdd,
            cardId
        )
        .then((json) => {
            if(json.success) {
                this.setState({
                    isLoading: false,
                    currentBalance: json.current_balance
                });
                this.alertOk("Cartão", "Pagamento com cartão realizado com sucesso.");
            } else {
                this.setState({
                    isLoading: false
                });
                if(json.error){
                    Toast.showToast(json.error);
                }
                else {
                    Toast.showToast('Erro no cartão');
                }
            }
        })
        .catch((error) => {
            console.error(error);
        });
            
    }
    addBalanceBillet(valueToAdd) {
        this.setState({ isLoading: true })
        console.log("chamar api de pagar boleto");

        let that = this;
        setTimeout(function(){
            that.setState({ isLoading: false })
            that.alertOk("Boleto", "Boleto gerado com sucesso. Ele foi enviado para o seu email.");
        }, 2000)
    }

    alertAddBalanceBillet() {
        //Valor a adicionar formatado (convertido em float). Remove as virgulas e substitui por ponto.
        var valueToAdd = parseFloat(this.state.totalToAddBalance.toString().replace(',', '.')).toFixed(2);

        if(valueToAdd > 0) {
            console.log("adicionar saldo com boleto!");
            Alert.alert(
                "Pagar com boleto",
                "Tem certeza que deseja gerar um boleto no valor de " + valueToAdd + "?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sim", onPress: () => this.addBalanceBillet(valueToAdd) }
                ],
                { cancelable: false }
            );
        } else {
            Toast.showToast(this.strings.please_digit_value);
        }
    }
    alertAddBalanceCard(card) {
        //Valor a adicionar formatado (convertido em float). Remove as virgulas e substitui por ponto.
        var valueToAdd = parseFloat(this.state.totalToAddBalance.toString().replace(',', '.')).toFixed(2);

        if(valueToAdd > 0) {
            console.log("adicionar saldo com cartao: ", card);
            Alert.alert(
                "Pagar com cartão",
                "Tem certeza que deseja pagar o  valor de " + valueToAdd + " no cartão **** **** **** " + card.last_four + "?",
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sim", onPress: () => this.addBalanceCard(valueToAdd, card.id) }
                ],
                { cancelable: false }
            );
        } else {
            Toast.showToast(this.strings.please_digit_value);
        }
       
    }

    goToAddCardScreen() {
        this.props.navigation.navigate('AddCardScreen',
            {
                originScreen: 'AddBalanceScreen',
                cards: this.state.cards
            }
        )
    }
    
    render() {       
        return (
            <View style={{flex: 1}}>
                <Loader loading={this.state.isLoading} message={this.strings.loading_message} />
                {/* Flex vertical of 1/10 */}
                <View style={{flex: 1, flexDirection: "row"}}>
                    <TouchableOpacity 
                        onPress={() =>  this.props.navigation.goBack()} 
                    >
                        <Text style={{fontSize: 20, paddingLeft: 20, paddingTop: 20, fontWeight: "bold"}}>X</Text>
                    </TouchableOpacity>
                    <View style={{ 
                        position: 'absolute', 
                        width: Dimensions.get('window').width, 
                        justifyContent: 'center', 
                        alignItems: 'center'}}
                    >
                        <Text style={{ top: 20, fontWeight: "bold", fontSize: 20 }}>{this.strings.add_balance}</Text>
                    </View>
                </View>

                {/* flex 4/10 */}
                <View style={{flex: 4}}>
                    <View style={{flex: 1, paddingHorizontal: 20}}>
                        <View style={{ justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles.currentValueText}>{this.strings.currentBalance}</Text>
                            <Text style={styles.currentValue}>{this.state.currentBalance}</Text>
                        </View>
                        <View style={{marginTop: 20}}>
                            <Text style={styles.formText}>{this.strings.add_balance_msg}</Text>
                            
                        </View>

                        <View style={{marginTop: 20}}>
                            <Text style={styles.formValueTransfer}>{this.strings.digit_value}</Text>
                            <View style={styles.form}>
                                <TextInput
                                    style={{fontSize: 16, paddingLeft: 10}}
                                    keyboardType='numeric'
                                    placeholder={'0,00'}
                                    onChangeText={text => this.setState({ totalToAddBalance: text })}
                                    value={this.state.totalToAddBalance ? String(this.state.totalToAddBalance) : null}
                                />
                            </View>
                        </View>

                    </View>
                </View>

                {/* Flex vertical of 5/10 */}
                <View style={{ flex: 5, justifyContent: 'center', alignItems: 'center' }}>
                    <ScrollView>
                        {/* Add card button */}
                        <TouchableOpacity
                            style={{marginBottom: 10}}
                            onPress={ () => this.goToAddCardScreen() }
                        >
                            <Text style={styles.manageCardText}>{this.strings.manage_cards}</Text>
                        </TouchableOpacity>

                        {/* Billet */}
                        <TouchableOpacity
                            style={styles.listTypes}
                            onPress={() => {
                                this.alertAddBalanceBillet();
                            }}
                        >
                            <View style={{ flex: 0.2 }}>
                                <Icon name="barcode" size={40} />
                            </View>

                            <View style={{ flex: 0.7 }}>
                                <Text style={{ fontWeight: 'bold' }}>{this.strings.pay_with_billet}</Text>
                            </View>

                        </TouchableOpacity>

                        <FlatList
                            style={{ marginBottom: 30 }}
                            data={this.state.cards}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    style={styles.listTypes}
                                    onPress={() => {
                                        this.alertAddBalanceCard(item);
                                    }}
                                >
                                    <View style={{ flex: 0.2 }}>
                                        {!item.card_type || item.card_type == "unknown" ? (
                                            <Icon name="credit-card" size={40} />
                                        ) : (
                                            <Image source={this.arrayIconsType[item.card_type]}
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

                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => `${index}`}
                        />
                    </ScrollView>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({

    infoView: {
        flex: 1,
        alignItems: "flex-start",
        marginTop: 22
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
        fontSize: 14,
        color: "#bfbfbf",
        marginLeft: 5
      },
      currentValueText: {
        fontSize: 17,
        color: "#bfbfbf",
        marginLeft: 5
      },
      currentValue: {
        fontSize: 30,
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

});

export default AddBalanceScreen;