import React from "react";
import { BotMessageSquare, Sun } from "lucide-react";

const Navbar = () => {
  return (
    <>
      <div
        className="nav flex items-center justify-between px-[150px] h-[70px] 
        bg-gradient-to-r from-[#3A015C] to-[#11001C]"
        style={{ padding: "0px 100px" }}
      >
        <div className="logo flex items-center gap-[10px]">
          <BotMessageSquare size={40} color="#E2B0FF" />
          <span className="text-2xl font-bold text-[#F3E8FF] ml-2">
            Codeify
          </span>
        </div>
        {/* <div className="icons flex items-center gap-[20px]">
          <i className="cursor-pointer transition-all hover:text-[#E2B0FF] text-[#CBA1E3]">
            <Sun size={40} />
          </i>
        </div> */}
      </div>
    </>
  );
};

export default Navbar;
