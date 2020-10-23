//This file must be imported by the parent project that uses this model to function the navigation
//Este arquivo deve ser importado pelo projeto pai que utiliza esse modolo para funcionar a navegacao

import EarningsPeriodScreen from './EarningsPeriodScreen'
import EarningDetailScreen from './EarningDetailScreen'
import FilterScreen from './FilterScreen'

    const screens = {
        EarningsPeriodScreen: { screen: EarningsPeriodScreen },
        EarningDetailScreen: { screen: EarningDetailScreen },
        FilterScreen: { screen: FilterScreen }
    };

export default screens;