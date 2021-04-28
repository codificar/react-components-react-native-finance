import React, { Component } from "react"

import Loader from "./Functions/Loader"
import Toolbar from './Functions/Toolbar'
import TitleHeader from './Functions/TitleHeader'

import Toast from "./Functions/Toast";

import { 
    View, 
    Text,
    BackHandler,
    TouchableOpacity,
    TextInput,
    StyleSheet
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
import Api from "./Functions/Api";
import GLOBAL from './Functions/Global.js';

class AddCardScreenLib extends Component {
    constructor(props) {
        super(props);

        //Get the lang from props. If hasn't lang in props, default is pt-BR
        this.strings = require('./langs/pt-BR.json');
        if(GLOBAL.lang) {
            if(GLOBAL.lang == "pt-BR") {
                this.strings = require('./langs/pt-BR.json');
            } 
            // if is english
            else if(GLOBAL.lang.indexOf("en") != -1) {
                this.strings = require('./langs/en.json');
            }
        }

        this.state = {
            isLoading: false,
            loading_message: this.strings.loading_message,
            cardNumber: '',
            cardName: '',
            cardExpiration: '',
            cardCvv: '',
            nameError: false,
            cvvError: false,
            expirationError: false,
            numberError: false
        }

        this.api = new Api();

    }

    componentDidMount() {
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
            this.props.navigation.goBack()
            return true
        });
    }

    validationName() {
        if (this.state.cardName.length == 0) {
            this.setState({
                nameError: true
            });
            return true;
        }
        
        return false;
    }

    validationCvv() {
        if (this.state.cardCvv.length < 3) {
            this.setState({
                cvvError: true
            });
            return true;
        }

        return false;
    }

    validationExpiration() {
        try {
            if (this.state.cardExpiration.length == 0) {
                this.setState({
                    expirationError: true
                });
                return true;
            } else {
                var exp = this.state.cardExpiration.split('/');
                var month = parseInt(exp[0]);
                var year = parseInt(exp[1]);
                let today = new Date();
                if(year.toString().length == 2) {
                    year = parseInt("20" + year);
                }
                if(month > 12 || month == 0 || year < today.getFullYear()) {
                    this.setState({
                        expirationError: true
                    });
                    return true;
                }

                return false;
            }
        } catch (error) {
            this.setState({
                expirationError: true
            });
            return true;
        }
    }

    validationNumber() {
        const number = this.state.cardNumber.split(' ').join('');
        
        if (number.length < 16) {
            this.setState({
                numberError: true
            });
            return true;
        } 
        
        return false;
    }

    onPress() {
        const name = this.validationName();
        const cvv = this.validationCvv();
        const expiration = this.validationExpiration();
        const number = this.validationNumber();
        if (!name && !cvv && !expiration && !number) {
            this.addCard();
        } else {
            console.log('erro');
        }
    }

    addCard() {
        this.setState({
            isLoading: true
        });
        
        var exp = this.state.cardExpiration.split('/');
        var month = parseInt(exp[0]);
        var year = parseInt(exp[1]);            

            GLOBAL.id + '-' + 
            GLOBAL.token + '-' +
            GLOBAL.type + '-' +
            this.state.cardName + '-' +
            this.state.cardNumber.split(' ').join('') + '-' +
            this.state.cardCvv + '-' +
            month + '-' +
            year);

        this.api.AddCard(
            GLOBAL.appUrl,
            GLOBAL.id, 
            GLOBAL.token,
            GLOBAL.type,
            this.state.cardName,
            this.state.cardNumber.split(' ').join(''),
            this.state.cardCvv,
            year,
            month
        ).then(response => {
            this.setState({
                isLoading: false
            });
            this.props.navigation.goBack();
        }).catch(error => {
            this.setState({
                isLoading: false
            });
        });
    }

    render() {
        return (
            <View style={styles.parentContainer}>
                <Loader 
                    loading={this.state.isLoading}
                    message={this.state.loading_message} 
                />
                <Toolbar
                    back={true}
                    handlePress={() => this.props.navigation.goBack()}
                />
                <TitleHeader
                    text={this.strings.addCardTitle}
                    align="flex-start"
                />

                <View
                    style={styles.container}
                >
                    <View>
                        <View
                            style={styles.marginBottom}
                        >
                            <Text style={styles.DefaultInputLabel}>
                                {this.strings.name}
                            </Text>
                            <TextInput 
                                value={this.state.cardName}
                                onChangeText={text => {
                                    this.setState({
                                        cardName: text
                                    })
                                }}
                                style={styles.DefaultInputStyle}
                                placeholder={this.strings.namePlaceholder}
                                onFocus={() => this.setState({nameError: false})}
                            />
                            { this.state.nameError &&  
                                <Text style={styles.ErrorLabel} >
                                    {this.strings.nameError}
                                </Text>
                            }
                        </View>
                        
                        <View
                            style={styles.marginBottom}
                        >
                            <Text style={styles.DefaultInputLabel}>
                                {this.strings.number}
                            </Text>
                            <TextInputMask
                                placeholder={this.strings.numberPlaceholder}
                                type={'custom'}
                                options={{
                                    mask: '9999 9999 9999 9999'
                                }}
                                value={this.state.cardNumber}
                                onChangeText={text => {
                                    this.setState({
                                        cardNumber: text
                                    })
                                }}
                                style={styles.DefaultInputStyle}
                                onFocus={() => this.setState({numberError: false})}
                            />
                            { this.state.numberError &&  
                                <Text style={styles.ErrorLabel} >
                                    {this.strings.numberError}
                                </Text>
                            }
                        </View>

                        <View
                            style={styles.container2}
                        >
                            <View
                                style={styles.container2Width}
                            >
                                <Text style={styles.DefaultInputLabel}>
                                    {this.strings.exp}
                                </Text>
                                <TextInputMask
                                    placeholder='MM/AAAA'
                                    type={'custom'}
                                    options={{
                                        mask: '99/9999'
                                    }}
                                    value={this.state.cardExpiration}
                                    onChangeText={text => {
                                        this.setState({
                                            cardExpiration: text
                                        })
                                    }}
                                    style={styles.DefaultInputStyle}
                                    onFocus={() => this.setState({expirationError: false})}
                                />
                                { this.state.expirationError &&  
                                    <Text style={styles.ErrorLabel} >
                                        {this.strings.expError}
                                    </Text>
                                }
                            </View>
                            <View
                                style={styles.container2Width}
                            >
                                <Text style={styles.DefaultInputLabel}>
                                    {this.strings.cvv}
                                </Text>
                                <TextInputMask
                                    placeholder='123'
                                    type={'custom'}
                                    options={{
                                        mask: '9999'
                                    }}
                                    value={this.state.cardCvv}
                                    onChangeText={text => {
                                        this.setState({
                                            cardCvv: text
                                        })
                                    }}
                                    onFocus={() => this.setState({cvvError: false})}
                                    style={styles.DefaultInputStyle}
                                />
                                { this.state.cvvError &&  
                                    <Text style={styles.ErrorLabel} >
                                        {this.strings.cvvError}
                                    </Text>
                                }   
                            </View>
                        </View>
                    </View>
                    <View>
                        <TouchableOpacity
                            style={{
                                width: '100%',
                                backgroundColor: GLOBAL.color,
                                padding: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 25
                            }}
                            onPress={() => this.onPress()}
                        >
                            <Text
                                style={styles.BtnText}
                            >
                                {this.strings.save}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    parentContainer: {
        flex: 1,
        padding: 0,
        backgroundColor: "white"
    },
    DefaultInputStyle: {
        height: 40,
        marginBottom: 8,
        borderBottomColor: "grey",
        borderBottomWidth: 1,
        color: "black"
    },
    DefaultInputLabel: {
        fontSize: 12,
        color: "green"
    },
    ErrorLabel: {
        fontSize: 12,
        fontWeight: "normal",
        color: "red"
    },
    BtnText: {
        color: '#fff', 
        fontSize: 16,
        fontWeight: 'bold'
    },
    container: {
        flex: 1,
        paddingHorizontal: 25,
        justifyContent: 'space-between'
    },
    marginBottom: {
        marginBottom: 15
    },
    container2: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    container2Width: {
        marginBottom: 15,
        width: '48%'
    }
});

export default AddCardScreenLib;