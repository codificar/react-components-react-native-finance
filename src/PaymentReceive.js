import React, { useRef, useState, useEffect } from "react"
import { FlatList } from "react-native";
import Feather from 'react-native-vector-icons/Feather';
import Api from "./Functions/Api";
import Loader from "./Functions/Loader";
import Toolbar from './Functions/Toolbar';
import TitleHeader from './Functions/TitleHeader';
import {
    View,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';
import Images from "./img/Images";

const PaymentReceive = (props) => {

  const api = new Api();

  const [isLoading, setIsLoading] = useState(true);
  const [payment, setPayment] = useState([]);
  const [provider_payments_selected, setprovider_payments_selected] = useState([]);
  const paymentInfo = useRef([]);
  const paymentsLoaded = useRef(false);

  const paymentImages = {
    payment_card: Images.iconCard,
    payment_money: Images.iconMoney,
    payment_carto: Images.iconCarto,
    payment_machine: Images.iconMachine,
    payment_crypt: Images.iconcryptoCurrency,
    payment_debitCard: Images.iconCard,
    payment_balance: Images.payment_balance,
    payment_billing: Images.payment_billing,
    payment_gateway_pix: Images.icon_pix,
    payment_direct_pix: Images.icon_pix
  }

  var strings = require('./langs/pt-BR.json');
  if(props.lang) {
      if(props.lang == "pt-BR") {
          strings = require('./langs/pt-BR.json');
      }
      else if(props.lang == ("es-PY")) {
        strings = require('./langs/es-PY.json');
      }
      // if is english
      else if(props.lang.indexOf("en") != -1) {
          strings = require('./langs/en.json');
      }
  }

  const updateProviderPayment = () => {
    setIsLoading(true);
    api.setProviderPayment(
      props.appUrl,
      props.id,
      props.token,
      provider_payments_selected
    ).then(result => {
      setIsLoading(false);
    })
  }

  const handleSelect = (id) => {
    setIsLoading(true);
    const alreadySelected = provider_payments_selected.findIndex(item => item === id);

    if (alreadySelected >= 0) {
        const filteredItems = provider_payments_selected.filter(item => item !== id);
        setprovider_payments_selected(filteredItems);
        setIsLoading(false);
    } else {
        setprovider_payments_selected([...provider_payments_selected, id]);
        setIsLoading(false);
    }
  }

  const getProviderPayment = () => {
    api.getProviderPayment(
      props.appUrl,
      props.id,
      props.token
    ).then(result => {
      var payments_selected = result.provider_payments.map(item => { return item.payment_id })
      setprovider_payments_selected(payments_selected);
      setIsLoading(false);
      paymentsLoaded.current = true;
    })
  }

  const buildPaymentCards = () => {
    let paymentCards = [];
    paymentInfo.current.forEach(payment => {
      paymentCards.push({
        id: payment.index,
        name: payment.custom_name ? payment.custom_name : strings[payment.key],
        flag: paymentImages[payment.key],
        disabled: !payment.active
      })
    })
    setPayment(paymentCards);
  }

  const getPaymentData = () => {
    api.getPaymentInfo(
      props.appUrl
    ).then(result => {
      paymentInfo.current = result;
      buildPaymentCards();
    })
  }

  useEffect(() => {
    Promise.all([getPaymentData(), getProviderPayment()]);
  },[]);

  useEffect(() => {
    if(paymentsLoaded.current)
      updateProviderPayment();
  },[provider_payments_selected]);

  return (
    <>
      {!props.disableHeader && 
        <View style={{ marginTop: Platform.OS === 'android' ? 0 : 25 }}>
          <Toolbar
              back={true}
              handlePress={() => props.navigation.goBack()}
          />
          <TitleHeader
              text={strings.manage_payment_title}
              align="flex-start"
          />
        </View>
      }
      <Loader loading={isLoading} message={strings.loading_message} />

      <View style={styles.parentContainer}>
        <FlatList
          data={payment}
          extraData={payment}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            !item.disabled &&
            <TouchableOpacity
              key={item.id}
              disabled={item.disabled}
              style={styles.card}
              activeOpacity={0.6}
              onPress={() => handleSelect(item.id)}
            >
              <Image style={styles.flag} source={item.flag} />
              <Text style={[styles.textMessage, { color: item.disabled ? "#C3C3C3" : "#222" }]}>{item.name}</Text>
              {provider_payments_selected.includes(item.id) && (
                <View style={styles.iconCheck}>
                  <Feather name="check" size={18} color={'#86ba52'} />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
    parentContainer: {
        flex: 1,
        backgroundColor: "#FBFBFB",
        padding: 0,
        paddingHorizontal: 25,
    },
    areaMessageAvaliate: {
        paddingHorizontal: 3,
    },
    card: {
        flexDirection: "row",
        justifyContent: "center",
        width: "100%",
        marginBottom: 15,
        paddingVertical: 15,
        backgroundColor: "#fff",
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    textMessage: {

        fontSize: 16,
    },
    iconCheck: {
        position: "absolute",
        right: 20,
        alignSelf: "center",
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d9f2e1',
        borderRadius: 12,
        height: 23,
        width: 38,
    },
    flag: {
        resizeMode: 'contain',
        position: "absolute",
        left: 20,
        alignSelf: "center",
        justifyContent: 'center',
        alignItems: 'center',
        height: 23,
        width: 38,
    },
})

export default PaymentReceive;
