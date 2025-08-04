import TestLogo from "../../assets/testLogo.svg";
import ProfilePhoto from "../../assets/ProfilePhoto.png";
import Setting from "../../assets/Settings.svg";
import More from "../../assets/More.svg";
import OverviewIcon from "../../assets/OverviewIcon.svg";
import PatientIcon from "../../assets/PatientsIcon.svg";
import ScheduleIcon from "../../assets/ScheduleIcon.svg";
import MessageIcon from "../../assets/Messageicon.svg";
import TransactionsIcon from "../../assets/TransactionsIcon.svg";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export const HeaderView = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Overview", icon: OverviewIcon },
    { name: "Patient", icon: PatientIcon },
    { name: "Schedule", icon: ScheduleIcon },
    { name: "Message", icon: MessageIcon },
    { name: "Transactions", icon: TransactionsIcon },
  ];

  return (
    <div className="flex justify-center w-full bg-gray-100">
      <header className="w-full max-w-[1564px] h-[72px] bg-white rounded-[70px] flex items-center px-4 md:px-6 lg:px-8 mx-[18px] my-[18px] shadow-[0px_1px_2px_#C8CCD41A]">
        {/* Логотип */}
        <div className="flex items-center min-w-[120px] md:min-w-[150px]">
          <img 
            src={TestLogo} 
            alt="Company Logo" 
            className="w-auto h-[32px] md:h-[40px] lg:h-[48px]" 
          />
        </div>
        
        {/* Бургер-меню */}
        <button 
          className="md:hidden p-2 ml-auto"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Навигация */}
        <nav className="hidden md:flex flex-1 justify-center mx-2 lg:mx-4 xl:mx-8">
          <ul className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
            {navItems.map((item) => (
              <li 
                key={item.name}
                className="flex items-center px-2 py-2 cursor-pointer hover:text-blue-500 whitespace-nowrap"
              >
                <img 
                  src={item.icon} 
                  alt={`${item.name} icon`} 
                  className="w-4 h-4 lg:w-5 lg:h-5 mr-1 lg:mr-2" 
                />
                <span className="text-xs md:text-sm lg:text-base">{item.name}</span>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Профиль и кнопки - переработанная секция */}
        <div className="hidden md:flex items-center ml-auto">
          <div className="flex items-center gap-2 lg:gap-3">
            <img 
              src={ProfilePhoto} 
              alt="Profile Photo" 
              className="w-8 h-8 lg:w-10 lg:h-10 rounded-full object-cover"
            />
            <div className="hidden lg:flex flex-col">
              <span className="font-medium text-sm truncate max-w-[120px]">
                Dr. Jose Simmons
              </span>
              <span className="text-gray-500 text-xs truncate max-w-[120px]">
                General Practitioner
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-3 lg:ml-4">
            <button className="p-1.5 rounded-full hover:bg-gray-100">
              <img src={Setting} alt="Settings" className="w-5 h-5" />
            </button>
            <button className="p-1.5 rounded-full hover:bg-gray-100">
              <img src={More} alt="More" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        {mobileMenuOpen && (
          <div className="absolute top-20 left-0 right-0 bg-white shadow-lg rounded-lg mx-4 py-2 z-50 md:hidden">
            <ul className="flex flex-col">
              {navItems.map((item) => (
                <li 
                  key={item.name}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <img 
                    src={item.icon} 
                    alt={`${item.name} icon`} 
                    className="w-5 h-5 mr-3" 
                  />
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
};