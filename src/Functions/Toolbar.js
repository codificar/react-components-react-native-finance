import React from 'react'
import { View, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { Icon as ElementIcon } from 'react-native-elements';

import GLOBAL from './Global.js';

var { width } = Dimensions.get('window');

export default function Toolbar({ handlePress, nextPress, filterPress, helpPress, back = false, isMain = false, nextStep = false, isFilter = false, isHelp = false, img, PrimaryButton }) {

    return (
        <>
            {!isMain ?
                <View style={styles.principal2}>
                    <View style={{ height: 40 }}>
                        <TouchableOpacity style={{ marginLeft: 2, width: 60 }} onPress={handlePress}>
                            <Icon name="arrow-left" size={26} color={"#000000"} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                        {
                            nextStep ?
                                (<View style={{ height: 40 }}>
                                    <TouchableOpacity onPress={nextPress}>
                                        <Icon name="arrow-right" size={26} color={"#000000"} />
                                    </TouchableOpacity>
                                </View>) : null
                        }
                        {
                            isFilter ?
                                (<View style={{ height: 40, flexDirection: 'row' }}>
                                    <TouchableOpacity style={{ marginRight: 30 }} onPress={filterPress}>
                                        <ElementIcon type='font-awesome' name='filter' size={26} color={GLOBAL.color} />
                                    </TouchableOpacity>
                                </View>) : null
                        }
                        {
                            isHelp ?
                                (
                                    <View style={{ height: 40 }}>
                                        <TouchableOpacity onPress={helpPress}>
                                            <ElementIcon type='font-awesome' name='info-circle' size={25} color={PrimaryButton} />
                                        </TouchableOpacity>
                                    </View>
                                ) : null
                        }
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
    principal: {
        width: width,
        height: 90,
        position: "absolute",
        top: 0
    },
    principal2: {
        height: 40,
        width: "100%",
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        elevation: 1,
        paddingHorizontal: 25
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
