import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/api";




export const place_order = createAsyncThunk(
    'card/place_order',
    async( {price,products,shipping_fee,items,shippingInfo,userId,navigate}) => { 
        try {
            const { date } = await api.post('/home/order/place-order',{
                price,products,shipping_fee,items,shippingInfo,userId,navigate
            })
            console.log(date)
        } catch (error) {
            console.log(error.response)
        }
    }
)
// END METHOD






export const orderReducer = createSlice({
    name: 'order',
    initialState:{
        myOrders : [],
        errorMessage: '',
        shipping_fee: 0,
        myOrder : {}

    },
    reducers : {
        messageClear : (state,_) => {
            state.errorMessage = ""
            state.successMessage = ""
        }
    },
    extraReducers: (builder) => {
        
 

    }
})
export const {messageClear} = orderReducer.actions
export default orderReducer.reducer