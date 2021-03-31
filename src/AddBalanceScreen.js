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

import Toast from "./Functions/Toast";
import Global from './Functions/Global.js';

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

        GLOBAL.lang = GLOBAL.lang ? GLOBAL.lang : this.props.lang;
        GLOBAL.color = GLOBAL.color ? GLOBAL.color : this.props.PrimaryButton;

        GLOBAL.appUrl = GLOBAL.appUrl ? GLOBAL.appUrl : this.props.appUrl;
        GLOBAL.id = GLOBAL.id ? GLOBAL.id : this.props.id;
        GLOBAL.token = GLOBAL.token ? GLOBAL.token : this.props.token;
        GLOBAL.type = GLOBAL.type ? GLOBAL.type : this.props.type;

        this.state = {
            totalToAddBalance: "",
            cards: [],
            isLoading: false,
            currentBalance: 0,
            modalVisible: false,
            digitable_line: "",
            billet_url: "",
            settings: {
                prepaid_min_billet_value: "0",
                prepaid_tax_billet: "0",
                prepaid_billet_user: "0",
                prepaid_billet_provider: "0",
                prepaid_card_user: "0",
                prepaid_card_provider: "0"
                
            },
            addBalanceActive: false,
			referralBalance: 0,
			cumulated_balance_monthly: 0,
			isCustomIndicationEnabled: false
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

		if (this.props) {
			if (this.props.toolbar) {
				GLOBAL.toolbar = this.props.toolbar;
				GLOBAL.titleHeader = this.props.titleHeader;
			}
		}		
    }

    componentDidMount() {
        this.getCardsAndBalanceInfo();
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
            GLOBAL.id, 
            GLOBAL.token, 
            GLOBAL.type
        )
        .then((json) => {
            console.log("resposta add balance: ", json);
            var isBalanceActive = false;
            if(GLOBAL.type == "user") {
                isBalanceActive = json.settings.prepaid_billet_user == "1" || json.settings.prepaid_card_user == "1" ? true : false;
            } else if(GLOBAL.type == "provider") {
                isBalanceActive = json.settings.prepaid_billet_provider == "1" || json.settings.prepaid_card_provider == "1" ? true : false;
            }
            this.setState({
                cards: json.cards,
                currentBalance: json.current_balance,
                settings: json.settings,
                addBalanceActive: isBalanceActive,
				referralBalance: json.referralBalance,
				cumulated_balance_monthly: json.cumulated_balance_monthly,
				isCustomIndicationEnabled: json.settings.indication_settings.isCustomIndicationEnabled,
				program_name: json.settings.indication_settings.program_name,
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
            GLOBAL.id, 
            GLOBAL.token,
            valueToAdd,
            cardId,
            GLOBAL.type
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

    setModalVisible = (visible) => {
        this.setState({ modalVisible: visible });
    }
      
    addBalanceBillet(valueToAdd) {
        this.setState({ isLoading: true })
        console.log("chamar api de pagar com boleto");

        this.api.AddBilletBalance(
            GLOBAL.appUrl,
            GLOBAL.id, 
            GLOBAL.token,
            valueToAdd,
            GLOBAL.type
        )
        .then((json) => {
            if(json.success) {
               
                this.setState({
                    isLoading: false,
                    digitable_line: json.digitable_line,
                    billet_url: json.billet_url,
                    modalVisible: true
                });
            } else {
                console.log("json: ", json);
                this.setState({
                    isLoading: false
                });
                if(json.error){
                    Toast.showToast(json.error);
                }
                else {
                    Toast.showToast('Erro ao gerar boleto');
                }
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }

    alertAddBalanceBillet() {
        //Valor a adicionar formatado (convertido em float). Remove as virgulas e substitui por ponto.
        var valueToAdd = parseFloat(this.state.totalToAddBalance.toString().replace(',', '.')).toFixed(2);
        var msg = "Tem certeza que deseja gerar um boleto no valor de " + valueToAdd + "?";
        if(parseFloat(this.state.settings.prepaid_tax_billet) > 0) {
            msg += " Haverá um acréscimo de " + this.state.settings.prepaid_tax_billet;
        }
        if(this.state.settings.prepaid_min_billet_value) {
            var prepaidMinValue = parseFloat(this.state.settings.prepaid_min_billet_value);
        } else {
            var prepaidMinValue = 0;
        }
        if(this.state.totalToAddBalance && valueToAdd && valueToAdd >= prepaidMinValue) {
            console.log("adicionar saldo com boleto!");
            Alert.alert(
                "Pagar com boleto",
                msg,
                [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Sim", onPress: () => this.addBalanceBillet(valueToAdd) }
                ],
                { cancelable: false }
            );
        } else {
            Toast.showToast(this.strings.please_digit_value + prepaidMinValue);
        }
    }
    alertAddBalanceCard(card) {
        //Valor a adicionar formatado (convertido em float). Remove as virgulas e substitui por ponto.
        var valueToAdd = parseFloat(this.state.totalToAddBalance.toString().replace(',', '.')).toFixed(2);

        if(this.state.totalToAddBalance && valueToAdd && valueToAdd > 0) {
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
            Toast.showToast(this.strings.please_digit_value + "0");
        }
       
    }
    copyClipBoard() {
        Clipboard.setString(this.state.digitable_line);
        Toast.showToast('Boleto copiado com sucesso!');
    }

    goToAddCardScreen() {
        this.props.navigation.navigate('AddCardScreenLib',
            {
                originScreen: 'AddBalanceScreen',
                cards: this.state.cards
            }
        )
    }

	infoTotal() {
		Toast.showToast(this.strings.infoTotal)
	}

	infoMonthly() {
		Toast.showToast(this.strings.infoMonthly)
	}
    
    render() {  
        return (
            <View style={[styles.container]}>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}>
						
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                        <Text style={styles.modalText}>Boleto gerado com sucesso. Ele foi enviado para o seu email.</Text>
                        <Text style={{color: 'blue', fontSize: 15}} onPress={() => Linking.openURL(this.state.billet_url)}>Clique aqui para baixar</Text>
                       
                        <TouchableOpacity
                            onPress={() => this.copyClipBoard()}
                        >
                            <View style={{flexDirection: "row", marginVertical: 20}}>
                                <Text style={{fontSize: 17}}>{this.state.digitable_line}</Text>
                                <Icon style={{marginLeft: 10}} name="clipboard" size={25} />
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ ...styles.openButton, backgroundColor: "#2196F3" }}
                            onPress={() => {
                                this.setModalVisible(false);
                            }}
                        >
                            <Text style={styles.textStyle}>Fechar</Text>
                        </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

				<ScrollView>
					<Loader loading={this.state.isLoading} message={this.strings.loading_message} />
						
					{/* Ajustando layout padrão mobilidade */}
					{GLOBAL.toolbar ? (
						<View>
							<GLOBAL.toolbar
								back={true}
								handlePress={() => this.props.navigation.goBack()}
							/>

							<GLOBAL.titleHeader
								text={this.strings.add_balance}
								align="flex-start"
							/> 
						</View>					
					) :	(
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
					)}

					{/* flex 4/10 */}
					<View style={{flex: 4, marginTop: 5}}>
						<View style={{flex: 1, paddingHorizontal: 20, marginBottom: 10}}>
							<View style={{ justifyContent: 'center', alignItems: 'center'}}>
								<Text style={styles.currentValueText}>{this.strings.currentBalance}</Text>
								<Text style={styles.currentValue}>{this.state.currentBalance}</Text>
							</View>
						
							{this.state.isCustomIndicationEnabled ? (
								<View style={styles.indicationContainer}>
									<Text style={[styles.currentValueText, {marginBottom: 10, marginTop: 10}]}>{this.state.program_name}</Text>
									<View style={styles.cardContainer}>	
										{this.state.referralBalance !== 0 ? (
											<TouchableOpacity style={styles.card} onPress={() => this.infoTotal()}>
												<View style={styles.cardText}>
													<Text style={styles.indicationValueText}>{this.strings.total}</Text>
													<Text style={styles.indicationValue}>{this.state.referralBalance}</Text>								
												</View>								
											</TouchableOpacity>
										) : null }

										{this.state.cumulated_balance_monthly !== 0 ? (
											<TouchableOpacity style={styles.card} onPress={() => this.infoMonthly()}>						
												<View style={styles.cardText}>
													<Text style={styles.indicationValueText}>{this.strings.cumulated_balance_monthly}</Text>
													<Text style={styles.indicationValue}>{this.state.cumulated_balance_monthly}</Text>								
												</View>								
											</TouchableOpacity>
										) : null }
									</View>					
								</View>
							) : null }
						</View>

						{this.state.addBalanceActive ? (
							<View style={{flex: 1, marginTop: 20}}>
								<View style={{marginTop: 10}}>
									<Text style={styles.formValueTransfer}>{this.strings.add_balance_msg}</Text>
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
						) : ( null ) }
						
						<ScrollView>							
							{
								this.state.addBalanceActive && (
									(GLOBAL.type == "user" && this.state.settings.prepaid_billet_user == "1") ||
									(GLOBAL.type == "provider" && this.state.settings.prepaid_billet_provider == "1")
								)
							? (
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
							) : ( null ) }


							{/* Add card button */}
							{
								this.state.addBalanceActive && (
									(GLOBAL.type == "user" && this.state.settings.prepaid_card_user == "1") ||
									(GLOBAL.type == "provider" && this.state.settings.prepaid_card_provider == "1") 
								)
							? (
									<View style={{ flex: 1 }}>
									<TouchableOpacity
										style={styles.listTypes}
										onPress={() => {
											this.goToAddCardScreen();
										}}
									>
										<View style={{ flex: 0.2 }}>
											<Icon name="credit-card" size={40} />
										</View>

										<View style={{ flex: 0.7 }}>
											<Text style={{ fontWeight: 'bold' }}>{this.strings.manage_cards}</Text>
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
								</View>
							) : ( null ) }
						</ScrollView>
					</View>	
				</ScrollView>	
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
	}
});

export default AddBalanceScreen;