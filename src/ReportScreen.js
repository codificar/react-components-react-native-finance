import React, { Component } from 'react'
import { View, Text, Dimensions, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'

//Styles
//import styles from "./Styles/ReportScreenStyle"

//Moment date
import moment from "moment"

//Graphic
import { BarChart } from "react-native-chart-kit"

import GLOBAL from './Functions/Global.js'

class ReportScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            listYears: [],
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
        this.listYears()
    }


    listYears() {
        let currentYear = moment().format('YYYY')
        let arrayDropDownYears = [{ value: currentYear }, { value: currentYear - 1 }, { value: currentYear - 2 }]
        this.setState({ listYears: arrayDropDownYears })
    }



    render() {
        const { currency, lineGraphic, arrayReport, firstDayWeek, lastDayWeek, reportData } = this.props
        //console.log('lineGraphic props: ', lineGraphic)
        return (
            <View style={styles.container}>
                <View style={styles.contReceived}>
                    <View style={styles.contTotalValue}>
                        <Text style={styles.txtTotal}>{currency} {reportData.total_week}</Text>
                    </View>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.bodyMain}>
                        <View style={styles.contChart}>
                            {lineGraphic.datasets !== undefined ? (
                                <BarChart
                                    data={lineGraphic}
                                    withHorizontalLabels={false}
                                    withVerticalLabels={true}
                                    withOuterLines={true}
                                    width={Dimensions.get('window').width}
                                    height={250}
                                    showValuesOnTopOfBars={true}
                                    chartConfig={{
                                        withOuterLines: false,
                                        backgroundGradientFrom: "#FFFFFF",
                                        backgroundGradientTo: "#FFFFFF",
                                        fillShadowGradientOpacity: 5,
                                        decimalPlaces: 1,
                                        color: (opacity = 1) => `rgba(110, 185, 134, ${opacity})`,
                                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                        propsForBackgroundLines: {
                                            strokeDasharray: "4", // solid background lines with no dashes
                                            strokeWidth: .25,
                                            stroke: `rgba(255,255,255, .50)`,
                                        }
                                    }}
                                />
                            ) : null}
                        </View>
                    </View>
                    <View style={styles.bodySec}>
                        <View style={styles.rowGeneralInfo}>
                            <View style={styles.contTravel}>
                                <Text style={styles.textQuantTravel}>{reportData.rides_count}</Text>
                                {reportData.rides_count > 1 ? (
                                <Text style={styles.textTravel}>{this.strings.racings}</Text>
                                ): (
                                    <Text style={styles.textTravel}>{this.strings.racing}</Text>
                                )}
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.contOnline}>
                                <Text style={styles.textHours}>{reportData.online_time_text}</Text>
                                <Text style={styles.textOnline}>{this.strings.onlineHours}</Text>
                            </View>
                            <View style={styles.divider} />
                            <View style={styles.contTravelCash}>
                                <Text style={styles.textTravelCash}>{currency} {reportData.total_money_week}</Text>
                                <Text style={styles.textTravelCashDesc}>{this.strings.cashTravels}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.btnAccountExtract}
                            onPress={() => this.props.openEarnings()}>
                            <View style={styles.contRowItem}>
                                <Text style={styles.textExtract}>{this.strings.currentAccount}</Text>
                                <Text style={styles.textExtracDates}>{firstDayWeek} - {lastDayWeek}</Text>
                            </View>
                            <View style={styles.contArrow}>
                                <Icon type='ionicon' name='ios-arrow-forward' size={20} iconStyle={styles.backIcon} />
                            </View>
                        </TouchableOpacity>

                        {reportData && reportData.is_withdraw_enabled && parseInt(reportData.is_withdraw_enabled) ? (
                            <TouchableOpacity style={styles.btnTransactions}
                                onPress={() => this.props.openTransactions()}>
                                <View style={styles.contRowItem}>
                                    <Text style={styles.textRecentTransac}>{this.strings.recentTransaction}</Text>
                                    {/*<Text style={styles.textTransacSald}>{strings('checkingAccount.balanceOf')} {currency} 250,00</Text>*/}
                                </View>
                                <View style={styles.contArrow}>
                                    <Icon type='ionicon' name='ios-arrow-forward' size={20} iconStyle={styles.backIcon} />
                                </View>
                            </TouchableOpacity>
                        ) : ( null ) }

                    </View>
                </ScrollView>

            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    txtTotal: {
        fontFamily: 'Roboto',
        fontSize: 40,
        fontWeight: 'bold',
        marginRight: 7,
        color: '#000000'
    },
    contReceived: {
        width: '90%',
        alignSelf: 'center'
    },
    bodyMain: {
        width: '100%',
        marginTop: 10,
        marginRight: 25
    },
    contChart: {
        width: '100%',
        marginLeft: -35
    },
    bodySec: {
        flex: 1,
        backgroundColor: '#ffffff',
        marginTop: 10
    },
    contTotalValue: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    rowGeneralInfo: {
        flexDirection: 'row',
        width: '80%',
        alignSelf: 'center',
        borderTopWidth: 0.5,
        borderTopColor: '#DADEE3',
        justifyContent: 'center'
    },
    contTravel: {
        alignItems: 'center',
        width: '30%',
        marginTop: 8
    },
    textQuantTravel: {
        fontFamily: 'Roboto',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#282F39'
    },
    textTravel: {
        fontFamily: 'Roboto',
        fontSize: 12,
        color: '#BCBCBC'
    },
    divider: {
        borderRightWidth: 0.5,
        borderRightColor: '#DADEE3',
        height: '55%'
    },
    contOnline: {
        alignItems: 'center',
        width: '30%',
        marginRight: 5,
        marginLeft: 5,
        marginTop: 8
    },
    textHours: {
        fontFamily: 'Roboto',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#282F39',
        textAlign: 'center'
    },
    textOnline: {
        fontFamily: 'Roboto',
        fontSize: 12,
        color: '#BCBCBC'
    },
    contTravelCash: {
        alignItems: 'center',
        width: '30%',
        marginTop: 8
    },
    textTravelCash: {
        fontFamily: 'Roboto',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#282F39'
    },
    textTravelCashDesc: {
        fontFamily: 'Roboto',
        fontSize: 12,
        color: '#BCBCBC',
        textAlign: 'center'
    },
    btnAccountExtract: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center',
        marginTop: 30
    },
    textExtract: {
        fontFamily: 'Roboto',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#282F39'
    },
    textExtracDates: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: '#BCBCBC'
    },
    btnTransactions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        alignSelf: 'center',
        marginTop: 30,
        marginBottom: 15
    },
    contArrow: {
        alignItems: 'center',
        flexDirection: 'row'
    },
    contRowItem: {
        alignItems:
            'flex-start'
    },
    textRecentTransac: {
        fontFamily: 'Roboto',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#282F39'
    },
    textTransacSald: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: '#BCBCBC'
    },

})

export default ReportScreen;