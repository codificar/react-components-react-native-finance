import React, { Component } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
} from "react-native";

class GenericComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {

            route: this.props.route,
            providerId: this.props.providerId,
            token: this.props.token,

        }
    }

    componentDidMount() {
        console.log("Entered the screen")
    }

    render() {       
     
        return (
            <View style={styles.body}>
                <Text>{this.state.route}</Text>
                <Text>{this.state.providerId}</Text>
                <Text>{this.state.token}</Text>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    body: {
        flex: 1, 
        backgroundColor: 'white'
    }
});

export default GenericComponent;
