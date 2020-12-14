import Toast from "react-native-root-toast";

exports.showToast = function(msg, duration = 3000) { 
    Toast.show(msg, {
        duration: duration,
        position: Toast.positions.BOTTOM + 10,
        shadow: false,
        animation: true,
        hideOnPress: true,
        delay: 0
    });
}