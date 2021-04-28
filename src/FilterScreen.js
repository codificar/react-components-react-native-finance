import React, { Component } from "react"
import {
  Text,
  BackHandler,
  View,
  StyleSheet,
  PixelRatio,
  TouchableOpacity,
  Platform
} from "react-native"

//moment date
import moment from 'moment'

// Custom Components
import Toolbar from './Functions/Toolbar'
import TitleHeader from './Functions/TitleHeader'

//Calendar
import CalendarPicker from 'react-native-calendar-picker'

import GLOBAL from './Functions/Global.js'

let week = []
let months = []


class FilterScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      selectedStartDate: null,
      selectedEndDate: null,
      originScreen: this.props.navigation.state.params.originScreen
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

    if (GLOBAL.lang.indexOf("pt") === 0) {
      week = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
      months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    } else {
      week = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
      months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec']
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


  sendIntervalDates() {
    let startDate = null
    let formattedStartDate = null
    let endDate = null
    let formattedEndDate = null
    if (this.state.selectedStartDate) {
      startDate = moment(this.state.selectedStartDate).format('DD/MM/YYYY')
      formattedStartDate = moment(this.state.selectedStartDate).format('DD MMM')
    }
    if (this.state.selectedEndDate) {
      endDate = moment(this.state.selectedEndDate).format('DD/MM/YYYY')
      formattedEndDate = moment(this.state.selectedEndDate).format('DD MMM')
    }

    if (this.state.originScreen == 'EarningsPeriodScreen') {
      this.props.navigation.navigate('EarningsPeriodScreen', {
        startDate: startDate,
        endDate: endDate,
        formattedStartDate: formattedStartDate,
        formattedEndDate: formattedEndDate
      })
    }
  }



  render() {
    let borderSelectedDay = this.state.selectedEndDate != null ? 0 : 20
    const today = moment().format("YYYY-MM-DD")
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
            text={this.strings.filterSearch}
            align="flex-start"
          />
        </View>

        <View>
          <CalendarPicker
            weekdays={week} months={months}
            nextTitle={this.strings.next}
            previousTitle={this.strings.previous}
            maxDate={today}
            allowRangeSelection={true}
            selectedDayColor={this.props.navigation.state.params.PrimaryButton}
            selectedDayTextColor={"#fff"}
            onDateChange={(date, type) => this.onDateChange(date, type)}
            selectedRangeStartStyle={{ borderBottomRightRadius: borderSelectedDay, borderTopRightRadius: borderSelectedDay }}
          />
          <TouchableOpacity style={[styles.btnOverlay, {backgroundColor: this.props.navigation.state.params.PrimaryButton}]} onPress={() => this.sendIntervalDates()}>
            <Text style={styles.txtSend}>{this.strings.send}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}


const styles = StyleSheet.create({
  parentContainer: {
    flex: 1,
    backgroundColor: "#ffffff"
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
    // paddingHorizontal: 5,
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
    //marginBottom: 15,
    //borderBottomWidth: 0.5,
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
    marginTop: 20,
    //marginBottom: 30,
  },
  txtSend: {
    fontFamily: 'Roboto',
    color: "#fff",
    fontWeight: 'bold'
  },
})



export default FilterScreen;