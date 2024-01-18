import React, { Component } from 'react'
import { View, StyleSheet, BackHandler,Platform, Text } from 'react-native'


// Custom Components
import Loader from "./src/Functions/Loader"
import Toolbar from './src/Functions/Toolbar'
import TitleHeader from './src/Functions/TitleHeader'
import ReportScreen from './src/ReportScreen'

//moment date
import moment from 'moment'

// Provider API
import Api from "./src/Functions/Api";


import GLOBAL from './src/Functions/Global.js'

class Finance extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            total: 0,
            arrayLineGraphic: [],
            arrayReport: [],
            firstDayWeek: null,
            firstDate: null,
            lastDayWeek: null,
            lastDate: null,
            reportData: null
        }

        GLOBAL.lang = this.props.lang;
        GLOBAL.color = this.props.PrimaryButton;

        GLOBAL.appUrl = this.props.appUrl;
        GLOBAL.removeCardUrl = this.props.removeCardUrl;
        GLOBAL.id = this.props.id;
        GLOBAL.token = this.props.token;
        GLOBAL.type = this.props.type;
        GLOBAL.socket_url = GLOBAL.socket_url ? GLOBAL.socket_url : props.socket_url;


        this.api = new Api();

        //Get the lang from props. If hasn't lang in props, default is pt-BR
        this.strings = require('./src/langs/pt-BR.json');
        if(GLOBAL.lang) {
            if(GLOBAL.lang == "pt-BR") {
                this.strings = require('./src/langs/pt-BR.json');
            } 
            // if is english
            else if(GLOBAL.lang.indexOf("en") != -1) {
                this.strings = require('./src/langs/en.json');
            }
        }


    }


    componentDidMount() {
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
			this.props.navigation.goBack()
			return true
        });
        
        let currentYear = moment().format('YYYY')
        this.getReport(currentYear)
        this.calcDaysWeek()
    }


    componentWillUnmount() {
		this.backHandler.remove();
    }
    
    /**
	 * return const navigate = this.props.navigation
	 */
	returnConstNavigate() {
		const { navigate } = this.props.navigation
		return navigate
    }
    

    /**
     * Take the first and last days of current week
     */
    calcDaysWeek() {
        
        if (GLOBAL.lang.indexOf("pt") === 0) {
            momentLocal = "pt"
        } else {
            momentLocal = "en"
        }

        let today = moment().locale(momentLocal)
        let begin = moment(today).isoWeekday(0)
        let end = moment(today).isoWeekday(6)
        this.setState({
            firstDayWeek: begin.format('DD MMM'),
            lastDayWeek: end.format('DD MMM'),
            firstDate: begin,
            lastDate: end
        })
    }


    getReport(year) {
        this.setState({ isLoading: true })

        const type = GLOBAL.type == 'user' ? GLOBAL.type : 'provider';

        this.api.GetReport(
            GLOBAL.appUrl,
            GLOBAL.id, 
            GLOBAL.token, 
            year,
            type
        )
        .then((json) => {
            this.setState({ isLoading: false })
            if (json.success == true) {
                let arrayResponse = []
                let lineGraphic = { labels: [], datasets: [] }
                let arrayValues = []
                let formattedList = []

                arrayResponse = json.finance

                let momentLocal = ''
                if (GLOBAL.lang.indexOf("pt") === 0) {
                    momentLocal = "pt"
                } else {
                    momentLocal = "en"
                }
                for (let i = 0; i < arrayResponse.length; i++) {
                    lineGraphic.labels.push(moment().locale(momentLocal).day(arrayResponse[i].day - 1).format('ddd'))
                    formattedList.push({ id: i, day: moment().locale(momentLocal).day(arrayResponse[i].day - 1).format('ddd'), value: arrayResponse[i].value, year: year })
                    this.props.currency === '₲' ? arrayValues.push(parseFloat(arrayResponse[i].value).toFixed(0)) : arrayValues.push(parseFloat(arrayResponse[i].value).toFixed(2));
                }


                lineGraphic.datasets.push({ data: arrayValues, strokeWidth: 2 })
                this.setState({
                    arrayLineGraphic: lineGraphic,
                    arrayReport: formattedList,
                    isLoading: false,
                    total: json.total_week,
                    reportData: json
                })
            } else {
                this.setState({ isLoading: false })

                // #TODO - colocar mensagem de erro aqui
                // parse.showToast(strings("error.try_again"), Toast.durations.LONG)
            }
        })
        .catch((error) => {
            this.setState({ isLoading: false })
            console.error(error);
        });

    }


    openFilter() {

    }


    openEarnings = () => {
        if (this.state.firstDate !== null && this.state.lastDate !== null) {
            this.props.navigation.navigate('EarningsPeriodScreen',
                {
                    startDate: this.state.firstDate.format('DD/MM/YYYY'),
                    endDate: this.state.lastDate.format('DD/MM/YYYY'),
                    formattedStartDate: this.state.firstDayWeek,
                    formattedEndDate: this.state.lastDayWeek,
                    isHelp: this.props.isHelp,
                    appUrl: GLOBAL.appUrl,
                    removeCardUrl: GLOBAL.removeCardUrl,
                    PrimaryButton: this.props.PrimaryButton
                }
            )
        }
    }


    openTransactions = () => {
        this.props.navigation.navigate('TransactionsScreen')
    }


    openHelp() {
        this.props.navigation.navigate('HelpScreen')
    }


    render() {
        return (
            <View style={styles.container}>
                <Loader loading={this.state.isLoading} message={this.strings.loading_message} />
                <View style={{ marginTop: Platform.OS === 'android' ? 0 : 25 }}>
                    <Toolbar
                        back={true}
                        nextStep={false}
                        isHelp={this.props.isHelp}
                        handlePress={() => this.props.navigation.goBack()}
                        nextPress={() => { }}
                        helpPress={() => this.openHelp()}
                        PrimaryButton={this.props.PrimaryButton}
                    />
                    <TitleHeader
                        text={this.strings.yearReport}
                        align="flex-start"
                    />
                </View>
                
                {this.state.reportData && JSON.stringify(this.state.reportData) != "{}" ? (
                    <ReportScreen
                        openEarnings={this.openEarnings.bind()}
                        openTransactions={this.openTransactions.bind()}
                        getReport={this.getReport.bind(this)}
                        arrayReport={this.state.arrayReport}
                        lineGraphic={this.state.arrayLineGraphic}
                        firstDayWeek={this.state.firstDayWeek}
                        lastDayWeek={this.state.lastDayWeek}
                        reportData={this.state.reportData}
                        PrimaryButton={this.props.PrimaryButton}
                        requestType={this.props.requestType ? this.props.requestType : this.strings.racing}
                    />
                ) : null}

            </View>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fbfbfb'
    },
})

export default Finance;
