// Modules
import React, { useEffect, useCallback, useState, useImperativeHandle } from 'react';

// Locales
import { languages } from '../langs/index';

import Api from "../Functions/Api";

// Styles
import { Container, Title, SubTitle } from './styles';

const API = new Api()

const BalanceButton = React.forwardRef(({url, show, style, data, navigation = undefined, ...props}, ref) => {
  const strings = languages(props);

  const [showRender, setShowRender] = useState(show)
  const [balance, setBalance] = useState()
  const [isLoad, setIsLoad] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = useCallback(async () => {
    try {
      if(!showRender || isLoad) return
      
      setIsLoad(true)
      const response = await API.getBalance(url, data.type, data.id, data.token)
      
      setShowRender(response.success)
      setIsLoad(false)
      
      if(!response.success) return
      
      setBalance(response.balance)
    } catch (error) {
      setIsLoad(false)
    }
    
  }, [API, showRender, isLoad])

  const handlePress = useCallback(() => {
    if(navigation) navigation()
  }, [navigation])

  useImperativeHandle(ref, () => ({
    loadBalance: loadData,
  }));

  if(!showRender || !balance) return null

  return (
    <Container
      style={{
        backgroundColor: style.backgroundColor || 'grey',
         ...style
      }}
      onPress={loadData}
      onLongPress={handlePress}
    >
      <Title style={{color: style.color || 'white'}}>{strings.balance}</Title>
      <SubTitle style={{color: style.color || 'white'}}>{balance}</SubTitle>
    </Container>
  );
})

export default BalanceButton
