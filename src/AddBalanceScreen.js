import React, { Component } from 'react';
import { 
    View, 
    TouchableOpacity, 
    Text, 
    StyleSheet, 
    TextInput,
    BackHandler,
    Picker,
    Dimensions
} from "react-native";

import Toolbar from './Functions/Toolbar'
import TitleHeader from './Functions/TitleHeader'
import GLOBAL from './Functions/Global.js';
import { Icon } from 'react-native-elements'

class AddBalanceScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            totalToAddBalance: "",
        }

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

    confirmAddBalance() {

    }
    
    render() {       
        return (
            <View style={{flex: 1}}>
                {/* flex 7/10 */}
                <View style={{flex: 7}}>
                    <View style={{ marginTop: Platform.OS === 'android' ? 0 : 25 }}>
                        <Toolbar
                            back={true}
                            nextStep={false}
                            isFilter={false}
                            isHelp={false}
                            handlePress={() => this.props.navigation.goBack()}
                            nextPress={() => { }}
                            filterPress={() => this.openFilter()}
                            helpPress={() => this.openHelp()}
                        />
                        <TitleHeader
                            text={'add_balance'}
                            align="flex-start"
                        />
                    </View>

                   
                    <View style={{flex: 1, paddingHorizontal: 20}}>
                        <View style={{ justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles.currentValueText}>{'your_balance'}</Text>
                            <Text style={styles.currentValue}>R$ 60,90</Text>
                        </View>
                        <View style={{marginTop: 20}}>
                            <Text style={styles.formText}>{'bank_account'}</Text>
                            
                        </View>

                        <View style={{marginTop: 20}}>
                            <Text style={styles.formValueTransfer}>{'transfer_value'}</Text>
                            <View style={styles.form}>
                                <TextInput
                                    style={{fontSize: 16, paddingLeft: 10}}
                                    keyboardType='numeric'
                                    placeholder={'write_value'}
                                    onChangeText={text => this.setState({ totalToAddBalance: text })}
                                    value={this.state.totalToAddBalance ? String(this.state.totalToAddBalance) : null}
                                />
                            </View>
                        </View>

                    </View>
                </View>

                {/* Flex vertical of 1/10 */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TouchableOpacity
                        style={{ borderRadius: 30, padding: 10, elevation: 2, marginHorizontal: 30,backgroundColor: 'white' }}
                        onPress={() => {
                            this.confirmAddBalance();
                        }}
                    >
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <Icon type='ionicon' name='ios-barcode-outline' size={30} />
                            <Text style={{marginLeft: 10, color: '#3b3b3b', fontSize: 20, fontWeight: "bold", textAlign: "center" }}>{'Pagar no Boleto'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Flex vertical of 1/10 */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <TouchableOpacity
                        style={{ borderRadius: 30, padding: 10, elevation: 2, marginHorizontal: 30,backgroundColor: 'white' }}
                        onPress={() => {
                            this.confirmAddBalance();
                        }}
                    >
                        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                            <Icon type='ionicon' name='ios-card-outline' size={30} />
                            <Text style={{marginLeft: 10, color: '#3b3b3b', fontSize: 20, fontWeight: "bold", textAlign: "center" }}>{'Pagar no Cartão'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Flex vertical of 1/10 - (OFFSET) */}
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    {/* OFFSET */}
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
    }

});

export default AddBalanceScreen;