import React from 'react';
import { MdMarkEmailUnread } from "react-icons/md";

import { BsFillTelephoneInboundFill } from "react-icons/bs";


const Header = () => {
    return (
        <div className='w-full bg-white'>
            <div className='header-top bg-[#caddff] md-lg:hidden'>
                <div className='w-[85%] lg:w-[90%] mx-auto'>
                    <div className='flex w-full justify-between items-center h-[50px] text-slate-500'>
                        <ul className='flex justify-start items-center gap-8 font-semibold text-black'>
                            <li className='flex relative justify-center items-center gap-2 text-sm after:absolute after:h-[18px] after:w-[1px] after:bg-[#afafaf] after:-right-[16px]'>
                                <span><MdMarkEmailUnread /></span>
                                <span>support@bimastore.com</span>
                            </li>

                            <li className='flex relative justify-center items-center gap-2 text-sm '>
                                <span><BsFillTelephoneInboundFill  /></span>
                                <span>+(216) 99369965</span>
                            </li>

                        </ul>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default Header;