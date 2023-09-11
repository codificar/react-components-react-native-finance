import React, { Component } from "react"
import {
    Text,
    BackHandler,
    View,
    StyleSheet,
    Platform
} from "react-native"
import { Divider } from 'react-native-elements'

//moment date
import moment from 'moment'

// Custom Components
import Toolbar from './Functions/Toolbar'
import TitleHeader from './Functions/TitleHeader'

import GLOBAL from './Functions/Global.js'

class EarningDetailScreen extends Component {
 constructor(props) {
        super(props)

        const item = this?.props?.navigation?.state?.params?.item;
        this.state = {
          item: item ?? props.route.params.item
        }

        //Get the lang from props. If hasn't lang in props, default is pt-BR
        this.strings = require('./langs/pt-BR.json');
        if(GLOBAL.lang) {
            if(GLOBAL.lang == "pt-BR") {
                this.strings = require('./langs/pt-BR.json');
            }
            else if(GLOBAL.lang == ("es-PY") != -1) {
                this.strings = require('./langs/es-PY.json');
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
        })
    }


    componentWillUnmount() {
        this.backHandler.remove()
    }


    nameReason(reason) {
        switch (reason) {
            case "SIMPLE_INDICATION":
            case "COMPENSATION_INDICATION":
            case "SEPARATE_CREDIT":
            case "RIDE_CREDIT":
            case "WITHDRAW":
            case "RIDE_CANCELLATION_CREDIT":
            case "RIDE_PAYMENT":
            case "AUTO_WITHDRAW":
                return this.strings.withdraw
            case "WITHDRAW_REJECT":
                return this.strings.withdraw_reject
            case "WITHDRAW_REQUESTED":
                return this.strings.withdraw_requested
            case "RIDE_DEBIT":
            case "RIDE_LEDGER":
            case "SEPARATE_DEBIT":
            case "RIDE_CANCELLATION_DEBIT":
            case "RIDE_PAYMENT_FAIL_DEBIT":
                return this.strings.debit
        }
    }



    render() {
        return (
            <View style={styles.parentContainer}>
               	<View style={{ marginTop: Platform.OS === 'android' ? 0 : 25 }}>
                    <Toolbar
                        back={true}
                        nextStep={false}
                        handlePress={() => this.props.navigation.goBack()}
                        nextPress={() => { }}
                    />
                    <TitleHeader
                        text={this.strings.details}
                        align="flex-start"
                    />
                </View>
                {this.state.item ? (
                    <View>
                        <Text style={styles.totalTitle}>{this.state.item.value_formatted}</Text>
                        <Text style={styles.dateTitle}>
                            {moment(this.state.item.created_at).format("ddd, DD/MM/YYYY HH:mm")}
                        </Text>
                        <View style={styles.contInfo}>
                            <View style={styles.rowOne}>
                                <Text style={styles.labelInfo}>{this.strings.typeTransaction}</Text>
                                <Text style={styles.textDesc}>{this.nameReason(this.state.item.reason)}</Text>
                            </View>
                            <View style={styles.rowTwo}>
                                <Text style={styles.labelInfo}>{this.strings.description}</Text>
                                <Text style={styles.textDesc}>
                                    {this.state.item.description} 
                                    {this.state.item.request_id ? " " + this.state.item.request_id : ""}
                                </Text>
                            </View>
                            <Divider style={styles.divider} />
                            <View style={styles.rowTotal}>
                                <Text style={styles.labelTotal}>{this.strings.total}</Text>
                                <Text style={styles.textTotal}>{this.state.item.value_formatted}</Text>
                            </View>
                        </View>
                    </View>
                ) : null}
            </View>
        )
    }
}


const styles = StyleSheet.create({
    parentContainer: {
        flex: 1,
        backgroundColor: "#ffffff"
    },
    toolBar: {
        paddingHorizontal: 25
    },
    totalTitle: {
        fontFamily: 'Roboto',
        fontSize: 26,
        color: '#282F39',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    dateTitle: {
        fontFamily: 'Roboto',
        fontSize: 18,
        color: '#d8d8d8',
        textAlign: 'center'
    },
    contInfo: {
        width: '85%',
        alignSelf: 'center',
        marginTop: 25
    },
    rowOne: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    rowTwo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10
    },
    rowTotal: {
        justifyContent: 'space-between',
        flexDirection: 'row'
    },
    labelInfo: {
        fontFamily: 'Roboto',
        color: '#d8d8d8'
    },
    textDesc: {
        fontFamily: 'Roboto',
        color: '#282F39',
        marginLeft: 15
    },
    divider: {
        backgroundColor: "#d3d3d3",
        width: '70%',
        alignSelf: 'center',
        marginTop: 15,
        marginBottom: 15
    },
    labelTotal: {
        fontFamily: 'Roboto',
        color: '#282F39',
        fontWeight: 'bold'
    },
    textTotal: {
        fontFamily: 'Roboto',
        fontSize: 18,
        color: '#282F39',
        fontWeight: 'bold'
    },

})


export default EarningDetailScreen;
