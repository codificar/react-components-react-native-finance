import React, { Component } from "react"
import {
    ActivityIndicator,
    Text,
    BackHandler,
    FlatList,
    View,
    Image,
    StyleSheet,
    PixelRatio,
    TouchableOpacity,
    ScrollView,
    Platform
} from "react-native"
import { Icon, Divider } from 'react-native-elements'

import Api from "./Functions/Api";

//moment date
import moment from 'moment'

// Custom Components
import Loader from "./Functions/Loader"
import Toolbar from './Functions/Toolbar'
import TitleHeader from './Functions/TitleHeader'

import GLOBAL from './Functions/Global.js';

class EarningsPeriodScreen extends Component {
    constructor(props) {
        super(props)
        this.param = this.props.navigation.state != undefined ? this.props.navigation.state.params: this.param;
        this.state = {
            iniciate: 0,
            dateInitial: this.param.startDate,
            dateFinal: this.param.endDate,
            formattedStartDate: this.param.formattedStartDate,
            formattedEndDate: this.param.formattedEndDate,
            isLoading: false,
            financialData: [],
            isLoadingSummary: false,
            totalByPeriod: "0",
            current_balance: "0",
            nextPageUrl: null,
            providerId: GLOBAL.id,
            token: GLOBAL.token,
            provider_prepaid: false,
            currency: ""
        }

        this.api = new Api();

        this.willFocus = this.props.navigation.addListener("willFocus", () => {
            //Toda vez que entra na tela, pega os params novamente, para atualizar os dados da tela
            this.param = this.props.navigation.state != undefined ? this.param : this.props.route.params;
            this.getCheckingAccount()
        })

        this.willFocus = this.props.navigation.addListener("focus", () => {
            //Toda vez que entra na tela, pega os params novamente, para atualizar os dados da tela
            this.param = this.props.navigation.state != undefined ? this.param : this.props.route.params;
            this.getCheckingAccount()
        })

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

        this.loading_message = this.strings.Loading;

    }

    nameReason(reason) {
        switch (reason) {
            case "SIMPLE_INDICATION":
            case "COMPENSATION_INDICATION":
            case "SEPARATE_CREDIT":
            case "WITHDRAW":
            case "RIDE_CANCELLATION_CREDIT":
            case "RIDE_PAYMENT":
            case "AUTO_WITHDRAW":
            case "RIDE_CREDIT":
                return 'credit'
                break;
            case "RIDE_DEBIT":
            case "RIDE_LEDGER":
            case "SEPARATE_DEBIT":
            case "RIDE_CANCELLATION_DEBIT":
            case "RIDE_PAYMENT_FAIL_DEBIT":
                return 'debit'
                break;
        }
    }

    getStyleRow(reason) {
        switch (reason) {
            case "SIMPLE_INDICATION":
            case "COMPENSATION_INDICATION":
            case "SEPARATE_CREDIT":
            case "WITHDRAW":
            case "RIDE_CANCELLATION_CREDIT":
            case "RIDE_PAYMENT":
            case "AUTO_WITHDRAW":
            case "RIDE_CREDIT":
                return "#ffff00"
                break;
            case "RIDE_DEBIT":
            case "RIDE_LEDGER":
            case "SEPARATE_DEBIT":
            case "RIDE_CANCELLATION_DEBIT":
            case "RIDE_PAYMENT_FAIL_DEBIT":
                return 'tomato'
                break;
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


    getAccountSummary() {
        if (this.state.nextPageUrl != null) {
            this.setState({ isLoading: true })
            this.api.GetAccountSummary(
                this.state.nextPageUrl,
                this.state.providerId,
                this.state.token,
                this.param.startDate,
                this.param.endDate
            )
            .then((json) => {
                if (json.detailed_balance.data.length > 0) {
                    this.setState({
                        financialData: [...this.state.financialData, ...json.detailed_balance.data],
                        nextPageUrl: json.detailed_balance.next_page_url,
                    })
                }
            })
            .catch((error) => {
                console.error(error);
            }).finally(() => {
              this.setState({ isLoading: false })
            });
        }
    }


    getCheckingAccount() {
        this.setState({ isLoading: true })

        const type = GLOBAL.type == 'user' ? GLOBAL.type : 'provider';
        this.param = this.props.navigation.state != undefined ? this.props.navigation.state.params: this.param;
        
        this.api.GetCheckingAccount(
            this.param.appUrl,
            this.state.providerId,
            this.state.token,
            this.param.startDate,
            this.param.endDate,
            type
        )
        .then((json) => {
            this.setState({ isLoading: false })
            let finances = json.detailed_balance.data;

            this.setState({
                nextPageUrl: json.detailed_balance.next_page_url,
                provider_prepaid: json.provider_prepaid,
                isLoading: false
            });
            if (this.state.iniciate == 0) {
                this.setState({
                    financialData: finances,
                    totalByPeriod: json.period_balance_formatted,
                    current_balance: json.current_balance_formatted,
                    iniciate: 1
                })
            } else {
                this.setState({
                    financialData: finances,
                    totalByPeriod: json.period_balance_formatted,
                    current_balance: json.current_balance_formatted
                })
            }
        })
        .catch((error) => {
            this.setState({ isLoading: false })
            // parse.showToast(strings("error.try_again"), Toast.durations.LONG)
            console.log(error)
        });

    }


    renderFooter = (type) => {
        if (!this.state.isLoadingSummary) return null
        return (
            <View style={styles.loading}>
                <ActivityIndicator animating />
            </View>
        )
    }


    renderValue = (item) => {
        let typeValue = this.nameReason(item.reason)
        if (typeValue == 'credit') {
            return (
                <Text style={{color: GLOBAL.color, fontFamily: 'Roboto',fontSize: 16,fontWeight: 'bold', marginRight: 15}}>
                    {item.value_formatted}
                </Text>
            )
        } else {
            return (
                <Text style={styles.negativeValue}>
                    ({item.value_formatted})
                </Text>
            )
        }
    }


    openFilter() {
        this.props.navigation.navigate('FilterScreen', {
            originScreen: 'EarningsPeriodScreen',
            PrimaryButton: this.param.PrimaryButton
        })
    }

    openAddBalanceScreen() {
        this.props.navigation.navigate('AddBalanceScreen',
            {
                originScreen: 'EarningsPeriodScreen',
            }
        )
    }

    openEarningDetail(item) {
        this.props.navigation.navigate('EarningDetailScreen', { item: item })
    }


    onDateChange(date, type) {
        if (type === 'END_DATE') {
            this.setState({
                selectedEndDate: date,
            })
        } else {
            this.setState({
                selectedStartDate: date,
                selectedEndDate: null,
            })
        }
    }


    openHelp() {
        this.props.navigation.navigate('HelpScreen')
    }


    render() {
        return (
            <View style={styles.parentContainer}>
                {/* Flex 8/10 */}
                <View style={{flex: 9}}>
                    <Loader loading={this.state.isLoading} message={this.strings.loading_message} />
                    <View style={{ marginTop: Platform.OS === 'android' ? 0 : 25 }}>
                        <Toolbar
                            back={true}
                            nextStep={false}
                            isFilter={true}
                            isHelp={this.param.isHelp}
                            handlePress={() => this.props.navigation.goBack()}
                            nextPress={() => { }}
                            filterPress={() => this.openFilter()}
                            helpPress={() => this.openHelp()}
                        />
                        <TitleHeader
                            text={this.strings.reportDetail}
                            align="flex-start"
                        />
                    </View>
                    <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                        <View style={{paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles.currentValueText}>{this.strings.currentBalance}</Text>
                            <Text style={styles.currentValueText}>{this.strings.currentBalanceMsg}</Text>
                            <Text style={styles.currentValue}>{this.state.current_balance}</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={styles.currentValueText}>{this.strings.periodValues}</Text>
                            <Text style={styles.currentValueText}>{this.param.formattedStartDate} - {this.param.formattedEndDate}</Text>
                            <Text style={styles.currentValue}>{this.state.totalByPeriod}</Text>
                        </View>
                    </View>

                    <View style={{flex: 1}}>
                      {this.state.financialData == '' ?
                          <View style={styles.areaBlankState}>
                              <Image
                                  source={require('./img/icon_balnk_state.png')}
                                  style={styles.imgBlankState}
                              />
                              <Text style={styles.txtBlankState}>
                                  {this.strings.blank_state_message_filter}
                              </Text>
                          </View>
                      :
                          <View style={{marginTop: 10, flex: 1}}>
                          <FlatList
                              data={this.state.financialData}
                              onEndReached={() => this.getAccountSummary()}
                              onEndReachedThreshold={0.1}
                              ref={(ref) => { this.flatListRef = ref }}
                              keyExtractor={(x, i) => i.toString()}
                              ListFooterComponent={() => this.renderFooter()}
                              renderItem={({ item, index }) => (
                                  <TouchableOpacity onPress={() => this.openEarningDetail(item)}>
                                      <View style={styles.itemList}>
                                          <View>
                                              <Text style={styles.textDate}>{moment(item.compensation_date).format('DD MMM')}</Text>
                                              <Text style={styles.textHour}>{moment(item.compensation_date).format('HH:mm')}</Text>
                                          </View>
                                          <View style={styles.contLastColumn}>
                                              {this.renderValue(item)}
                                              <Icon type='ionicon' name='ios-arrow-forward' size={20} />
                                          </View>
                                      </View>
                                      <Divider style={styles.divider} />
                                  </TouchableOpacity>
                              )}
                          />
                          </View>
                      }
                    </View>
                </View>
                {/* Flex 1/10 */}
                {this.state.provider_prepaid ?
                    <View style={{ flex: 1, justifyContent: 'center' }}>{/* Flex vertical of 1/10 */}
                        <TouchableOpacity
                            style={{ borderRadius: 3, padding: 10, elevation: 2,marginHorizontal: 30, backgroundColor: GLOBAL.color }}
                            onPress={() =>  this.openAddBalanceScreen()}
                        >
                            <Text style={{color: 'white', fontSize: 16, fontWeight: "bold", textAlign: "center" }}>{this.strings.add_balance}</Text>
                        </TouchableOpacity>
                    </View>
                : null}
              </View>
        )
    }
}


const styles = StyleSheet.create({
    parentContainer: {
        flex: 1,
        backgroundColor: "#ffffff",
        padding: 0
    },
    imgBlankState: {
        width: 150,
        height: 150
    },
    areaBlankState: {
        flex: 1,
        alignItems: "center",
        paddingTop: 100,
    },
    txtBlankState: {
        fontSize: 17,
        textAlign: "center",
        fontWeight: "bold",
        paddingHorizontal: 30,
        color: "#cccccc"
    },
    areaDatepicker: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    boxFilter: {
        flex: 0.5,
        right: 1,
        left: 1,
        padding: 7,
        marginRight: 5,
        marginLeft: 5,
        borderTopColor: "#fff",
        borderTopWidth: 0.8,
        borderBottomWidth: 0.8,
        borderBottomColor: "#fff",
    },
    checkingAccountTitleBox: {
        marginTop: 10,
    },
    checkingAccountTitle: {
        fontSize: 20,
        textAlign: "center",
        fontWeight: "bold",
        color: "#647792"
    },
    containerBalance: {
        alignItems: "center",
    },
    areaTotalBalanceByPeriod: {
        flexDirection: "row",
        flexWrap: "wrap",
        bottom: 5,
        paddingTop: 20,
        shadowColor: "#000",
        height: 40,
        maxHeight: 40,
    },
    areaTotalBalance: {
        flexDirection: "row",
        flexWrap: "wrap",
        bottom: 0,
        height: 40,
        maxHeight: 40,
    },
    areaIconTotalBalance: {
        flex: 0.7,
        flexDirection: "row",
        flexWrap: "wrap"
    },
    iconBalance: {
        width: 20,
        height: 20,
        marginRight: 10,
        marginTop: 0
    },
    areaBalanceContainer: {
        zIndex: 0,
        left: 0,
        right: 0,
        bottom: 0,
        top: 5,
    },
    headerSectionContainer: {
        flex: 3
    },
    footerSectionContainer: {
        flex: 7
    },
    summaryContainer: {
        flex: 1
    },
    flatListViewContainer: {
        // borderWidth: 1,
        // borderColor: "red"
    },
    itemRowHead: {
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#ffff00",
        marginBottom: 2
    },
    itemRow: {
        flexDirection: "row",
        borderBottomWidth: 1.5,
        borderBottomColor: "#fff",
        width: '90%',
        alignSelf: 'center',
        padding: 25
    },
    loading: {
        alignItems: "center",
        backgroundColor: "#ffffff",
    },
    titleTable: {
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: 15,
        borderTopWidth: 1 / PixelRatio.get(),
        borderTopColor: "#fff",
        paddingTop: 15
    },
    itensInline: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
    columnRowThree: {
        flex: 0.333333333,
        alignItems: "center"
    },
    txtRow: {
        textAlign: "center",
        fontSize: 13
    },
    txtRowDate: {
        textAlign: "center",
        fontSize: 13
    },
    txtRowType: {
        fontSize: 12,
        textAlign: "center"
    },
    txtRowCredit: {
        color: '#7aa7f0',
        textAlign: "center"
    },
    txtRowDebit: {
        color: "#4B74FF",
        textAlign: "center"
    },
    itemRowTxt: {
        fontWeight: "bold",
        color: "#fbfbfb"
    },
    areaSaldo: {
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1,
        alignItems: 'center',
        backgroundColor: "#fbfbfb",
        bottom: 0,
        paddingTop: 5,
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 5 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
        height: 60,
        maxHeight: 60,
        paddingTop: 14,
        borderTopWidth: 1 / PixelRatio.get()
    },
    styleSaldo: {
        fontFamily: 'Roboto',
        fontSize: 16,
        fontWeight: 'bold',
        color: "#374750"
    },
    valueSaldo: {
        fontFamily: 'Roboto',
        fontSize: 18,
        fontWeight: "bold",
        flex: 0.3,
    },
    areaIconSaldo: {
        flex: 0.7,
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: 'center'
    },
    iconSaldo: {
        width: 30,
        height: 30,
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 10
    },
    itemList: {
        width: '80%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    overlay: {
        padding: 20,
        width: '80%'
    },
    btnOverlay: {
        shadowColor: "#000",
        shadowOffset: { width: 1, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 5,
        borderRadius: 5,
        overflow: "hidden",
        width: window.width,
        alignItems: "center",
        padding: 10,
        marginLeft: 30,
        marginRight: 30,
        marginTop: 20
    },
    txtSend: {
        fontFamily: 'Roboto',
        color: "#fff",
        fontWeight: 'bold'
    },
    textPeriodValues: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: '#BCBCBC'
    },
    contSubtitle: {
        alignItems: 'center'
    },
    flat: {
        marginTop: 20
    },
    textDate: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: '#282F39'
    },
    textHour: {
        fontFamily: 'Roboto',
        fontSize: 14,
        color: '#d8d8d8'
    },
    divider: {
        backgroundColor: "#d3d3d3",
        width: '70%',
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 12
    },
    contLastColumn: {
        flexDirection: 'row'
    },
    negativeValue: {
        fontFamily: 'Roboto',
        fontSize: 16,
        color: 'tomato',
        fontWeight: 'bold',
        marginRight: 15
    },

    currentValueText: {
        fontSize: 15,
        color: "#bfbfbf",
        marginLeft: 5
      },
    currentValue: {
        fontSize: 20,
        color: "black",
        marginLeft: 5,
        fontWeight: "bold"
    },

})

export default EarningsPeriodScreen;
