
import { ActivityIndicator,View } from "react-native";
import React from "react";
const StartScreen=() => {

    return(
        <View style={{flex:1,justifyContent:'center'}}>
            
            <ActivityIndicator size="large" />
        </View>
    );

}
export default StartScreen;