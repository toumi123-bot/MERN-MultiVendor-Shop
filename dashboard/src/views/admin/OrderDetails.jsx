import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { admin_order_status_update, decreaseProductStock, get_admin_order,increaseProductStock,messageClear} from '../../store/Reducers/OrderReducer';
import toast from 'react-hot-toast';
import { get_seller } from '../../store/Reducers/sellerReducer';
const OrderDetails = () => {
    const { orderId } = useParams() 
    const dispatch = useDispatch() 
    const [status, setStatus] = useState('')
    const { order,errorMessage,successMessage } = useSelector(state => state.order)
    // Sélectionner l'état de l'ordre
    const products = useSelector((state) => state.order.order.products);
    // Vérifier et récupérer l'ID du vendeur (sellerId)
    const sellerId = products?.[0]?.sellerId;

    const { seller } = useSelector(state => state.seller); // Récupérer le vendeur du store Redux
    
    // Suivre les produits ajustés avec un état local
    const [adjustedProducts, setAdjustedProducts] = useState({});
    useEffect(() => {
        setStatus(order?.delivery_status)
    },[order])
    useEffect(() => {
        dispatch(get_admin_order(orderId))
        if (sellerId) {
            dispatch(get_seller(sellerId)); // Déclencher la récupération du nom du vendeur
        }
    },[orderId , sellerId])
    
    const status_update = (e) => {
        const newStatus = e.target.value;
        dispatch(admin_order_status_update({ orderId, info: { status: newStatus } }));
        setStatus(newStatus);
    
        // Mise à jour des produits en fonction du statut
        order?.products?.forEach(product => {
            const alreadyAdjusted = adjustedProducts[product._id];

            // Si le statut est 'processing' ou 'placed', diminuer la quantité en stock une seule fois
            if ((newStatus === 'processing' || newStatus === 'placed') && !alreadyAdjusted) {
                dispatch(decreaseProductStock({ productId: product._id, quantity: product.quantity }));
                setAdjustedProducts(prev => ({ ...prev, [product._id]: true })); // Marquer comme ajusté
            }

            // Si le statut est différent de 'processing' ou 'placed', et que le stock a déjà été ajusté
            if (newStatus !== 'processing' && newStatus !== 'placed' && alreadyAdjusted) {
                dispatch(increaseProductStock({ productId: product._id, quantity: product.quantity }));
                setAdjustedProducts(prev => ({ ...prev, [product._id]: false })); // Marquer comme réajusté
            }
        });
    };
    useEffect(() => { 
        if (successMessage) {
            toast.success(successMessage)
            dispatch(messageClear())  
        } 
        if (errorMessage) {
            toast.error(errorMessage)
            dispatch(messageClear())  
        } 
    },[successMessage,errorMessage])

    return (
        <div className='px-2 lg:px-7 pt-5'>
        <div className='w-full p-4 bg-[#6a5fdf] rounded-md'>
            <div className='flex justify-between items-center p-4'>
                <h2 className='text-xl text-[#d0d2d6]'>Order Details</h2>
                <select onChange={status_update} value={status} name="" id="" className='px-4 py-2 focus:border-indigo-500 outline-none bg-[#475569] border border-slate-700 rounded-md text-[#d0d2d6]'>
                <option value="pending">pending</option>
                <option value="processing">processing</option>
                <option value="warehouse">warehouse</option>
                <option value="placed">placed</option>
                <option value="cancelled">cancelled</option>
                </select> 
            </div>

        <div className='p-4'>
            <div className='flex gap-2 text-lg text-[#d0d2d6]'>
            <h2>#{order._id}</h2>
            <span>{order.date}</span>
            </div>
            
            <div className='flex flex-wrap'>
                <div className='w-[30%]'>
                    <div className='pr-3 text-[#d0d2d6] text-lg'>
                        <div className='flex flex-col gap-1'>
                        <h2 className='pb-2 font-semibold'>Deliver To : {order.shippingInfo?.name} </h2>
                            <p><span className='text-sm'>
                                {order.shippingInfo?.address}
                                {order.shippingInfo?.province}
                                {order.shippingInfo?.city}
                                {order.shippingInfo?.area}</span></p> 
                        </div>
            <div className='flex justify-start items-center gap-3'>
                <h2>Payment Status: </h2>
                <span className='text-base'>{order.payment_status}</span>
             </div>  
             <span>Price : {order.price} TND </span>

            <div className='mt-4 flex flex-col gap-4 bg-[#8288ed] rounded-md'>
                <div className='text-[#d0d2d6]'>
                {
        order.products && order.products.map((p, i) =>  <div key={i} className='flex gap-3 text-md'>
        <img className='w-[50px] h-[50px]' src={p.images[0]} alt="" />
        <div>
            <h2>{p.name} </h2>
            <p>
                <span>Brand : </span>
                <span>{p.brand}</span>
                <span className='text-lg'>Quantity : {p.quantity} </span>
            </p>
        </div> 
    </div> )
    }    
               </div>
                </div>  




                    </div>
                </div> 

    <div className='w-[70%]'>
        <div className='pl-3'>
            <div className='mt-4 flex flex-col bg-[#8288ed] rounded-md p-4'>
            {
                order?.suborder?.map((o,i) => <div key={i + 20} className='text-[#d0d2d6] mt-2'>
                <div className='flex justify-start items-center gap-3'>
                <h2>
                                                    {seller ? (
                                                        <p>Seller Name: {seller.name}</p>
                                                    ) : (
                                                        <p>No Seller Name found</p>
                                                    )}
                                                </h2>
                                                <span>{o.delivery_status}</span>
                                            </div>
                {
                    o.products?.map((p,i) =>  <div className='flex gap-3 text-md mt-2'>
                    <img className='w-[50px] h-[50px]' src={p.images[0]} alt="" />
                    <div>
                        <h2>{p.name} </h2>
                        <p>
                            <span>Brand : </span>
                            <span>{p.brand}</span>
                            <span className='text-lg'>Quantity : {p.quantity} </span>
                        </p>
                    </div> 
                </div> )
                }
                 </div>)
            }   
 


            </div>

        </div>
        </div>            







            </div>


        </div>   
        </div> 
        </div>
    );
};


                
export default OrderDetails;