import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  BackHandler,
  Dimensions,
  Image,
  ScrollView,
  Alert,
  Linking,
  SafeAreaView
} from "react-native";

const listWidth = Dimensions.get('window').width - 60;

import GLOBAL from './Functions/Global.js';
import Icon from 'react-native-vector-icons/FontAwesome';
import Images from "./img/Images";
import Api from "./Functions/Api";
import Loader from "./Functions/Loader"
import { NavigationEvents } from "react-navigation";
import { useIsFocused } from "@react-navigation/native";
import Toast from "./Functions/Toast";
import { languages } from './langs/index.js';
import { handleException } from './Services/handlerException.js';

const AddBalanceScreen = (props) => {
  GLOBAL.lang = GLOBAL.lang ? GLOBAL.lang : props.lang;
  GLOBAL.color = GLOBAL.color ? GLOBAL.color : props.PrimaryButton;
  GLOBAL.navigation_v5 = GLOBAL.navigation_v5 ? GLOBAL.navigation_v5 : props.navigation_v5;

  GLOBAL.appUrl = GLOBAL.appUrl ? GLOBAL.appUrl : props.appUrl;
  GLOBAL.removeCardUrl = GLOBAL.removeCardUrl ? GLOBAL.removeCardUrl : props.removeCardUrl;
  GLOBAL.id = GLOBAL.id ? GLOBAL.id : props.id;
  GLOBAL.token = GLOBAL.token ? GLOBAL.token : props.token;
  GLOBAL.type = GLOBAL.type ? GLOBAL.type : props.type;
  GLOBAL.socket_url = GLOBAL.socket_url ? GLOBAL.socket_url : props.socket_url;

  GLOBAL.toolbar = GLOBAL.toolbar ? GLOBAL.toolbar : props.toolbar;
  GLOBAL.titleHeader = GLOBAL.titleHeader ? GLOBAL.titleHeader : props.titleHeader;

  const [hasBalanceScreen, setHasBalanceScreen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [addBalanceActive, setAddBalanceActive] = useState(false);
  const [referralBalance, setReferralBalance] = useState(0);
  const [cumulatedBalanceMonthly, setCumulatedBalanceMonthly] = useState(0);
  const [isCustomIndicationEnabled, setIsCustomIndicationEnabled] = useState(false);
  const [programName, setProgramName] = useState("");

  const [settings, setSettings] = useState({
    prepaid_min_billet_value: "0",
    prepaid_tax_billet: "0",
    prepaid_billet_user: "0",
    prepaid_billet_provider: "0",
    prepaid_card_user: "0",
    prepaid_card_provider: "0",
    with_draw_enabled: false,
  });

  const isUser = GLOBAL.type == "user";
  const withDrawalScreen = props.withDrawalScreen ? props.withDrawalScreen : '';

  // i18n
  var strings = languages(props);

  const api = new Api();

  if (GLOBAL.navigation_v5) {
    const isVisible = useIsFocused();
    useEffect(() => {
      if (isVisible) {
        getCardsAndBalanceInfo();
      }
    }, [isVisible]);
  }

  useEffect(() => {
    const backAction = () => {
      props.navigation.goBack()
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  const isBallance = () => {
    let value = '';
    if (typeof currentBalance == "string") {
      if (currentBalance.includes('R$')) {
        value = currentBalance.replace('R$', '');
        value = value.replace('.', '');
        value = value.replace(',', '.');
      } else if (currentBalance.includes('$')) {
        value = currentBalance.replace('$', '');
      } else {
        value = currentBalance;
      }
      value = parseFloat(value);
      return value > 0;
    }
    return parseFloat(currentBalance) > 0;
  }

  /**
   * Get balance info & settings
   */
  const getCardsAndBalanceInfo = () => {
    setIsLoading(true);
    api.GetCardsAndBalance(
      GLOBAL.appUrl,
      GLOBAL.id,
      GLOBAL.token,
      GLOBAL.type
    )
      .then((json) => {
        let isBalanceActive = false;
        if (json && json.settings) {
          if (GLOBAL.type == "user") {
            isBalanceActive =
              json.settings.prepaid_billet_user == "1" ||
              json.settings.prepaid_card_user == "1" ? true : false;
          } else if (GLOBAL.type == "provider") {
            isBalanceActive =
              json.settings.prepaid_billet_provider == "1" ||
              json.settings.prepaid_card_provider == "1" ? true : false;
          }
          setHasBalanceScreen(props.hasBalanceScreen == 0 ? false : true);
          setCurrentBalance(json.current_balance);
          setSettings(json.settings);
          setAddBalanceActive(isBalanceActive);
          setReferralBalance(json.referralBalance);
          setCumulatedBalanceMonthly(json.cumulated_balance_monthly);
          setIsCustomIndicationEnabled(json.settings.indication_settings ? json.settings.indication_settings.isCustomIndicationEnabled : false);
          setProgramName(json.settings.indication_settings ? json.settings.indication_settings.program_name : false);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        handleException({ errorInfo: "AddBalanceScreen.getCardsAndBalanceInfo", error: error });
        setIsLoading(false);
      })

    setIsLoading(false);
  }

  const alertOk = (title, msg) => {
    Alert.alert(
      title, msg,
      [{ text: "Ok" },],
      { cancelable: false }
    );
  }

  const goToWithDrawal = () => {
    props.navigation.navigate(withDrawalScreen,
      {
        originScreen: 'AddBalanceScreen'
      }
    )
  }

  const infoTotal = () => {
    Toast.showToast(strings.infoTotal)
  }

  const infoMonthly = () => {
    Toast.showToast(strings.infoMonthly)
  }

  return (
    <View style={styles.container}>
      {!GLOBAL.navigation_v5 ? (
        <NavigationEvents
          onWillFocus={() => {
            getCardsAndBalanceInfo();
          }}
        />
      ) : null}

      <ScrollView>
        <Loader loading={isLoading} message={strings.loading_message} />
        {!isLoading && hasBalanceScreen == true ? (
          <SafeAreaView>
            {/* Header */}
            {GLOBAL.toolbar ? (
              <View>
                <GLOBAL.toolbar
                  back={true}
                  handlePress={() => props.navigation.navigate('MainScreen')}
                />

                <GLOBAL.titleHeader
                  text={strings.add_balance}
                  align="flex-start"
                />
              </View>
            ) :
              <View style={{ flex: 1, flexDirection: "row" }}>
                <TouchableOpacity
                  onPress={() => props.navigation.goBack()}
                >
                  <Text style={{ fontSize: 20, paddingLeft: 20, paddingTop: 20, fontWeight: "bold" }}>X</Text>
                </TouchableOpacity>
                <View style={{
                  position: 'absolute',
                  width: Dimensions.get('window').width,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                >
                  <Text style={{ top: 20, fontWeight: "bold", fontSize: 20 }}>{strings.add_balance}</Text>
                </View>
              </View>
            }
          </SafeAreaView>
        ) : null}

        {/* Conteúdo */}
        <View style={{ flex: 4, marginTop: 5 }}>
          <View style={{ flex: 1, paddingHorizontal: 20, marginBottom: 10 }}>
            {!isLoading && hasBalanceScreen == true ? (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={styles.currentValueText}>{strings.currentBalance}</Text>
                <Text style={styles.currentValue}>{currentBalance}</Text>
              </View>
            ) : null}

            {isCustomIndicationEnabled ? (
              <View style={styles.indicationContainer}>
                <Text style={[styles.currentValueText, { marginBottom: 10, marginTop: 10 }]}>{programName}</Text>
                <View style={styles.cardContainer}>
                  {referralBalance !== 0 ? (
                    <TouchableOpacity style={styles.card} onPress={() => infoTotal()}>
                      <View style={styles.cardText}>
                        <Text style={styles.indicationValueText}>{strings.total}</Text>
                        <Text style={styles.indicationValue}>{referralBalance}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}

                  {cumulatedBalanceMonthly !== 0 ? (
                    <TouchableOpacity style={styles.card} onPress={() => infoMonthly()}>
                      <View style={styles.cardText}>
                        <Text style={styles.indicationValueText}>{strings.cumulated_balance_monthly}</Text>
                        <Text style={styles.indicationValue}>{cumulatedBalanceMonthly}</Text>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ) : null}
          </View>

          {/* Saque (se aplicável) */}
          {isUser && isBallance() && settings.with_draw_enabled == 1 ? (
            <View style={{ flex: 1, marginTop: 20 }}>
              <TouchableOpacity
                style={styles.listTypes}
                onPress={() => {
                  goToWithDrawal();
                }}
              >
                <View style={{ flex: 0.2 }}>
                  <Image
                    style={{ flex: 1, width: 30, height: 30, resizeMode: 'contain' }}
                    source={Images.icon_bank_profile} />
                </View>

                <View style={{ flex: 0.7 }}>
                  <Text style={{ fontWeight: 'bold' }}>{strings.make_widthdrawal}</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ====== BOTÃO ÚNICO (sem valor avulso) ====== */}
          {hasBalanceScreen == true ? (
            <TouchableOpacity
              style={styles.listTypes}
              onPress={() => Linking.openURL('https://formbricks.masterbiz.co/s/cmfh1hp410001qi01nvleqq45')}
            >
              <View style={{ flex: 0.2 }}>
                <Icon name="external-link" size={40} />
              </View>
              <View style={{ flex: 0.7 }}>
                <Text style={{ fontWeight: 'bold' }}>
                  {strings.add_balance || 'Adicionar saldo'}
                </Text>
                <Text style={{ opacity: 0.7 }}>
                  Você será redirecionado para o formulário
                </Text>
              </View>
            </TouchableOpacity>
          ) : null}
          {/* =========================================== */}
        </View>
      </ScrollView>
    </View>
  )
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
    textAlign: 'center',
  },
  indicationContainer: {
    marginTop: 10,
    alignItems: "flex-start",
  },
  removeCard: {
    height: 15,
    width: 15,
    marginTop: 5,
    marginLeft: 10
  },
});

export default AddBalanceScreen;
