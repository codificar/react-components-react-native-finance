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

        this.api = new Api();

        //Get the lang from props. If hasn't lang in props, default is pt-BR
        this.strings = require('./src/langs/pt-BR.json');
        if(this.props.lang) {
            if(this.props.lang == "pt-BR") {
                this.strings = require('./src/langs/pt-BR.json');
            } 
            // if is english
            else if(this.props.lang.indexOf("en") != -1) {
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
        
        if (this.props.lang.indexOf("pt") === 0) {
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
        console.log("provider id da tela finance: ", this.props.providerId);

        this.api.GetReport(
            this.props.appUrl,
            this.props.providerId, 
            this.props.providerToken, 
            year
        )
        .then((json) => {
            this.setState({ isLoading: false })
            console.log('response report: ', json)
            if (json.success == true) {
                console.log("1");
                let arrayResponse = []
                let lineGraphic = { labels: [], datasets: [] }
                let arrayValues = []
                let formattedList = []

                arrayResponse = json.finance

                let momentLocal = ''
                if (this.props.lang.indexOf("pt") === 0) {
                    momentLocal = "pt"
                } else {
                    momentLocal = "en"
                }

                for (let i = 0; i < arrayResponse.length; i++) {
                    lineGraphic.labels.push(moment().locale(momentLocal).day(arrayResponse[i].day - 1).format('ddd'))
                    arrayValues.push(parseFloat(arrayResponse[i].value).toFixed(2))
                    formattedList.push({ id: i, day: moment().locale(momentLocal).day(arrayResponse[i].day - 1).format('ddd'), value: arrayResponse[i].value, year: year })
                }

                console.log('formattedList: ', formattedList)
                console.log('lineGraphic: ', lineGraphic)

                lineGraphic.datasets.push({ data: arrayValues, strokeWidth: 2 })
                console.log("depois setstate: ", json);
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
            console.log("caiu no catch:");
            this.setState({ isLoading: false })
            console.error(error);
        });

    }


    openFilter() {

    }


    openEarnings = () => {
        console.log("app url no index: ", this.props.appUrl);
        if (this.state.firstDate !== null && this.state.lastDate !== null) {
            console.log("antes de navegar: ", this.props.providerId);
            this.props.navigation.navigate('EarningsPeriodScreen',
                {
                    providerId: this.props.providerId,
                    token: this.props.providerToken,
                    startDate: this.state.firstDate.format('DD/MM/YYYY'),
                    endDate: this.state.lastDate.format('DD/MM/YYYY'),
                    formattedStartDate: this.state.firstDayWeek,
                    formattedEndDate: this.state.lastDayWeek,
                    isHelp: this.props.isHelp,
                    appUrl: this.props.appUrl,
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
                <Loader loading={this.state.isLoading} message={this.loading_message} />
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
                        currency={this.strings.profileProvider}
                        firstDayWeek={this.state.firstDayWeek}
                        lastDayWeek={this.state.lastDayWeek}
                        reportData={this.state.reportData}
                        PrimaryButton={this.props.PrimaryButton}
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
