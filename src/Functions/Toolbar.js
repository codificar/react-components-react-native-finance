import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Icon from 'react-native-vector-icons/Feather';
import { Icon as ElementIcon } from 'react-native-elements';

import GLOBAL from './Global.js';

var { width } = Dimensions.get('window');

// Padronizado para o padrao ScreenHeader do app: inset superior via
// useSafeAreaInsets, linha de acoes de 56dp, alvo de toque de 48dp, icone
// Feather de 24dp a 16dp da borda, acessibilidade. Replicado localmente
// porque a lib nao pode importar App/Components. O ramo isMain (overlay +
// avatar) foi preservado intacto.
const ICON_SIZE = 24;
const TOUCH_SIZE = 48;
const EDGE = 16;

export default function Toolbar({ handlePress, nextPress, filterPress, helpPress, back = false, isMain = false, nextStep = false, isFilter = false, isHelp = false, img, PrimaryButton }) {
    const insets = useSafeAreaInsets();

    return (
        <>
            {!isMain ?
                <View style={{ paddingTop: insets.top }}>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={styles.target}
                            onPress={handlePress}
                            accessibilityRole="button"
                            accessibilityLabel="Voltar"
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Icon name="arrow-left" size={ICON_SIZE} color={"#000000"} />
                        </TouchableOpacity>
                        <View style={styles.rightArea}>
                            {
                                nextStep ?
                                    <TouchableOpacity style={styles.target} onPress={nextPress}>
                                        <Icon name="arrow-right" size={ICON_SIZE} color={"#000000"} />
                                    </TouchableOpacity> : null
                            }
                            {
                                isFilter ?
                                    <TouchableOpacity style={styles.target} onPress={filterPress}>
                                        <ElementIcon type='font-awesome' name='filter' size={ICON_SIZE} color={GLOBAL.color} />
                                    </TouchableOpacity> : null
                            }
                            {
                                isHelp ?
                                    <TouchableOpacity style={styles.target} onPress={helpPress}>
                                        <ElementIcon type='font-awesome' name='info-circle' size={ICON_SIZE} color={PrimaryButton} />
                                    </TouchableOpacity> : null
                            }
                        </View>
                    </View>
                </View>
                :
                //render toolbar in main
                !back ?
                    <>
                        <Image source={require('../img/overlay.png')} style={styles.principal} />
                        <TouchableOpacity style={styles.areaImage} onPress={handlePress}>
                            <Image source={{ uri: img }} style={styles.img} />
                        </TouchableOpacity>
                    </>
                    :
                    <>
                        <Image source={overlay} style={styles.principal} />
                        <TouchableOpacity style={styles.iconPress} onPress={handlePress}>
                            <Icon name="arrow-left" size={25} color={"#000000"} />
                        </TouchableOpacity>
                    </>
            }
        </>
    )
}

const styles = StyleSheet.create({
    row: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: EDGE - (TOUCH_SIZE - ICON_SIZE) / 2,
    },
    target: {
        width: TOUCH_SIZE,
        height: TOUCH_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightArea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    principal: {
        width: width,
        height: 90,
        position: "absolute",
        top: 0
    },
    iconPress: {
        position: "absolute",
        top: 10,
        left: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 55,
        height: 55,


    },
    areaImage: {
        position: "absolute",
        top: Platform.OS === 'android' ? 10 : 35,
        left: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: 55,
        height: 55,
        borderRadius: 45,
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 5,
        shadowColor: "#000",
        elevation: 3,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        padding: 3,
        borderColor: "#fff",
        borderWidth: 4
    },
    img: {
        height: 60,
        width: 60,

    },

});
