import React, { useState } from 'react';
import { MdMarkEmailUnread } from "react-icons/md";
import { FaFacebook } from "react-icons/fa6";
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaLinkedin } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaUserCog } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { FaListUl } from "react-icons/fa6";

import { BsFillTelephoneInboundFill } from "react-icons/bs";
import { Link } from 'react-router-dom';


const Header = () => {
   

            const [showShidebar, setShowSidebar] = useState(true);
            const user = true
        
            return (
                <div className='w-full bg-white'>
                    <div className='header-top bg-[#caddff] md-lg:hidden'>
                        <div className='w-[85%] lg:w-[90%] mx-auto'>
                            <div className='flex w-full justify-between items-center h-[50px] text-slate-500'>
                                <ul className='flex justify-start items-center gap-8 font-semibold text-black'>
                                    <li className='flex relative justify-center items-center gap-2 text-sm after:absolute after:h-[18px] after:w-[1px] after:bg-[#afafaf] after:-right-[16px]'>
                                        <span><MdMarkEmailUnread /></span>
                                        <span>support@gmail.com</span>
                                    </li>
                                    <li className='flex relative justify-center items-center gap-2 text-sm '>
                                        <span><BsFillTelephoneInboundFill  /></span>
                                        <span>+(123) 3243 343</span>
                                    </li> 
                                </ul>
                                <div>
                                    <div className='flex justify-center items-center gap-10'>
                                        <div className='flex justify-center items-center gap-4 text-black'>
                                            <a href="#"><FaFacebook /></a>
                                            <a href="#"><FaSquareXTwitter /> </a>
                                            <a href="#"><FaLinkedin /></a>
                                            <a href="#"><FaGithub /> </a> 
                                        </div>
                <div className='flex group cursor-pointer text-slate-800 text-sm justify-center items-center gap-1 relative after:h-[18px] after:w-[1px] after:bg-[#afafaf] after:-right-[16px] after:absolute before:absolute before:h-[18px] before:bg-[#afafaf] before:w-[1px] before:-left-[20px]'>
                    <img src="http://localhost:3000/images/language.png" alt="" />
                    <span><IoMdArrowDropdown /></span>
                    <ul className='absolute invisible transition-all top-12 rounded-sm duration-200 text-white p-2 w-[100px] flex flex-col gap-3 group-hover:visible group-hover:top-6 group-hover:bg-black z-10'>
                    <li>Hindi</li>
                    <li>English</li>
                    </ul>
                </div>
                {
                    user ? <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm text-black' to='/dashboard'>
                        <span> <FaUserCog/> </span>
                        <span>Kazi Ariyan </span>
                         </Link> : <Link className='flex cursor-pointer justify-center items-center gap-2 text-sm text-black' to='/login'>
                        <span> <IoIosLock /> </span>
                        <span>Login </span>
                         </Link>
                }
                 </div>
                 </div> 
                    </div> 
                </div> 
            </div>
            <div className='w-white'>
         <div className='w-[85%] lg:w-[90%] mx-auto'>
            <div className='h-[80px] md-lg:h-[100px] flex justify-between items-center flex-wrap'>
                <Link to='/'>
                    <img src="http://localhost:3000/images/logo.png" alt="" />
                </Link>
                <div className='justify-center items-center w-[30px] h-[30px] bg-white text-slate-600 border border-slate-600 rounded-sm cursor-pointer lg:hidden md-lg:flex xl:hidden hidden' onClick={() => setShowSidebar(false)}>
                    <span> <FaListUl/> </span>
                    </div>
            </div>

            </div>
        </div>



        </div>
  );
};
export default Header;